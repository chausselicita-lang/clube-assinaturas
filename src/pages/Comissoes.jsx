import { useEffect, useMemo, useState } from 'react'
import { Wallet, CheckCircle2, Trophy, Users, Eye, BadgeCheck, Coins, Printer } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarMoeda, formatarData, formatarHora } from '../lib/format'
import {
  limitesMesAtual,
  limitesMesAnterior,
  checkinNoPeriodo,
  calcularComissaoProfissional,
  STATUS_PAGAMENTO,
} from '../lib/comissoes'
import KpiCard from '../components/KpiCard'
import Modal from '../components/Modal'

const PERIODOS = [
  { value: 'mes_atual', label: 'Mês atual' },
  { value: 'mes_anterior', label: 'Mês anterior' },
  { value: 'personalizado', label: 'Período personalizado' },
]

export default function Comissoes() {
  const [profissionais, setProfissionais] = useState([])
  const [checkins, setCheckins] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes_atual')
  const [personalizadoDe, setPersonalizadoDe] = useState('')
  const [personalizadoAte, setPersonalizadoAte] = useState('')

  const [detalhe, setDetalhe] = useState(null)
  const [parcialAlvo, setParcialAlvo] = useState(null)
  const [valorParcial, setValorParcial] = useState('')
  const [observacaoParcial, setObservacaoParcial] = useState('')

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    const [profissionaisRes, checkinsRes, pagamentosRes] = await Promise.all([
      supabase.from('profissionais').select('*').order('nome'),
      supabase
        .from('checkins')
        .select('*, cliente:clientes(nome), assinatura:assinaturas(plano:planos(nome, valor))')
        .order('data_hora', { ascending: false }),
      supabase.from('pagamentos_comissao').select('*'),
    ])
    setProfissionais(profissionaisRes.data || [])
    setCheckins(checkinsRes.data || [])
    setPagamentos(pagamentosRes.data || [])
    setCarregando(false)
  }

  const periodo = useMemo(() => {
    if (periodoSelecionado === 'mes_atual') return limitesMesAtual()
    if (periodoSelecionado === 'mes_anterior') return limitesMesAnterior()
    return { inicio: personalizadoDe, fim: personalizadoAte }
  }, [periodoSelecionado, personalizadoDe, personalizadoAte])

  const periodoValido = Boolean(periodo.inicio && periodo.fim)

  const linhas = useMemo(() => {
    if (!periodoValido) return []
    return profissionais.map((p) => {
      const checkinsDoProfissional = checkins.filter(
        (c) => c.profissional_id === p.id && checkinNoPeriodo(c, periodo.inicio, periodo.fim),
      )
      const { atendimentos, valorBase, valorComissao } = calcularComissaoProfissional(
        checkinsDoProfissional,
        p.percentual_comissao,
      )
      const pagamento = pagamentos.find(
        (pg) =>
          pg.profissional_id === p.id &&
          pg.periodo_inicio === periodo.inicio &&
          pg.periodo_fim === periodo.fim,
      )
      const status = pagamento?.status || 'pendente'
      const valorPago = pagamento && pagamento.status !== 'pendente' ? Number(pagamento.valor_comissao) : 0

      return {
        profissional: p,
        checkins: checkinsDoProfissional,
        atendimentos,
        valorBase,
        valorComissao,
        status,
        valorPago,
        pagamento,
      }
    })
  }, [profissionais, checkins, pagamentos, periodo, periodoValido])

  const kpis = useMemo(() => {
    const mesAtual = limitesMesAtual()
    let aPagarMes = 0
    let pagoMes = 0
    let maiorComissao = { nome: '—', valor: -1 }

    profissionais.forEach((p) => {
      const checkinsDoMes = checkins.filter(
        (c) => c.profissional_id === p.id && checkinNoPeriodo(c, mesAtual.inicio, mesAtual.fim),
      )
      const { valorComissao } = calcularComissaoProfissional(checkinsDoMes, p.percentual_comissao)
      const pagamento = pagamentos.find(
        (pg) =>
          pg.profissional_id === p.id &&
          pg.periodo_inicio === mesAtual.inicio &&
          pg.periodo_fim === mesAtual.fim,
      )
      const pago = pagamento && pagamento.status !== 'pendente' ? Number(pagamento.valor_comissao) : 0
      const aPagar = pagamento?.status === 'pago' ? 0 : Math.max(valorComissao - pago, 0)

      aPagarMes += aPagar
      pagoMes += pago
      if (valorComissao > maiorComissao.valor) maiorComissao = { nome: p.nome, valor: valorComissao }
    })

    const atendimentosNoPeriodo = periodoValido
      ? checkins.filter((c) => checkinNoPeriodo(c, periodo.inicio, periodo.fim)).length
      : 0

    return {
      aPagarMes,
      pagoMes,
      destaque: maiorComissao.nome,
      atendimentosNoPeriodo,
    }
  }, [profissionais, checkins, pagamentos, periodo, periodoValido])

  async function upsertPagamento(linha, dados) {
    const { profissional, atendimentos, valorBase } = linha
    const payload = {
      profissional_id: profissional.id,
      periodo_inicio: periodo.inicio,
      periodo_fim: periodo.fim,
      total_atendimentos: atendimentos,
      valor_total: valorBase,
      data_pagamento: new Date().toISOString(),
      ...dados,
    }

    if (linha.pagamento) {
      await supabase.from('pagamentos_comissao').update(payload).eq('id', linha.pagamento.id)
    } else {
      await supabase.from('pagamentos_comissao').insert(payload)
    }
    carregarTudo()
  }

  async function marcarComoPago(linha) {
    if (!confirm(`Marcar comissão de ${linha.profissional.nome} como paga?`)) return
    await upsertPagamento(linha, { valor_comissao: linha.valorComissao, status: 'pago' })
  }

  function abrirPagamentoParcial(linha) {
    setParcialAlvo(linha)
    setValorParcial('')
    setObservacaoParcial('')
  }

  async function confirmarPagamentoParcial(e) {
    e.preventDefault()
    const valor = Number(valorParcial)
    if (!valor || valor <= 0) return
    await upsertPagamento(parcialAlvo, {
      valor_comissao: valor,
      status: 'parcial',
      observacao: observacaoParcial || null,
    })
    setParcialAlvo(null)
  }

  function imprimirExtrato() {
    window.print()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Comissões</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Resumo por profissional e fechamento de pagamentos
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Comissões a Pagar no Mês"
          valor={formatarMoeda(kpis.aPagarMes)}
          icon={Wallet}
          cor="#ef4d6c"
        />
        <KpiCard
          label="Já Pago no Mês"
          valor={formatarMoeda(kpis.pagoMes)}
          icon={CheckCircle2}
          cor="#2ecc8f"
        />
        <KpiCard label="Maior Comissão" valor={kpis.destaque} icon={Trophy} cor="#f5a623" />
        <KpiCard
          label="Atendimentos no Período"
          valor={kpis.atendimentosNoPeriodo}
          icon={Users}
          cor="#6c63ff"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Campo label="Período">
          <select
            className="input-base"
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Campo>
        {periodoSelecionado === 'personalizado' && (
          <>
            <Campo label="De">
              <input
                type="date"
                className="input-base"
                value={personalizadoDe}
                onChange={(e) => setPersonalizadoDe(e.target.value)}
              />
            </Campo>
            <Campo label="Até">
              <input
                type="date"
                className="input-base"
                value={personalizadoAte}
                onChange={(e) => setPersonalizadoAte(e.target.value)}
              />
            </Campo>
          </>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Profissional</th>
              <th className="px-4 py-3 font-medium">Especialidade</th>
              <th className="px-4 py-3 font-medium">Atendimentos</th>
              <th className="px-4 py-3 font-medium">Valor Base</th>
              <th className="px-4 py-3 font-medium">% Comissão</th>
              <th className="px-4 py-3 font-medium">A Receber</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && !periodoValido && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Selecione um período válido.
                </td>
              </tr>
            )}
            {!carregando && periodoValido && linhas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Nenhum profissional cadastrado.
                </td>
              </tr>
            )}
            {periodoValido &&
              linhas.map((linha) => {
                const cfg = STATUS_PAGAMENTO[linha.status]
                return (
                  <tr
                    key={linha.profissional.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {linha.profissional.nome}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {linha.profissional.especialidade || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{linha.atendimentos}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {formatarMoeda(linha.valorBase)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {linha.profissional.percentual_comissao}%
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {formatarMoeda(linha.valorComissao)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: `${cfg.cor}1a`, color: cfg.cor }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Ver detalhes"
                          onClick={() => setDetalhe(linha)}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                        >
                          <Eye size={16} />
                        </button>
                        {linha.status !== 'pago' && (
                          <button
                            title="Marcar como pago"
                            onClick={() => marcarComoPago(linha)}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-success)]"
                          >
                            <BadgeCheck size={16} />
                          </button>
                        )}
                        {linha.status !== 'pago' && (
                          <button
                            title="Registrar pagamento parcial"
                            onClick={() => abrirPagamentoParcial(linha)}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-warning)]"
                          >
                            <Coins size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <Modal titulo={`Detalhes da comissão — ${detalhe.profissional.nome}`} onClose={() => setDetalhe(null)}>
          <div className="flex flex-col gap-4">
            <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Cliente</th>
                    <th className="px-3 py-2 font-medium">Plano</th>
                    <th className="px-3 py-2 font-medium">Valor do Plano</th>
                    <th className="px-3 py-2 font-medium">% Comissão</th>
                    <th className="px-3 py-2 font-medium">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhe.checkins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-[var(--color-text-muted)]">
                        Nenhum atendimento no período.
                      </td>
                    </tr>
                  )}
                  {detalhe.checkins.map((c) => {
                    const valorPlano = c.assinatura?.plano?.valor || 0
                    const valorComissao = Number(
                      ((valorPlano * detalhe.profissional.percentual_comissao) / 100).toFixed(2),
                    )
                    return (
                      <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">
                          {formatarData(c.data_hora)} {formatarHora(c.data_hora)}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text)]">{c.cliente?.nome || '—'}</td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">
                          {c.assinatura?.plano?.nome || '—'}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">
                          {formatarMoeda(valorPlano)}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text-muted)]">
                          {detalhe.profissional.percentual_comissao}%
                        </td>
                        <td className="px-3 py-2 font-medium text-[var(--color-text)]">
                          {formatarMoeda(valorComissao)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="font-semibold text-[var(--color-text)]">Total a pagar</span>
              <span className="text-lg font-bold text-[var(--color-accent)]">
                {formatarMoeda(detalhe.valorComissao)}
              </span>
            </div>

            <div className="flex justify-end">
              <button type="button" className="btn-secondary" onClick={imprimirExtrato}>
                <Printer size={16} />
                Imprimir / Exportar extrato
              </button>
            </div>
          </div>
        </Modal>
      )}

      {parcialAlvo && (
        <Modal
          titulo={`Pagamento parcial — ${parcialAlvo.profissional.nome}`}
          onClose={() => setParcialAlvo(null)}
        >
          <form onSubmit={confirmarPagamentoParcial} className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-muted)]">
              Comissão total do período: {formatarMoeda(parcialAlvo.valorComissao)}
            </p>
            <Campo label="Valor pago (R$)">
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                className="input-base"
                value={valorParcial}
                onChange={(e) => setValorParcial(e.target.value)}
              />
            </Campo>
            <Campo label="Observação">
              <textarea
                className="input-base"
                rows={2}
                value={observacaoParcial}
                onChange={(e) => setObservacaoParcial(e.target.value)}
              />
            </Campo>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setParcialAlvo(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Registrar pagamento
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  )
}
