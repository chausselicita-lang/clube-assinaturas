'use client'
import { LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
          <ShieldCheck size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Clube+ — Rede</div>
          <div className="text-xs text-gray-400">Painel super admin</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </header>
  )
}
