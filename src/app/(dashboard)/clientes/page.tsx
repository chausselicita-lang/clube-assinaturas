'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { DataTable } from '@/components/shared/DataTable'
import { SearchBar } from '@/components/shared/SearchBar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clienteSchema, type ClienteForm } from '@/lib/validations'
import { fmtDate, fmtPhone } from '@/lib/utils/format'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Cliente } from '@/lib/types'

export default function ClientesPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('*').order('nome')
      return (data ?? []) as Cliente[]
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
  })

  function openNew() { setEditing(null); reset({}); setOpen(true) }
  function openEdit(c: Cliente) {
    setEditing(c)
    reset({ nome: c.nome, telefone: c.telefone, whatsapp: c.whatsapp, email: c.email, data_nascimento: c.data_nascimento, observacoes: c.observacoes })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async (data: ClienteForm) => {
      if (editing) {
        await supabase.from('clientes').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id)
      } else {
        await supabase.from('clientes').insert(data)
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setOpen(false) },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('clientes').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Clientes" subtitle={`${clientes.length} cadastrados`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou telefone..." className="max-w-xs" />
          <Button onClick={openNew} size="md">
            <Plus size={16} /> Novo Cliente
          </Button>
        </div>
        <Card>
          <DataTable<Cliente>
            loading={isLoading}
            keyField="id"
            data={filtered}
            columns={[
              { key: 'nome', header: 'Nome' },
              { key: 'telefone', header: 'Telefone', render: r => fmtPhone(r.telefone) },
              { key: 'email', header: 'E-mail', render: r => r.email || '—' },
              { key: 'data_nascimento', header: 'Nascimento', render: r => r.data_nascimento ? fmtDate(r.data_nascimento) : '—' },
              { key: 'created_at', header: 'Cadastro', render: r => fmtDate(r.created_at) },
              {
                key: 'acoes', header: '', className: 'w-24',
                render: r => (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                    <button onClick={() => remove.mutate(r.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                )
              },
            ]}
          />
        </Card>

        <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-4">
            <Input label="Nome completo" placeholder="João Silva" error={errors.nome?.message} {...register('nome')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Telefone" placeholder="(11) 99999-9999" error={errors.telefone?.message} {...register('telefone')} />
              <Input label="WhatsApp" placeholder="(11) 99999-9999" {...register('whatsapp')} />
            </div>
            <Input label="E-mail" type="email" placeholder="joao@email.com" error={errors.email?.message} {...register('email')} />
            <Input label="Data de nascimento" type="date" {...register('data_nascimento')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Observações</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
                placeholder="Informações adicionais..."
                {...register('observacoes')}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={isSubmitting}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
