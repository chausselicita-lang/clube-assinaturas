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
import { servicoSchema, type ServicoForm } from '@/lib/validations'
import { fmtBRL, fmtPercent } from '@/lib/utils/format'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Servico } from '@/lib/types'

export default function ServicosPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const { data } = await supabase.from('servicos').select('*').order('nome')
      return (data ?? []) as Servico[]
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServicoForm>({
    resolver: zodResolver(servicoSchema) as any,
  })

  function openNew() { setEditing(null); reset({ creditos_necessarios: 1 }); setOpen(true) }
  function openEdit(s: Servico) {
    setEditing(s)
    reset({ nome: s.nome, valor_interno: s.valor_interno, comissao_percentual: s.comissao_percentual, creditos_necessarios: s.creditos_necessarios })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async (data: ServicoForm) => {
      if (editing) await supabase.from('servicos').update(data).eq('id', editing.id)
      else await supabase.from('servicos').insert(data)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servicos'] }); setOpen(false) },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('servicos').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['servicos'] }),
  })

  const filtered = servicos.filter(s => s.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Serviços" subtitle="Serviços consumidos nos atendimentos" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar serviço..." className="max-w-xs" />
          <Button onClick={openNew}><Plus size={16} /> Novo Serviço</Button>
        </div>

        <Card>
          <DataTable<Servico>
            loading={isLoading}
            keyField="id"
            data={filtered}
            columns={[
              { key: 'nome', header: 'Serviço' },
              { key: 'valor_interno', header: 'Valor Interno', render: r => fmtBRL(r.valor_interno) },
              { key: 'comissao_percentual', header: 'Comissão %', render: r => fmtPercent(r.comissao_percentual) },
              { key: 'creditos_necessarios', header: 'Créditos', render: r => `${r.creditos_necessarios} crédito(s)` },
              {
                key: 'comissao_valor', header: 'Comissão (R$)',
                render: r => (
                  <span className="text-emerald-600 font-medium">
                    {fmtBRL((r.valor_interno * r.comissao_percentual) / 100)}
                  </span>
                )
              },
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

        <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-4">
            <Input label="Nome do serviço" placeholder="Corte de cabelo" error={errors.nome?.message} {...register('nome')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Valor interno (R$)" type="number" step="0.01" placeholder="50.00" error={errors.valor_interno?.message} {...register('valor_interno')} />
              <Input label="Comissão (%)" type="number" step="0.1" placeholder="30" error={errors.comissao_percentual?.message} {...register('comissao_percentual')} />
            </div>
            <Input label="Créditos necessários" type="number" min="1" error={errors.creditos_necessarios?.message} {...register('creditos_necessarios')} />
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
