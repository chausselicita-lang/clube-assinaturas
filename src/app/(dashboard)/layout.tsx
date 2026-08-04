import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role, empresas(status)')
    .eq('id', user.id)
    .maybeSingle()

  if (usuario?.role === 'super_admin') redirect('/admin')

  const empresa = usuario?.empresas as unknown as { status: string } | null
  if (empresa?.status === 'bloqueado') redirect('/bloqueado')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
