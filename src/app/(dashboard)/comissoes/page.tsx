'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate, mesAno } from '@/lib/utils/format'
import { TrendingUp, Lock } from 'lucide-react'
import { useState } from 'react'
import type { Comissao, Fechamento, Profissional } from '@/lib/types'

export default function ComissoesPage() {
  const supabase = createClient()
  const qc = useQueryClient()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())

  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ['comissoes', mes, ano],
    queryFn: async () => {
      const { data } = await supabase
        .from('comissoes')
        .select('*, profissionais(nome, funcao), atendimentos(*, servicos(nome), clientes(nome))')
        .eq('periodo_mes', mes)
        .eq('periodo_ano', ano)
        .order('created_at', { ascending: false })
      return (data ?? []) as Comissao[]
    },
  })

  const { data: fechamentos = [] } = useQuery({
    queryKey: ['fechamentos', mes, ano],
    queryFn: async () => {
      const { data } = await supabase
        .from('fechamentos')
        .select('*, profissionais(nome)')
        .eq('mes', mes)
        .eq('ano', ano)
      return (data ?? []) as Fechamento[]
    },
  })

  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => { const { data } = await supabase.from('profissionais').select('*').eq('ativo', true); return (data ?? []) as Profissional[] },
  })

  const fechar = useMutation({
    mutationFn: async (profissionalId: string) => {
      const comissoesProfissional = comissoes.filter(c => c.profissional_id === profissionalId && c.status === 'pendente')
      const total = comissoesProfissional.reduce((s, c) => s + c.valor, 0)

      await Promise.all([
        supabase.from('fechamentos').upsert({
          profissional_id: profissionalId,
          mes, ano,
          total_comissao: total,
          total_atendimentos: comissoesProfissional.length,
          status: 'fechado',
        }, { onConflict: 'profissional_id,mes,ano' }),
        supabase.from('comissoes').update({ status: 'pago' })
          .eq('profissional_id', profissionalId)
          .eq('periodo_mes', mes)
          .eq('periodo_ano', ano)
          .eq('status', 'pendente'),
      ])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comissoes', mes, ano] })
      qc.invalidateQueries({ queryKey: ['fechamentos', mes, ano] })
    },
  })

  const resumoPorProfissional = profissionais.map(p => {
    const cs = comissoes.filter(c => c.profissional_id === p.id)
    const pendentes = cs.filter(c => c.status === 'pendente')
    const fechamento = fechamentos.find(f => f.profissional_id === p.id)
    return {
      ...p,
      total: cs.reduce((s, c) => s + c.valor, 0),
      pendente: pendentes.reduce((s, c) => s + c.valor, 0),
      atendimentos: cs.length,
      fechado: !!fechamento && fechamento.status === 'fechado',
    }
  }).filter(p => p.atendimentos > 0)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Comissões" subtitle="Controle e fechamento mensal" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtro período */}
        <div className="flex items-center gap-3">
          <select
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-sm text-gray-500 font-medium">{mesAno(mes, ano)}</span>
        </div>

        {/* Resumo por profissional */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resumoPorProfissional.map(p => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{p.nome}</div>
                    <div className="text-xs text-gray-400">{p.funcao}</div>
                  </div>
                  {p.fechado ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      <Lock size={11} /> Fechado
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => fechar.mutate(p.id)}>
                      Fechar Mês
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Atendimentos</span>
                    <span className="font-medium">{p.atendimentos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total comissão</span>
                    <span className="font-semibold text-violet-700">{fmtBRL(p.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">A pagar</span>
                    <span className={`font-semibold ${p.pendente > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {fmtBRL(p.pendente)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {resumoPorProfissional.length === 0 && (
            <div className="col-span-3 py-10 text-center text-gray-400 text-sm">
              Nenhum atendimento registrado em {mesAno(mes, ano)}.
            </div>
          )}
        </div>

        {/* Detalhe das comissões */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp size={15} /> Detalhamento — {mesAno(mes, ano)}
            </h3>
          </CardHeader>
          <DataTable<Comissao>
            loading={isLoading}
            keyField="id"
            data={comissoes}
            columns={[
              { key: 'profissional', header: 'Profissional', render: r => (r.profissionais as { nome: string })?.nome || '—' },
              { key: 'cliente', header: 'Cliente', render: r => (r.atendimentos as { clientes: { nome: string } } | undefined)?.clientes?.nome || '—' },
              { key: 'servico', header: 'Serviço', render: r => (r.atendimentos as { servicos: { nome: string } } | undefined)?.servicos?.nome || '—' },
              { key: 'valor', header: 'Comissão', render: r => <span className="font-semibold text-emerald-600">{fmtBRL(r.valor)}</span> },
              {
                key: 'status', header: 'Status',
                render: r => (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {r.status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                )
              },
              { key: 'created_at', header: 'Data', render: r => fmtDate(r.created_at) },
            ]}
          />
        </Card>
      </main>
    </div>
  )
}
