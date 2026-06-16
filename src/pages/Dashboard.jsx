import { useEffect, useState } from 'react'
import { DollarSign, Users, AlertTriangle, Ticket, Wallet, TrendingUp } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarMoeda } from '../lib/format'
import { calcularMRR } from '../lib/comissao'
import KpiCard from '../components/KpiCard'

export default function Dashboard() {
  const [carregando, setCarregando] = useState(true)
  const [kpis, setKpis] = useState({
    mrr: 0,
    assinantesAtivos: 0,
    inadimplentes: 0,
    creditosConsumidos: 0,
    comissoesAPagar: 0,
    ticketMedio: 0,
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    const [assinaturasRes, planosRes, atendimentosRes, comissoesRes] = await Promise.all([
      supabase.from('assinaturas').select('id, status, plano_id'),
      supabase.from('planos').select('id, valor, periodicidade'),
      supabase
        .from('atendimentos')
        .select('creditos_debitados')
        .gte('created_at', inicioDoMes()),
      supabase.from('comissoes').select('valor_total').eq('status', 'pendente'),
    ])

    const assinaturas = assinaturasRes.data || []
    const planos = planosRes.data || []
    const atendimentos = atendimentosRes.data || []
    const comissoes = comissoesRes.data || []

    const planosPorId = Object.fromEntries(planos.map((p) => [p.id, p]))
    const ativas = assinaturas.filter((a) => a.status === 'ativa')
    const inadimplentes = assinaturas.filter((a) => a.status === 'inadimplente')

    const mrr = calcularMRR(assinaturas, planosPorId)
    const creditosConsumidos = atendimentos.reduce((acc, a) => acc + (a.creditos_debitados || 0), 0)
    const comissoesAPagar = comissoes.reduce((acc, c) => acc + Number(c.valor_total || 0), 0)
    const ticketMedio = ativas.length > 0 ? mrr / ativas.length : 0

    setKpis({
      mrr,
      assinantesAtivos: ativas.length,
      inadimplentes: inadimplentes.length,
      creditosConsumidos,
      comissoesAPagar,
      ticketMedio,
    })
    setCarregando(false)
  }

  function inicioDoMes() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">Visão geral do negócio</p>

      {carregando ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando indicadores...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="MRR" valor={formatarMoeda(kpis.mrr)} icon={DollarSign} cor="#6c63ff" />
          <KpiCard
            label="Assinantes Ativos"
            valor={kpis.assinantesAtivos}
            icon={Users}
            cor="#2ecc8f"
          />
          <KpiCard
            label="Inadimplentes"
            valor={kpis.inadimplentes}
            icon={AlertTriangle}
            cor="#ef4d6c"
          />
          <KpiCard
            label="Créditos Consumidos"
            valor={kpis.creditosConsumidos}
            icon={Ticket}
            cor="#f5a623"
          />
          <KpiCard
            label="Comissões a Pagar"
            valor={formatarMoeda(kpis.comissoesAPagar)}
            icon={Wallet}
            cor="#8a83ff"
          />
          <KpiCard
            label="Ticket Médio"
            valor={formatarMoeda(kpis.ticketMedio)}
            icon={TrendingUp}
            cor="#2ecc8f"
          />
        </div>
      )}
    </div>
  )
}
