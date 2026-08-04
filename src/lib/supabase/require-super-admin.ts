import { createClient } from '@/lib/supabase/server'

// Confirma que quem está chamando a rota tem sessão válida E role
// super_admin — usado em toda rota de /api/admin antes de qualquer
// operação com o client service_role (que ignora RLS).
export async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (usuario?.role !== 'super_admin') return null
  return user
}

export function gerarSenhaProvisoria(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}
