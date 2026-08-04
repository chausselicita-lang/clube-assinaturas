import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente com service_role — ignora RLS. Uso exclusivo em rotas de servidor
 * que não têm sessão de usuário (webhooks de gateway de pagamento, cron).
 * NUNCA importar isto em código que roda no browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
