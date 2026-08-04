import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, gerarSenhaProvisoria } from '@/lib/supabase/require-super-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcularMRR } from '@/lib/utils/comissao'

export async function GET() {
  const user = await requireSuperAdmin()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: empresas } = await admin
    .from('empresas')
    .select('id, nome, status, plano_saas, created_at')
    .order('created_at', { ascending: false })

  const { data: assinaturas } = await admin
    .from('assinaturas')
    .select('empresa_id, status, valor_pago, periodicidade')

  const tenants = (empresas ?? []).map(e => {
    const doTenant = (assinaturas ?? []).filter(a => a.empresa_id === e.id)
    const ativas = doTenant.filter(a => a.status === 'ativa')
    return {
      ...e,
      assinantesAtivos: ativas.length,
      mrr: calcularMRR(ativas),
    }
  })

  return NextResponse.json({
    tenants,
    resumo: {
      totalTenants: tenants.length,
      tenantsAtivos: tenants.filter(t => t.status === 'ativo').length,
      mrrRede: tenants.reduce((s, t) => s + t.mrr, 0),
      assinantesAtivos: tenants.reduce((s, t) => s + t.assinantesAtivos, 0),
    },
  })
}

export async function POST(request: NextRequest) {
  const user = await requireSuperAdmin()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { empresaNome, adminNome, adminEmail } = await request.json()
  if (!empresaNome || !adminNome || !adminEmail) {
    return NextResponse.json({ error: 'empresaNome, adminNome e adminEmail são obrigatórios' }, { status: 400 })
  }

  const admin = createAdminClient()
  const senha = gerarSenhaProvisoria()

  const { data, error } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: adminNome, empresa_nome: empresaNome },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ userId: data.user?.id, email: adminEmail, senha })
}
