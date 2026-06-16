'use client'
import { Topbar } from '@/components/layout/Topbar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { TrendingUp, Users, UserX, CreditCard, Scissors, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate } from '@/lib/utils/format'
import { calcularMRR } from '@/lib/utils/comissao'
import { StatusBadge } from '@/components/ui/badge'
import type { Assinatura, Atendimento } from '@/lib/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

async function fetchDashboardData(supabase: ReturnType<typeof createClient>) {
  const [assinaturasRes, atendimentosRes, comissoesRes] = await Promise.all([
    supabase.from('assinaturas').select('*, clientes(nome), planos(nome)').order('created_at', { ascending: false }),
    supabase.from('atendimentos').select('*, clientes(nome), profissionais(nome), servicos(nome)').order('created_at', { ascending: false }).limit(10),
    supabase.from('comissoes').select('*, profissionais(nome)').eq('status', 'pendente'),
  ])
  return {
    assinaturas: (assinaturasRes.data ?? []) as Assinatura[],
    atendimentos: (atendimentosRes.data ?? []) as Atendimento[],
    comissoesPendentes: comissoesRes.data ?? [],
  }
}

export default function DashboardPage() {
  const supabase = createClient()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboardData(supabase),
  })

  const assinaturas = data?.assinaturas ?? []
  const atendimentos = data?.atendimentos ?? []

  const ativas = assinaturas.filter(a => a.status === 'ativa')
  const canceladas = assinaturas.filter(a => a.status === 'cancelada')
  const inadimplentes = assinaturas.filter(a => a.status === 'inadimplente')
  const mrr = calcularMRR(ativas)
  const creditosConsumidos = atendimentos.reduce((s, a) => s + (a.creditos_consumidos ?? 0), 0)
  const ticketMedio = ativas.length > 0 ? mrr / ativas.length : 0

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const mes = d.toLocaleDateString('pt-BR', { month: 'short' })
    const atend = atendimentos.filter(a => {
      const ad = new Date(a.created_at)
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
    }).length
    return { mes, atendimentos: atend }
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Dashboard" subtitle="Visão geral do negócio" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="text-sm text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              <KpiCard title="MRR" value={fmtBRL(mrr)} subtitle="Receita recorrente mensal" icon={TrendingUp} color="violet" />
              <KpiCard title="Assinantes Ativos" value={String(ativas.length)} subtitle={`${inadimplentes.length} inadimplentes`} icon={Users} color="emerald" />
              <KpiCard title="Cancelamentos" value={String(canceladas.length)} subtitle="Total histórico" icon={UserX} color="red" />
              <KpiCard title="Créditos Consumidos" value={String(creditosConsumidos)} subtitle="Últimos atendimentos" icon={CreditCard} color="blue" />
              <KpiCard title="Atendimentos" value={String(atendimentos.length)} subtitle="Últimos registros" icon={Scissors} color="orange" />
              <KpiCard title="Ticket Médio" value={fmtBRL(ticketMedio)} subtitle="Por assinante ativo" icon={DollarSign} color="violet" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Gráfico atendimentos */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-gray-700">Atendimentos — Últimos 6 meses</h3>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="atendimentos" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Assinaturas recentes */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-gray-700">Assinaturas Recentes</h3>
                </CardHeader>
                <CardBody className="p-0">
                  {assinaturas.slice(0, 6).map(a => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{(a.clientes as { nome: string })?.nome}</div>
                        <div className="text-xs text-gray-400">{(a.planos as { nome: string })?.nome} · {fmtDate(a.data_inicio)}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                  {assinaturas.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-400">Nenhuma assinatura cadastrada.</div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Atendimentos recentes */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-700">Últimos Atendimentos</h3>
              </CardHeader>
              <CardBody className="p-0">
                {atendimentos.slice(0, 8).map(a => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 flex-wrap gap-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{(a.clientes as { nome: string })?.nome}</div>
                      <div className="text-xs text-gray-400">{(a.servicos as { nome: string })?.nome} · {(a.profissionais as { nome: string })?.nome}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-violet-700">{fmtBRL(a.valor_comissao)}</div>
                      <div className="text-xs text-gray-400">{fmtDate(a.created_at)}</div>
                    </div>
                  </div>
                ))}
                {atendimentos.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">Nenhum atendimento registrado.</div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
