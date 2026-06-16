import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Tag,
  FileText,
  ScanLine,
  UserCog,
  Wallet,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const ITENS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/planos', label: 'Planos', icon: Tag },
  { to: '/assinaturas', label: 'Assinaturas', icon: FileText },
  { to: '/checkin', label: 'Check-in', icon: ScanLine },
  { to: '/profissionais', label: 'Profissionais', icon: UserCog },
  { to: '/comissoes', label: 'Comissões', icon: Wallet },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-soft)]">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-bold text-white">
          C+
        </div>
        <span className="text-base font-bold text-[var(--color-text)]">Clube+</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {ITENS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-3 py-4">
        <div className="mb-2 px-3 text-xs text-[var(--color-text-muted)]">
          {usuario?.nome || usuario?.email}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-danger)]"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
