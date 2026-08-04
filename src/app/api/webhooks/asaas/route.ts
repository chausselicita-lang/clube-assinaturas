import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSubscription, type AsaasWebhookPayload } from '@/lib/asaas/client'

// Endpoint público (Asaas chama sem sessão de usuário) — autenticado pelo
// header 'asaas-access-token', configurado no painel do Asaas ao cadastrar
// esta URL como webhook. Confirma pagamento de assinatura e atualiza
// `pagamentos`/`assinaturas` no Supabase via service_role.
export async function POST(request: NextRequest) {
  const token = request.headers.get('asaas-access-token')
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = (await request.json()) as AsaasWebhookPayload
  const { event, payment } = payload
  const supabase = createAdminClient()

  let assinaturaId: string | null = null
  if (payment.subscription) {
    try {
      const subscription = await getSubscription(payment.subscription)
      assinaturaId = subscription.externalReference ?? null
    } catch {
      // segue sem assinaturaId — não há como reconciliar, apenas confirma o recebimento
    }
  }

  if (!assinaturaId) return NextResponse.json({ received: true, ignored: 'sem externalReference' })

  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('id, empresa_id, status')
    .eq('id', assinaturaId)
    .maybeSingle()

  if (!assinatura) return NextResponse.json({ received: true, ignored: 'assinatura não encontrada' })

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    const { data: pendente } = await supabase
      .from('pagamentos')
      .select('id')
      .eq('assinatura_id', assinaturaId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pendente) {
      await supabase.from('pagamentos').update({
        status: 'pago',
        gateway: 'asaas',
        gateway_id: payment.id,
        data_pagamento: payment.paymentDate ?? new Date().toISOString().split('T')[0],
      }).eq('id', pendente.id)
    } else {
      await supabase.from('pagamentos').insert({
        empresa_id: assinatura.empresa_id,
        assinatura_id: assinaturaId,
        valor: payment.value,
        metodo: 'pix',
        status: 'pago',
        gateway: 'asaas',
        gateway_id: payment.id,
        data_vencimento: payment.dueDate,
        data_pagamento: payment.paymentDate ?? new Date().toISOString().split('T')[0],
      })
    }

    if (assinatura.status === 'inadimplente' || assinatura.status === 'suspensa') {
      await supabase.from('assinaturas')
        .update({ status: 'ativa', updated_at: new Date().toISOString() })
        .eq('id', assinaturaId)
    }
  }

  if (event === 'PAYMENT_OVERDUE' && assinatura.status === 'ativa') {
    await supabase.from('assinaturas')
      .update({ status: 'inadimplente', updated_at: new Date().toISOString() })
      .eq('id', assinaturaId)
  }

  return NextResponse.json({ received: true })
}
