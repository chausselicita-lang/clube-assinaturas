import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
})

export const planoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  valor_mensal: z.coerce.number().min(0),
  valor_semestral: z.coerce.number().min(0),
  valor_anual: z.coerce.number().min(0),
  creditos_mensais: z.coerce.number().int().min(1),
  beneficios: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const profissionalSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  funcao: z.string().min(2, 'Função obrigatória'),
  comissao_percentual: z.coerce.number().min(0).max(100),
  ativo: z.boolean().default(true),
})

export const servicoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  valor_interno: z.coerce.number().min(0),
  comissao_percentual: z.coerce.number().min(0).max(100),
  creditos_necessarios: z.coerce.number().int().min(1).default(1),
})

export const assinaturaSchema = z.object({
  cliente_id: z.string().uuid('Cliente obrigatório'),
  plano_id: z.string().uuid('Plano obrigatório'),
  periodicidade: z.enum(['mensal', 'semestral', 'anual']),
  data_inicio: z.string().min(1, 'Data obrigatória'),
  valor_pago: z.coerce.number().min(0),
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  empresa_nome: z.string().min(2, 'Nome da empresa obrigatório'),
  nome: z.string().min(2, 'Seu nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type ClienteForm = z.infer<typeof clienteSchema>
export type PlanoForm = z.infer<typeof planoSchema>
export type ProfissionalForm = z.infer<typeof profissionalSchema>
export type ServicoForm = z.infer<typeof servicoSchema>
export type AssinaturaForm = z.infer<typeof assinaturaSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
