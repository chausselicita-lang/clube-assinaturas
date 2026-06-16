import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Users,
  DollarSign,
  CalendarClock,
  AlertTriangle,
  Eye,
  PauseCircle,
  PlayCircle,
  Ban,
  Coins,
} from 'lucide-react'
import { supabase } from '../supabase'
import { formatarMoeda, formatarData } from '../lib/format'
import { calcularMRR } from '../lib/comissao'
import { STATUS_CONFIG, calcularProximaCobranca, diasAteVencer } from '../lib/assinaturas'
import KpiCard from '../components/KpiCard'
import Modal from '../components/Modal'

const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
]

const VAZIO = { cliente_id: '', plano_id: '', data_inicio: '', forma_pagamento: 'pix' }

export default function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [planos, setPlanos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPlano, setFiltroPlano] = useState('todos')
  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [detalhe, setDetalhe] = useState(null)
  const [creditoAlvo, setCreditoAlvo] = useState(null)
  const [quantidadeCredito, setQuantidadeCredito] = useState('')

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    const [assinaturasRes, clientesRes, planosRes] = await Promise.all([
      supabase
        .from('assinaturas')
        .select('*, cliente:clientes(nome, telefone), plano:planos(nome, valor, periodicidade)')
        .order('created_at', { ascending: false }),
      supabase.from('clientes').select('id, nome, telefone').order('nome'),
      supabase.from('planos').select('id, nome, valor, periodicidade, creditos').order('valor'),
    ])
    setAssinaturas(assinaturasRes.data || [])
    setClientes(clientesRes.data || [])
    setPlanos(planosRes.data || [])
    setCarregando(false)
  }

  const planosPorId = useMemo(() => Object.fromEntries(planos.map((p) => [p.id, p])), [planos])

  const kpis = useMemo(() => {
    const ativas = assinaturas.filter((a) => a.status === 'ativa')
    const inadimplentes = assinaturas.filter((a) => a.status === 'inadimplente')
    const naoCanceladas = assinaturas.filter((a) => a.status !== 'cancelada')
    const aVencer = ativas.filter((a) => {
      const dias = diasAteVencer(a.proxima_cobranca)
      return dias >= 0 && dias <= 7
    })
    const mrr = calcularMRR(assinaturas, planosPorId)
    const taxaInadimplencia =
      naoCanceladas.length > 0 ? (inadimplentes.length / naoCanceladas.length) * 100 : 0

    return {
      ativos: ativas.length,
      mrr,
      aVencer: aVencer.length,
      taxaInadimplencia,
    }
  }, [assinaturas, planosPorId])

  const assinaturasFiltradas = assinaturas.filter((a) => {
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false
    if (filtroPlano !== 'todos' && a.plano_id !== filtroPlano) return false
    if (filtroDe && a.data_inicio < filtroDe) return false
    if (filtroAte && a.data_inicio > filtroAte) return false
    return true
  })

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nome} ${c.telefone}`.toLowerCase().includes(buscaCliente.toLowerCase()),
  )

  function abrirModal() {
    setForm({ ...VAZIO, data_inicio: new Date().toISOString().slice(0, 10) })
    setBuscaCliente('')
    setErro('')
    setModalAberto(true)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const plano = planosPorId[form.plano_id]
      if (!plano) throw new Error('Selecione um plano válido.')

      const proximaCobranca = calcularProximaCobranca(form.data_inicio, plano.periodicidade)

      const { error } = await supabase.from('assinaturas').insert({
        cliente_id: form.cliente_id,
        plano_id: form.plano_id,
        status: 'ativa',
        creditos_disponiveis: plano.creditos || 0,
        data_inicio: form.data_inicio,
        proxima_cobranca: proximaCobranca,
        forma_pagamento: form.forma_pagamento,
      })
      if (error) throw error
      setModalAberto(false)
      carregarTudo()
    } catch (err) {
      setErro('Não foi possível salvar a assinatura.')
    } finally {
      setSalvando(false)
    }
  }

  async function alterarStatus(assinatura, novoStatus) {
    await supabase.from('assinaturas').update({ status: novoStatus }).eq('id', assinatura.id)
    carregarTudo()
  }

  function abrirAdicionarCreditos(assinatura) {
    setCreditoAlvo(assinatura)
    setQuantidadeCredito('')
  }

  async function confirmarAdicionarCreditos(e) {
    e.preventDefault()
    const qtd = Number(quantidadeCredito)
    if (!qtd || qtd <= 0) return
    await supabase
      .from('assinaturas')
      .update({ creditos_disponiveis: creditoAlvo.creditos_disponiveis + qtd })
      .eq('id', creditoAlvo.id)
    setCreditoAlvo(null)
    carregarTudo()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Assinaturas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {assinaturas.length} assinaturas cadastradas
          </p>
        </div>
        <button onClick={abrirModal} className="btn-primary">
          <Plus size={16} />
          Nova assinatura
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Assinantes Ativos" valor={kpis.ativos} icon={Users} cor="#2ecc8f" />
        <KpiCard label="MRR" valor={formatarMoeda(kpis.mrr)} icon={DollarSign} cor="#6c63ff" />
        <KpiCard
          label="A vencer em 7 dias"
          valor={kpis.aVencer}
          icon={CalendarClock}
          cor="#f5a623"
        />
        <KpiCard
          label="Taxa de Inadimplência"
          valor={`${kpis.taxaInadimplencia.toFixed(1)}%`}
          icon={AlertTriangle}
          cor="#ef4d6c"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Campo label="Status">
          <select
            className="input-base"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos</option>
            {Object.entries(STATUS_CONFIG).map(([valor, cfg]) => (
              <option key={valor} value={valor}>
                {cfg.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Plano">
          <select
            className="input-base"
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
          >
            <option value="todos">Todos</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="De">
          <input
            type="date"
            className="input-base"
            value={filtroDe}
            onChange={(e) => setFiltroDe(e.target.value)}
          />
        </Campo>
        <Campo label="Até">
          <input
            type="date"
            className="input-base"
            value={filtroAte}
            onChange={(e) => setFiltroAte(e.target.value)}
          />
        </Campo>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Créditos</th>
              <th className="px-4 py-3 font-medium">Próxima cobrança</th>
              <th className="px-4 py-3 font-medium">Início</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && assinaturasFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Nenhuma assinatura encontrada.
                </td>
              </tr>
            )}
            {assinaturasFiltradas.map((a) => {
              const cfg = STATUS_CONFIG[a.status] || { label: a.status, cor: 'var(--color-text-muted)' }
              return (
                <tr
                  key={a.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {a.cliente?.nome || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{a.plano?.nome || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${cfg.cor}1a`, color: cfg.cor }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {a.creditos_disponiveis}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatarData(a.proxima_cobranca)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatarData(a.data_inicio)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Ver detalhes"
                        onClick={() => setDetalhe(a)}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                      >
                        <Eye size={16} />
                      </button>
                      {a.status === 'ativa' && (
                        <button
                          title="Suspender"
                          onClick={() => alterarStatus(a, 'suspensa')}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-warning)]"
                        >
                          <PauseCircle size={16} />
                        </button>
                      )}
                      {(a.status === 'suspensa' || a.status === 'inadimplente') && (
                        <button
                          title="Reativar"
                          onClick={() => alterarStatus(a, 'ativa')}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-success)]"
                        >
                          <PlayCircle size={16} />
                        </button>
                      )}
                      {a.status !== 'cancelada' && (
                        <button
                          title="Cancelar"
                          onClick={() => {
                            if (confirm('Cancelar esta assinatura?')) alterarStatus(a, 'cancelada')
                          }}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-danger)]"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        title="Adicionar créditos"
                        onClick={() => abrirAdicionarCreditos(a)}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)]"
                      >
                        <Coins size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal titulo="Nova assinatura" onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar} className="flex flex-col gap-3">
            <Campo label="Cliente">
              <input
                className="input-base mb-2"
                placeholder="Buscar por nome ou telefone"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
              />
              <select
                required
                className="input-base"
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {clientesFiltrados.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.telefone}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Plano">
              <select
                required
                className="input-base"
                value={form.plano_id}
                onChange={(e) => setForm({ ...form, plano_id: e.target.value })}
              >
                <option value="">Selecione um plano</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {formatarMoeda(p.valor)}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Data de início">
                <input
                  required
                  type="date"
                  className="input-base"
                  value={form.data_inicio}
                  onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                />
              </Campo>
              <Campo label="Forma de pagamento">
                <select
                  className="input-base"
                  value={form.forma_pagamento}
                  onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
                >
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            {erro && <p className="text-sm text-[var(--color-danger)]">{erro}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="btn-primary">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detalhe && (
        <Modal titulo="Detalhes da assinatura" onClose={() => setDetalhe(null)}>
          <div className="flex flex-col gap-3 text-sm">
            <LinhaDetalhe label="Cliente" valor={detalhe.cliente?.nome} />
            <LinhaDetalhe label="Telefone" valor={detalhe.cliente?.telefone} />
            <LinhaDetalhe label="Plano" valor={detalhe.plano?.nome} />
            <LinhaDetalhe label="Valor do plano" valor={formatarMoeda(detalhe.plano?.valor)} />
            <LinhaDetalhe
              label="Status"
              valor={STATUS_CONFIG[detalhe.status]?.label || detalhe.status}
            />
            <LinhaDetalhe label="Créditos disponíveis" valor={detalhe.creditos_disponiveis} />
            <LinhaDetalhe label="Data de início" valor={formatarData(detalhe.data_inicio)} />
            <LinhaDetalhe label="Próxima cobrança" valor={formatarData(detalhe.proxima_cobranca)} />
            <LinhaDetalhe
              label="Forma de pagamento"
              valor={
                FORMAS_PAGAMENTO.find((f) => f.value === detalhe.forma_pagamento)?.label || '—'
              }
            />
            <LinhaDetalhe label="Criado em" valor={formatarData(detalhe.created_at)} />
          </div>
        </Modal>
      )}

      {creditoAlvo && (
        <Modal titulo="Adicionar créditos" onClose={() => setCreditoAlvo(null)}>
          <form onSubmit={confirmarAdicionarCreditos} className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-muted)]">
              {creditoAlvo.cliente?.nome} — saldo atual: {creditoAlvo.creditos_disponiveis} créditos
            </p>
            <Campo label="Quantidade a adicionar">
              <input
                required
                type="number"
                min="1"
                className="input-base"
                value={quantidadeCredito}
                onChange={(e) => setQuantidadeCredito(e.target.value)}
              />
            </Campo>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setCreditoAlvo(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Adicionar
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

function LinhaDetalhe({ label, valor }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-text)]">{valor ?? '—'}</span>
    </div>
  )
}
