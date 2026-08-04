import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/supabase/require-super-admin'
import { createAdminClient } from '@/lib/supabase/admin'

// "Acessar como" gera uma sessão REAL do admin daquele tenant (magic link
// + troca de código PKCE em /auth/callback), em vez de só filtrar dados no
// client mantendo a sessão do super_admin — é esse desalinhamento (sessão
// real vs. dado mostrado) que causava gravação no tenant errado em outros
// projetos. Aqui, depois de "acessar como", o navegador PASSA A SER
// literalmente o admin daquele tenant; para voltar ao painel de rede,
// é preciso logar de novo como super_admin.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSuperAdmin()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: usuario } = await admin
    .from('usuarios')
    .select('email')
    .eq('empresa_id', id)
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!usuario) {
    return NextResponse.json({ error: 'Nenhum admin encontrado para esse tenant' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get('origin') ?? ''

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: usuario.email,
    options: { redirectTo: `${siteUrl}/auth/callback` },
  })

  if (error || !data?.properties?.action_link) {
    console.error('acessar-como: generateLink falhou', { siteUrl, email: usuario.email, error })
    return NextResponse.json({ error: error?.message ?? 'falha ao gerar link' }, { status: 400 })
  }

  console.log('acessar-como: link gerado', { siteUrl, email: usuario.email })
  return NextResponse.json({ link: data.properties.action_link })
}
