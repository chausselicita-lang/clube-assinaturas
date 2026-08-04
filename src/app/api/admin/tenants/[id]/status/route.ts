import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/supabase/require-super-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSuperAdmin()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { status } = await request.json()
  if (status !== 'ativo' && status !== 'bloqueado') {
    return NextResponse.json({ error: 'status inválido' }, { status: 400 })
  }

  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('empresas').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
