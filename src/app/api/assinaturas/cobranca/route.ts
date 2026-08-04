import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { asaasConfigured, findCustomerByPhone, createCustomer, createSubscription } from '@/lib/asaas/client'

// Chamada pelo client depois de criar uma assinatura localmente (best-effort:
// se o Asaas não estiver configurado ainda, a assinatura continua existindo
// e a cobrança segue manual, como já era antes desta integração).
export async function POST(request: NextRequest) {
  if (!asaasConfigured()) {
    return NextResponse.json({ skipped: 'ASAAS_API_KEY não configurada' }, { status: 200 })
  }

  const { assinaturaId } = await request.json()
  if (!assinaturaId) return NextResponse.json({ error: 'assinaturaId obrigatório' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('id, empresa_id, periodicidade, valor_pago, proxima_cobranca, clientes(nome, telefone, email)')
    .eq('id', assinaturaId)
    .single()

  if (!assinatura) return NextResponse.json({ error: 'assinatura não encontrada' }, { status: 404 })

  const cliente = assinatura.clientes as unknown as { nome: string; telefone: string; email?: string }

  try {
    let customer = await findCustomerByPhone(cliente.telefone)
    if (!customer) {
      customer = await createCustomer({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email })
    }

    const subscription = await createSubscription({
      customerId: customer.id,
      valor: assinatura.valor_pago,
      periodicidade: assinatura.periodicidade,
      proximaCobranca: assinatura.proxima_cobranca,
      descricao: `Assinatura Clube+ — ${cliente.nome}`,
      assinaturaId: assinatura.id,
    })

    await supabase.from('pagamentos').insert({
      assinatura_id: assinatura.id,
      valor: assinatura.valor_pago,
      metodo: 'pix',
      status: 'pendente',
      gateway: 'asaas',
      gateway_id: subscription.id,
      data_vencimento: assinatura.proxima_cobranca,
    })

    return NextResponse.json({ ok: true, subscriptionId: subscription.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
