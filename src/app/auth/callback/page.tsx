'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// O link de "acessar como" (magic link do Admin API) volta com o token no
// FRAGMENTO da URL (#access_token=...), não em querystring — por isso essa
// troca só pode acontecer no client (fragmento nunca chega ao servidor).
// createClient() já processa o fragmento automaticamente ao inicializar
// (detectSessionInUrl); getSession() espera essa inicialização terminar
// antes de seguirmos, garantindo que o cookie de sessão já foi gravado.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(() => {
      router.replace('/')
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Entrando...
    </div>
  )
}
