export type UserRole = 'admin' | 'manager' | 'receptionist'
export type AssinaturaStatus = 'ativa' | 'suspensa' | 'cancelada' | 'inadimplente'
export type Periodicidade = 'mensal' | 'semestral' | 'anual'
export type PagamentoStatus = 'pendente' | 'pago' | 'falhou'
export type PagamentoMetodo = 'pix' | 'cartao' | 'boleto' | 'manual'
export type AtendimentoStatus = 'pendente' | 'concluido' | 'cancelado'
export type ComissaoStatus = 'pendente' | 'pago'
export type FechamentoStatus = 'aberto' | 'fechado'

export interface Empresa {
  id: string
  nome: string
  logo_url?: string
  plano_saas: string
  config: Record<string, unknown>
  created_at: string
}

export interface Usuario {
  id: string
  empresa_id: string
  nome: string
  email: string
  role: UserRole
  created_at: string
}

export interface Cliente {
  id: string
  empresa_id: string
  nome: string
  telefone: string
  whatsapp?: string
  email?: string
  data_nascimento?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Plano {
  id: string
  empresa_id: string
  nome: string
  valor_mensal: number
  valor_semestral: number
  valor_anual: number
  creditos_mensais: number
  servicos_permitidos: string[]
  beneficios: string[]
  ativo: boolean
  created_at: string
}

export interface Assinatura {
  id: string
  empresa_id: string
  cliente_id: string
  plano_id: string
  status: AssinaturaStatus
  periodicidade: Periodicidade
  data_inicio: string
  data_renovacao: string
  proxima_cobranca: string
  valor_pago: number
  creditos_disponiveis: number
  creditos_totais: number
  created_at: string
  updated_at: string
  clientes?: Cliente
  planos?: Plano
}

export interface Profissional {
  id: string
  empresa_id: string
  nome: string
  funcao: string
  comissao_percentual: number
  ativo: boolean
  created_at: string
}

export interface Servico {
  id: string
  empresa_id: string
  nome: string
  valor_interno: number
  comissao_percentual: number
  creditos_necessarios: number
  created_at: string
}

export interface Atendimento {
  id: string
  empresa_id: string
  cliente_id: string
  assinatura_id: string
  profissional_id: string
  servico_id: string
  creditos_consumidos: number
  valor_servico: number
  valor_comissao: number
  status: AtendimentoStatus
  created_at: string
  clientes?: Cliente
  profissionais?: Profissional
  servicos?: Servico
}

export interface Pagamento {
  id: string
  empresa_id: string
  assinatura_id: string
  valor: number
  metodo: PagamentoMetodo
  status: PagamentoStatus
  gateway?: string
  gateway_id?: string
  data_vencimento: string
  data_pagamento?: string
  created_at: string
  assinaturas?: Assinatura
}

export interface Comissao {
  id: string
  empresa_id: string
  profissional_id: string
  atendimento_id: string
  valor: number
  periodo_mes: number
  periodo_ano: number
  status: ComissaoStatus
  created_at: string
  profissionais?: Profissional
  atendimentos?: Atendimento
}

export interface Fechamento {
  id: string
  empresa_id: string
  profissional_id: string
  mes: number
  ano: number
  total_comissao: number
  total_atendimentos: number
  status: FechamentoStatus
  created_at: string
  profissionais?: Profissional
}

export interface DashboardStats {
  mrr: number
  assinantes_ativos: number
  assinantes_cancelados: number
  creditos_consumidos: number
  total_atendimentos: number
  ticket_medio: number
}
