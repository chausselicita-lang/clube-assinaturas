import { cn } from '@/lib/utils/cn'
import type { AssinaturaStatus } from '@/lib/types'

const statusConfig: Record<AssinaturaStatus, { label: string; className: string }> = {
  ativa: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700' },
  suspensa: { label: 'Suspensa', className: 'bg-yellow-100 text-yellow-700' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
  inadimplente: { label: 'Inadimplente', className: 'bg-orange-100 text-orange-700' },
}

export function StatusBadge({ status }: { status: AssinaturaStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600', className)}>
      {children}
    </span>
  )
}
