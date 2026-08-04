// Cliente para a API do Asaas (cobrança recorrente — Pix/cartão/boleto).
// Uso exclusivo em código de servidor: precisa de ASAAS_API_KEY, que nunca
// pode ser exposta ao browser (por isso não tem prefixo NEXT_PUBLIC_).
//
// Docs: https://docs.asaas.com/reference/visao-geral

const BASE_URL = process.env.ASAAS_ENV === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://api-sandbox.asaas.com/v3'

export function asaasConfigured(): boolean {
  return !!process.env.ASAAS_API_KEY
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!process.env.ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY não configurada')
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      access_token: process.env.ASAAS_API_KEY,
      ...init?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Asaas ${path} falhou: ${res.status} ${JSON.stringify(data)}`)
  }
  return data as T
}

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj?: string
}

export async function findCustomerByPhone(phone: string): Promise<AsaasCustomer | null> {
  const digits = phone.replace(/\D/g, '')
  const data = await asaasFetch<{ data: AsaasCustomer[] }>(`/customers?mobilePhone=${digits}`)
  return data.data[0] ?? null
}

export async function createCustomer(input: {
  nome: string
  telefone: string
  email?: string
  cpfCnpj?: string
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: input.nome,
      mobilePhone: input.telefone.replace(/\D/g, ''),
      email: input.email,
      cpfCnpj: input.cpfCnpj,
    }),
  })
}

export type AsaasCycle = 'MONTHLY' | 'SEMIANNUALLY' | 'YEARLY'

export function periodicidadeParaCiclo(periodicidade: string): AsaasCycle {
  if (periodicidade === 'semestral') return 'SEMIANNUALLY'
  if (periodicidade === 'anual') return 'YEARLY'
  return 'MONTHLY'
}

export interface AsaasSubscription {
  id: string
  customer: string
  status: string
  nextDueDate: string
}

export async function createSubscription(input: {
  customerId: string
  valor: number
  periodicidade: string
  proximaCobranca: string // YYYY-MM-DD
  descricao: string
  assinaturaId: string
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
}): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType ?? 'UNDEFINED',
      value: input.valor,
      nextDueDate: input.proximaCobranca,
      cycle: periodicidadeParaCiclo(input.periodicidade),
      description: input.descricao,
      externalReference: input.assinaturaId,
    }),
  })
}

export async function getSubscription(id: string): Promise<{ id: string; externalReference?: string }> {
  return asaasFetch(`/subscriptions/${id}`)
}

export interface AsaasWebhookPayload {
  event: string
  payment: {
    id: string
    subscription?: string
    customer: string
    value: number
    status: string
    dueDate: string
    paymentDate?: string
  }
}
