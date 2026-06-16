'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Users, CreditCard, ClipboardList,
  QrCode, Scissors, Wrench, TrendingUp, FileText, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checkin', label: 'Check-in', icon: QrCode },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/assinaturas', label: 'Assinaturas', icon: CreditCard },
  { href: '/planos', label: 'Planos', icon: ClipboardList },
  { href: '/profissionais', label: 'Profissionais', icon: Scissors },
  { href: '/servicos', label: 'Serviços', icon: Wrench },
  { href: '/comissoes', label: 'Comissões', icon: TrendingUp },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <Scissors size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Clube+</div>
          <div className="text-xs text-gray-400">Assinaturas</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={17} className={active ? 'text-violet-600' : 'text-gray-400'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  )
}
