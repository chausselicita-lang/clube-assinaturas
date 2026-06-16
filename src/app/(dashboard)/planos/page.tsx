'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { planoSchema, type PlanoForm } from '@/lib/validations'
import { fmtBRL } from '@/lib/utils/format'
import { Plus, Pencil, Trash2, CheckCircle2, CreditCard } from 'lucide-react'
import { useState } from 'react'
import type { Plano } from '@/lib/types'

export default function PlanosPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plano | null>(null)

  const { data: planos = [], isLoading } = useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      const { data } = await supabase.from('planos').select('*').order('valor_mensal')
      return (data ?? []) as Plano[]
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlanoForm>({
    resolver: zodResolver(planoSchema),
  })

  function openNew() { setEditing(null); reset({ ativo: true }); setOpen(true) }
  function openEdit(p: Plano) {
    setEditing(p)
    reset({ nome: p.nome, valor_mensal: p.valor_mensal, valor_semestral: p.valor_semestral, valor_anual: p.valor_anual, creditos_mensais: p.creditos_mensais, beneficios: p.beneficios?.join('\n'), ativo: p.ativo })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async (data: PlanoForm) => {
      const payload = {
        ...data,
        beneficios: data.beneficios ? data.beneficios.split('\n').map(s => s.trim()).filter(Boolean) : [],
      }
      if (editing) await supabase.from('planos').update(payload).eq('id', editing.id)
      else await supabase.from('planos').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['planos'] }); setOpen(false) },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from('planos').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planos'] }),
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Planos" subtitle="Configure os planos de assinatura" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={openNew}><Plus size={16} /> Novo Plano</Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {planos.map((p, i) => (
              <Card key={p.id} className={`border-t-4 ${i % 4 === 0 ? 'border-t-violet-500' : i % 4 === 1 ? 'border-t-blue-500' : i % 4 === 2 ? 'border-t-emerald-500' : 'border-t-orange-500'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{p.nome}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={14} /></button>
                      <button onClick={() => remove.mutate(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{p.creditos_mensais} créditos/mês</span>
                    {!p.ativo && <span className="ml-auto text-xs text-red-400 bg-red-50 px-1.5 py-0.5 rounded">Inativo</span>}
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mensal</span>
                      <span className="font-semibold">{fmtBRL(p.valor_mensal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Semestral</span>
                      <span className="font-semibold">{fmtBRL(p.valor_semestral)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Anual</span>
                      <span className="font-semibold">{fmtBRL(p.valor_anual)}</span>
                    </div>
                  </div>
                  {p.beneficios?.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      {p.beneficios.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
            {planos.length === 0 && (
              <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
                Nenhum plano cadastrado. Crie seu primeiro plano.
              </div>
            )}
          </div>
        )}

        <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Plano' : 'Novo Plano'} size="md">
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-4">
            <Input label="Nome do plano" placeholder="Plano Ouro" error={errors.nome?.message} {...register('nome')} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Mensal (R$)" type="number" step="0.01" error={errors.valor_mensal?.message} {...register('valor_mensal')} />
              <Input label="Semestral (R$)" type="number" step="0.01" {...register('valor_semestral')} />
              <Input label="Anual (R$)" type="number" step="0.01" {...register('valor_anual')} />
            </div>
            <Input label="Créditos por mês" type="number" error={errors.creditos_mensais?.message} {...register('creditos_mensais')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Benefícios <span className="text-gray-400 font-normal">(um por linha)</span></label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={4}
                placeholder="1 corte por mês&#10;Desconto em produtos&#10;Agendamento prioritário"
                {...register('beneficios')}
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo" {...register('ativo')} className="rounded" />
              <label htmlFor="ativo" className="text-sm text-gray-700">Plano ativo</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={isSubmitting}>{editing ? 'Salvar' : 'Criar Plano'}</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
