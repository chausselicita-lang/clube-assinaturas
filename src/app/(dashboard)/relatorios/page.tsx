'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate, fmtPercent, mesAno } from '@/lib/utils/format'
import { calcularMRR } from '@/lib/utils/comissao'
import { FileText, Download } from 'lucide-react'
import { useState } from 'react'
import type { Assinatura, Comissao } from '@/lib/types'

type ReportType = 'assinaturas' | 'comissoes' | 'inadimplencia' | 'receita'

const REPORTS = [
  { id: 'assinaturas' as ReportType, title: 'Relatório de Assinaturas', desc: 'Lista completa com status e valores', color: 'violet' },
  { id: 'comissoes' as ReportType, title: 'Relatório de Comissões', desc: 'Comissões por profissional no período', color: 'emerald' },
  { id: 'inadimplencia' as ReportType, title: 'Relatório de Inadimplência', desc: 'Assinantes com status inadimplente ou suspenso', color: 'orange' },
  { id: 'receita' as ReportType, title: 'Relatório de Receita (MRR)', desc: 'Receita recorrente mensal por plano', color: 'blue' },
]

function openPrintWindow(titulo: string, html: string) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><title>${titulo}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 32px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f4f4f8; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #555; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .ativa { background: #d1fae5; color: #065f46; }
    .cancelada { background: #fee2e2; color: #991b1b; }
    .inadimplente { background: #ffedd5; color: #9a3412; }
    .suspensa { background: #fef9c3; color: #854d0e; }
    @media print { body { padding: 0; } }
  </style></head><body>${html}</body></html>`)
  w.document.close()
  w.print()
}

export default function RelatoriosPage() {
  const supabase = createClient()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [loading, setLoading] = useState<ReportType | null>(null)

  async function gerarRelatorio(tipo: ReportType) {
    setLoading(tipo)
    try {
      if (tipo === 'assinaturas') {
        const { data } = await supabase.from('assinaturas').select('*, clientes(nome, telefone, email), planos(nome)').order('status')
        const rows = (data ?? []) as Assinatura[]
        const html = `
          <h1>Relatório de Assinaturas</h1>
          <div class="sub">Gerado em ${fmtDate(new Date())} · ${rows.length} registros</div>
          <table>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Status</th><th>Créditos</th><th>Próx. Cobrança</th><th>Valor</th></tr></thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td>${(r.clientes as { nome: string })?.nome || '—'}</td>
                  <td>${(r.clientes as { telefone: string })?.telefone || '—'}</td>
                  <td>${(r.planos as { nome: string })?.nome || '—'}</td>
                  <td><span class="badge ${r.status}">${r.status}</span></td>
                  <td>${r.creditos_disponiveis}/${r.creditos_totais}</td>
                  <td>${fmtDate(r.proxima_cobranca)}</td>
                  <td>${fmtBRL(r.valor_pago)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>`
        openPrintWindow('Relatório de Assinaturas', html)
      }

      if (tipo === 'comissoes') {
        const { data } = await supabase.from('comissoes').select('*, profissionais(nome, funcao), atendimentos(*, servicos(nome))').eq('periodo_mes', mes).eq('periodo_ano', ano)
        const rows = (data ?? []) as Comissao[]
        const porProfissional: Record<string, { nome: string; funcao: string; total: number; qtd: number }> = {}
        rows.forEach(r => {
          const id = r.profissional_id
          const p = r.profissionais as { nome: string; funcao: string } | undefined
          if (!porProfissional[id]) porProfissional[id] = { nome: p?.nome || '—', funcao: p?.funcao || '—', total: 0, qtd: 0 }
          porProfissional[id].total += r.valor
          porProfissional[id].qtd++
        })
        const html = `
          <h1>Relatório de Comissões — ${mesAno(mes, ano)}</h1>
          <div class="sub">Gerado em ${fmtDate(new Date())} · ${rows.length} atendimentos</div>
          <table>
            <thead><tr><th>Profissional</th><th>Função</th><th>Atendimentos</th><th>Total Comissão</th></tr></thead>
            <tbody>
              ${Object.values(porProfissional).map(p => `
                <tr>
                  <td>${p.nome}</td><td>${p.funcao}</td><td>${p.qtd}</td><td><strong>${fmtBRL(p.total)}</strong></td>
                </tr>
              `).join('')}
              <tr><td colspan="2"><strong>Total</strong></td><td><strong>${rows.length}</strong></td><td><strong>${fmtBRL(rows.reduce((s, r) => s + r.valor, 0))}</strong></td></tr>
            </tbody>
          </table>`
        openPrintWindow('Relatório de Comissões', html)
      }

      if (tipo === 'inadimplencia') {
        const { data } = await supabase.from('assinaturas').select('*, clientes(nome, telefone, whatsapp), planos(nome)').in('status', ['inadimplente', 'suspensa'])
        const rows = (data ?? []) as Assinatura[]
        const html = `
          <h1>Relatório de Inadimplência</h1>
          <div class="sub">Gerado em ${fmtDate(new Date())} · ${rows.length} assinantes</div>
          <table>
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Status</th><th>Última Renovação</th><th>Valor</th></tr></thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td>${(r.clientes as { nome: string })?.nome}</td>
                  <td>${(r.clientes as { telefone: string })?.telefone}</td>
                  <td>${(r.planos as { nome: string })?.nome}</td>
                  <td><span class="badge ${r.status}">${r.status}</span></td>
                  <td>${fmtDate(r.data_renovacao)}</td>
                  <td>${fmtBRL(r.valor_pago)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>`
        openPrintWindow('Relatório de Inadimplência', html)
      }

      if (tipo === 'receita') {
        const { data } = await supabase.from('assinaturas').select('*, planos(nome, valor_mensal)').eq('status', 'ativa')
        const rows = (data ?? []) as Assinatura[]
        const mrr = calcularMRR(rows)
        const porPlano: Record<string, { nome: string; count: number; receita: number }> = {}
        rows.forEach(r => {
          const p = r.planos as { nome: string } | undefined
          const nome = p?.nome || 'Sem plano'
          if (!porPlano[nome]) porPlano[nome] = { nome, count: 0, receita: 0 }
          porPlano[nome].count++
          const v = r.periodicidade === 'mensal' ? r.valor_pago : r.periodicidade === 'semestral' ? r.valor_pago / 6 : r.valor_pago / 12
          porPlano[nome].receita += v
        })
        const html = `
          <h1>Relatório de Receita — MRR</h1>
          <div class="sub">Gerado em ${fmtDate(new Date())} · MRR Total: ${fmtBRL(mrr)}</div>
          <table>
            <thead><tr><th>Plano</th><th>Assinantes Ativos</th><th>Receita Mensal</th><th>% do MRR</th></tr></thead>
            <tbody>
              ${Object.values(porPlano).map(p => `
                <tr>
                  <td>${p.nome}</td><td>${p.count}</td>
                  <td><strong>${fmtBRL(p.receita)}</strong></td>
                  <td>${mrr > 0 ? fmtPercent((p.receita / mrr) * 100) : '—'}</td>
                </tr>
              `).join('')}
              <tr><td><strong>Total</strong></td><td><strong>${rows.length}</strong></td><td><strong>${fmtBRL(mrr)}</strong></td><td>100%</td></tr>
            </tbody>
          </table>`
        openPrintWindow('Relatório de Receita MRR', html)
      }
    } finally {
      setLoading(null)
    }
  }

  const colorMap: Record<string, string> = {
    violet: 'border-t-violet-500',
    emerald: 'border-t-emerald-500',
    orange: 'border-t-orange-500',
    blue: 'border-t-blue-500',
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Relatórios" subtitle="Exporte e imprima" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtro período (para comissões) */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Período (comissões):</span>
          <select value={mes} onChange={e => setMes(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
          <select value={ano} onChange={e => setAno(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map(r => (
            <Card key={r.id} className={`border-t-4 ${colorMap[r.color]}`}>
              <CardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{r.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  loading={loading === r.id}
                  onClick={() => gerarRelatorio(r.id)}
                >
                  <Download size={14} /> Gerar PDF
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
