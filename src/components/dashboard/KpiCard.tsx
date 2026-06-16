import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color?: 'violet' | 'emerald' | 'orange' | 'blue' | 'red'
  trend?: { value: string; positive: boolean }
}

const colorMap = {
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', value: 'text-violet-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', value: 'text-orange-700' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
}

export function KpiCard({ title, value, subtitle, icon: Icon, color = 'violet', trend }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5 flex items-start justify-between')}>
      <div>
        <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
        <div className={cn('text-2xl font-bold', c.value)}>{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        {trend && (
          <div className={cn('text-xs mt-1 font-medium', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      <div className={cn('p-2.5 rounded-lg', c.icon)}>
        <Icon size={20} />
      </div>
    </div>
  )
}
