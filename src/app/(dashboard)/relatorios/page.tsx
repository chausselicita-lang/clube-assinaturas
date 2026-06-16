'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate, fmtPercent, mesAno } from '@/lib/utils/format'
import { calcularMRR } from '@/lib/utils/comissao'
import { FileText, Download, Printer } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Assinatura, Comissao } from '@/lib/types'

type ReportType = 'assinaturas' | 'comissoes' | 'inadimplencia' | 'receita'

interface ProfissionalComissao {
  id: string
  nome: string
  funcao: string
  comissaoPercentual: number
  atendimentos: Array<{
    servico: string
    valor: number
  }>
  totalComissao: number
  totalAtendimentos: number
}

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
    .card { page-break-inside: avoid; }
    .total-row { background: #f9fafb; font-weight: bold; }
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
  const [comissoesData, setComissoesData] = useState<ProfissionalComissao[]>([])
  const [showComissoesVisuais, setShowComissoesVisuais] = useState(false)

  useEffect(() => {
    if (showComissoesVisuais) {
      carregarComissoes()
    }
  }, [mes, ano, showComissoesVisuais])

  async function carregarComissoes() {
    try {
      const { data: atendimentos } = await supabase
        .from('atendimentos')
        .select('*, profissionais(id, nome, funcao, comissao_percentual), servicos(nome), assinaturas(periodicidade, planos(valor_mensal, valor_semestral, valor_anual))')
        .gte('created_at', new Date(ano, mes - 1, 1).toISOString())
        .lt('created_at', new Date(ano, mes, 1).toISOString())

      const porProfissional: Record<string, ProfissionalComissao> = {} as any

      (atendimentos ?? []).forEach(a => {
        const prof = a.profissionais as { id: string; nome: string; funcao: string; comissao_percentual: number } | null
        if (!prof) return

        if (!porProfissional[prof.id]) {
          porProfissional[prof.id] = {
            id: prof.id,
            nome: prof.nome,
            funcao: prof.funcao,
            comissaoPercentual: prof.comissao_percentual,
            atendimentos: [],
            totalComissao: 0,
            totalAtendimentos: 0,
          }
        }

        const assinatura = a.assinaturas as { periodicidade: string; planos: { valor_mensal: number; valor_semestral: number; valor_anual: number } } | null
        const plano = assinatura?.planos
        const periodicidade = assinatura?.periodicidade || 'mensal'

        let valorPlano = 0
        if (plano) {
          valorPlano = periodicidade === 'mensal' ? plano.valor_mensal : periodicidade === 'semestral' ? plano.valor_semestral : plano.valor_anual
        }

        const comissao = (valorPlano * prof.comissao_percentual) / 100
        const servico = (a.servicos as { nome: string } | null)?.nome || 'Serviço'

        porProfissional[prof.id].atendimentos.push({ servico, valor: comissao })
        porProfissional[prof.id].totalComissao += comissao
        porProfissional[prof.id].totalAtendimentos++
      })

      setComissoesData(Object.values(porProfissional).sort((a, b) => b.totalComissao - a.totalComissao))
    } catch (error) {
      console.error('Erro ao carregar comissões:', error)
    }
  }

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
        await carregarComissoes()
        const totalGeral = comissoesData.reduce((s, p) => s + p.totalComissao, 0)
        const totalAtendimentos = comissoesData.reduce((s, p) => s + p.totalAtendimentos, 0)

        const html = `
          <h1>Clube+ — Relatório Mensal de Comissões</h1>
          <div class="sub">${mesAno(mes, ano)} · Gerado em ${fmtDate(new Date())}</div>

          ${comissoesData.map(prof => `
            <div class="card" style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #111;">${prof.nome}</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${prof.funcao} · ${prof.comissaoPercentual}% comissão</p>
              </div>

              <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <th style="text-align: left; padding: 6px 0; font-size: 11px; text-transform: uppercase; color: #666;">Serviço</th>
                    <th style="text-align: right; padding: 6px 0; font-size: 11px; text-transform: uppercase; color: #666;">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  ${prof.atendimentos.map(a => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 6px 0;">${a.servico}</td>
                      <td style="text-align: right; padding: 6px 0;">${fmtBRL(a.valor)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="padding-top: 12px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between;">
                <span style="font-size: 12px; color: #666;">Total de atendimentos: <strong>${prof.totalAtendimentos}</strong></span>
                <span style="font-size: 12px; color: #666;">Total: <strong style="color: #059669; font-size: 14px;">${fmtBRL(prof.totalComissao)}</strong></span>
              </div>
            </div>
          `).join('')}

          <div class="total-row" style="padding: 16px; background: #f9fafb; border-top: 3px solid #059669; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
              <span>Total Geral do Salão</span>
              <span style="color: #059669; font-size: 16px;">${fmtBRL(totalGeral)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 8px;">
              <span>${totalAtendimentos} atendimentos realizados</span>
              <span>${comissoesData.length} profissionais</span>
            </div>
          </div>`

        openPrintWindow(`Relatório de Comissões — ${mesAno(mes, ano)}`, html)
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
              <tr class="total-row"><td><strong>Total</strong></td><td><strong>${rows.length}</strong></td><td><strong>${fmtBRL(mrr)}</strong></td><td>100%</td></tr>
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

  const totalGeral = comissoesData.reduce((s, p) => s + p.totalComissao, 0)
  const totalAtendimentos = comissoesData.reduce((s, p) => s + p.totalAtendimentos, 0)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Relatórios" subtitle="Exporte, visualize e imprima" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtro período */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Período:</span>
          <select value={mes} onChange={e => setMes(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
          <select value={ano} onChange={e => setAno(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Cards de relatórios */}
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
                  onClick={() => {
                    if (r.id === 'comissoes') {
                      setShowComissoesVisuais(!showComissoesVisuais)
                    }
                    gerarRelatorio(r.id)
                  }}
                >
                  {r.id === 'comissoes' && showComissoesVisuais ? (
                    <>
                      <Printer size={14} /> Imprimir
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Gerar
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Visualização de comissões */}
        {showComissoesVisuais && (
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-gray-900">Clube+ Assinaturas</h1>
              <p className="text-lg text-gray-600 mt-2">Relatório Mensal de Comissões — {mesAno(mes, ano)}</p>
              <p className="text-sm text-gray-400 mt-1">Gerado em {fmtDate(new Date())}</p>
            </div>

            {/* Cards por profissional */}
            <div className="space-y-4">
              {comissoesData.map(prof => (
                <Card key={prof.id} className="border-l-4 border-l-violet-500">
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{prof.nome}</h3>
                        <p className="text-sm text-gray-500">{prof.funcao} • {prof.comissaoPercentual}% comissão</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{fmtBRL(prof.totalComissao)}</p>
                        <p className="text-xs text-gray-500">{prof.totalAtendimentos} atendimento(s)</p>
                      </div>
                    </div>

                    {prof.atendimentos.length > 0 && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">Serviços realizados</div>
                        <div className="space-y-1.5">
                          {prof.atendimentos.map((att, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">{att.servico}</span>
                              <span className="font-medium text-gray-900">{fmtBRL(att.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Rodapé com total geral */}
            {comissoesData.length > 0 && (
              <Card className="border-t-4 border-t-emerald-600 bg-gradient-to-r from-emerald-50 to-white">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Geral do Salão</p>
                      <p className="text-xs text-gray-500 mt-1">{totalAtendimentos} atendimentos • {comissoesData.length} profissionais</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-600">{fmtBRL(totalGeral)}</p>
                    </div>
                  </div>

                  <Button className="w-full mt-4" onClick={() => window.print()}>
                    <Printer size={16} /> Imprimir Relatório
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
