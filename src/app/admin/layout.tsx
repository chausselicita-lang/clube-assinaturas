import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (usuario?.role !== 'super_admin') redirect('/')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AdminHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
