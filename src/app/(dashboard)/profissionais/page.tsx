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
import { profissionalSchema, type ProfissionalForm } from '@/lib/validations'
import { fmtPercent } from '@/lib/utils/format'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Profissional } from '@/lib/types'

export default function ProfissionaisPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Profissional | null>(null)

  const { data: profissionais = [], isLoading } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data } = await supabase.from('profissionais').select('*').order('nome')
      return (data ?? []) as Profissional[]
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfissionalForm>({
    resolver: zodResolver(profissionalSchema) as any,
  })

  function openNew() { setEditing(null); reset({ ativo: true }); setOpen(true) }
  function openEdit(p: Profissional) {
    setEditing(p)
    reset({ nome: p.nome, funcao: p.funcao, comissao_percentual: p.comissao_percentual, ativo: p.ativo })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async (data: ProfissionalForm) => {
      if (editing) await supabase.from('profissionais').update(data).eq('id', editing.id)
      else await supabase.from('profissionais').insert(data)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profissionais'] }); setOpen(false) },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('profissionais').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profissionais'] }),
  })

  const filtered = profissionais.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.funcao.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Profissionais" subtitle={`${profissionais.length} cadastrados`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou função..." className="max-w-xs" />
          <Button onClick={openNew}><Plus size={16} /> Novo Profissional</Button>
        </div>

        <Card>
          <DataTable<Profissional>
            loading={isLoading}
            keyField="id"
            data={filtered}
            columns={[
              { key: 'nome', header: 'Nome' },
              { key: 'funcao', header: 'Função' },
              {
                key: 'comissao_percentual', header: 'Comissão',
                render: r => (
                  <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    {fmtPercent(r.comissao_percentual)}
                  </span>
                )
              },
              {
                key: 'ativo', header: 'Status',
                render: r => (
                  <span className={`text-xs font-medium ${r.ativo ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {r.ativo ? 'Ativo' : 'Inativo'}
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

        <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Profissional' : 'Novo Profissional'}>
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-4">
            <Input label="Nome" placeholder="João Barbeiro" error={errors.nome?.message} {...register('nome')} />
            <Input label="Função" placeholder="Barbeiro, Manicure, Esteticista..." error={errors.funcao?.message} {...register('funcao')} />
            <Input label="Comissão (%)" type="number" step="0.1" placeholder="30" error={errors.comissao_percentual?.message} {...register('comissao_percentual')} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo_p" {...register('ativo')} className="rounded" />
              <label htmlFor="ativo_p" className="text-sm text-gray-700">Profissional ativo</label>
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
