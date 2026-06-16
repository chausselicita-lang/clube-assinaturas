'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { DataTable } from '@/components/shared/DataTable'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assinaturaSchema, type AssinaturaForm } from '@/lib/validations'
import { fmtBRL, fmtDate } from '@/lib/utils/format'
import { Plus, CreditCard } from 'lucide-react'
import { useState } from 'react'
import type { Assinatura, AssinaturaStatus, Cliente, Plano } from '@/lib/types'

const STATUS_OPTIONS: AssinaturaStatus[] = ['ativa', 'suspensa', 'inadimplente', 'cancelada']

export default function AssinaturasPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Assinatura | null>(null)

  const { data: assinaturas = [], isLoading } = useQuery({
    queryKey: ['assinaturas'],
    queryFn: async () => {
      const { data } = await supabase.from('assinaturas').select('*, clientes(nome, telefone), planos(nome, creditos_mensais)').order('created_at', { ascending: false })
      return (data ?? []) as Assinatura[]
    },
  })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => { const { data } = await supabase.from('clientes').select('id, nome').order('nome'); return (data ?? []) as Cliente[] },
  })

  const { data: planos = [] } = useQuery({
    queryKey: ['planos'],
    queryFn: async () => { const { data } = await supabase.from('planos').select('*').eq('ativo', true).order('valor_mensal'); return (data ?? []) as Plano[] },
  })

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AssinaturaForm>({
    resolver: zodResolver(assinaturaSchema) as any,
    defaultValues: { periodicidade: 'mensal' },
  })

  const periodicidade = watch('periodicidade')
  const planoId = watch('plano_id')
  const planoSelecionado = planos.find(p => p.id === planoId)

  const valorSugerido = planoSelecionado
    ? periodicidade === 'mensal' ? planoSelecionado.valor_mensal
      : periodicidade === 'semestral' ? planoSelecionado.valor_semestral
        : planoSelecionado.valor_anual
    : 0

  function openNew() {
    setEditing(null)
    reset({ periodicidade: 'mensal', data_inicio: new Date().toISOString().split('T')[0] })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async (data: AssinaturaForm) => {
      const plano = planos.find(p => p.id === data.plano_id)
      const inicio = new Date(data.data_inicio)
      const renovacao = new Date(inicio)
      if (data.periodicidade === 'mensal') renovacao.setMonth(renovacao.getMonth() + 1)
      else if (data.periodicidade === 'semestral') renovacao.setMonth(renovacao.getMonth() + 6)
      else renovacao.setFullYear(renovacao.getFullYear() + 1)

      const payload = {
        ...data,
        status: 'ativa' as AssinaturaStatus,
        data_renovacao: renovacao.toISOString().split('T')[0],
        proxima_cobranca: renovacao.toISOString().split('T')[0],
        creditos_disponiveis: plano?.creditos_mensais ?? 0,
        creditos_totais: plano?.creditos_mensais ?? 0,
      }

      if (editing) await supabase.from('assinaturas').update(payload).eq('id', editing.id)
      else await supabase.from('assinaturas').insert(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assinaturas'] }); setOpen(false) },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AssinaturaStatus }) => {
      await supabase.from('assinaturas').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assinaturas'] }),
  })

  const filtered = assinaturas.filter(a => {
    const cliente = a.clientes as { nome: string; telefone: string } | undefined
    const matchSearch = !search || cliente?.nome.toLowerCase().includes(search.toLowerCase()) || cliente?.telefone.includes(search)
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Assinaturas" subtitle={`${assinaturas.filter(a => a.status === 'ativa').length} ativas`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..." className="w-56" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Todos os status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <Button onClick={openNew}><Plus size={16} /> Nova Assinatura</Button>
        </div>

        <Card>
          <DataTable<Assinatura>
            loading={isLoading}
            keyField="id"
            data={filtered}
            columns={[
              { key: 'cliente', header: 'Cliente', render: r => (r.clientes as { nome: string })?.nome || '—' },
              { key: 'plano', header: 'Plano', render: r => (r.planos as { nome: string })?.nome || '—' },
              { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
              {
                key: 'creditos', header: 'Créditos',
                render: r => (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                      <div
                        className="h-1.5 bg-violet-500 rounded-full"
                        style={{ width: `${r.creditos_totais > 0 ? (r.creditos_disponiveis / r.creditos_totais) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{r.creditos_disponiveis}/{r.creditos_totais}</span>
                  </div>
                )
              },
              { key: 'proxima_cobranca', header: 'Próx. Cobrança', render: r => fmtDate(r.proxima_cobranca) },
              { key: 'valor_pago', header: 'Valor', render: r => fmtBRL(r.valor_pago) },
              {
                key: 'acoes', header: '', className: 'w-32',
                render: r => (
                  <select
                    value={r.status}
                    onChange={e => updateStatus.mutate({ id: r.id, status: e.target.value as AssinaturaStatus })}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                )
              },
            ]}
          />
        </Card>

        <Modal open={open} onClose={() => setOpen(false)} title="Nova Assinatura" size="md">
          <form onSubmit={handleSubmit(d => save.mutate(d))} className="space-y-4">
            <Select label="Cliente" error={errors.cliente_id?.message} {...register('cliente_id')}>
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Select label="Plano" error={errors.plano_id?.message} {...register('plano_id')}>
              <option value="">Selecione o plano...</option>
              {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
            <Select label="Periodicidade" {...register('periodicidade')}>
              <option value="mensal">Mensal</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Data de início" type="date" error={errors.data_inicio?.message} {...register('data_inicio')} />
              <div>
                <Input
                  label="Valor pago (R$)"
                  type="number"
                  step="0.01"
                  placeholder={valorSugerido > 0 ? String(valorSugerido) : '0.00'}
                  error={errors.valor_pago?.message}
                  {...register('valor_pago')}
                />
                {valorSugerido > 0 && (
                  <span className="text-xs text-gray-400">Sugerido: {fmtBRL(valorSugerido)}</span>
                )}
              </div>
            </div>
            {planoSelecionado && (
              <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3 text-xs text-violet-700">
                <CreditCard size={13} className="inline mr-1" />
                {planoSelecionado.creditos_mensais} créditos serão adicionados ao ativar
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={isSubmitting}>Criar Assinatura</Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
