import { useEffect, useMemo, useState } from 'react'
import { Search, ScanLine, Clock, Users, CalendarDays, TrendingUp } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarData, formatarHora } from '../lib/format'
import {
  inicioDoDia,
  inicioDaSemana,
  inicioDoMes,
  horarioPico,
  assinaturaElegivel,
  statusCheckin,
} from '../lib/checkins'
import KpiCard from '../components/KpiCard'
import Avatar from '../components/Avatar'
import Toast from '../components/Toast'

export default function CheckIn() {
  const [clientes, setClientes] = useState([])
  const [checkins, setCheckins] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [planos, setPlanos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(null)

  const [busca, setBusca] = useState('')
  const [profissionalAtendente, setProfissionalAtendente] = useState('')

  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10))
  const [filtroProfissional, setFiltroProfissional] = useState('todos')
  const [filtroPlano, setFiltroPlano] = useState('todos')

  const [toast, setToast] = useState(null)

  useEffect(() => {
    carregarTudo()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  async function carregarTudo() {
    setCarregando(true)
    const [clientesRes, checkinsRes, profissionaisRes, planosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, telefone, cpf, assinaturas(id, status, creditos_disponiveis, plano_id, planos(nome))')
        .order('nome'),
      supabase
        .from('checkins')
        .select(
          '*, cliente:clientes(nome), profissional:profissionais(nome), assinatura:assinaturas(plano_id, plano:planos(nome))',
        )
        .order('data_hora', { ascending: false }),
      supabase.from('profissionais').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('planos').select('id, nome').order('nome'),
    ])
    setClientes(clientesRes.data || [])
    setCheckins(checkinsRes.data || [])
    setProfissionais(profissionaisRes.data || [])
    setPlanos(planosRes.data || [])
    setCarregando(false)
  }

  const kpis = useMemo(() => {
    const hoje = inicioDoDia()
    const semana = inicioDaSemana()
    const mes = inicioDoMes()

    const checkinsHoje = checkins.filter((c) => new Date(c.data_hora) >= hoje)
    const checkinsSemana = checkins.filter((c) => new Date(c.data_hora) >= semana)
    const checkinsMes = checkins.filter((c) => new Date(c.data_hora) >= mes)
    const clientesUnicosMes = new Set(checkinsMes.map((c) => c.cliente_id))

    return {
      hoje: checkinsHoje.length,
      semana: checkinsSemana.length,
      clientesMes: clientesUnicosMes.size,
      pico: horarioPico(checkins),
    }
  }, [checkins])

  const resultadosBusca = useMemo(() => {
    if (!busca.trim()) return []
    const termo = busca.toLowerCase()
    return clientes
      .filter((c) => `${c.nome} ${c.telefone} ${c.cpf || ''}`.toLowerCase().includes(termo))
      .slice(0, 12)
  }, [busca, clientes])

  const historicoFiltrado = checkins.filter((c) => {
    const dataCheckin = new Date(c.data_hora).toISOString().slice(0, 10)
    if (filtroData && dataCheckin !== filtroData) return false
    if (filtroProfissional !== 'todos' && c.profissional_id !== filtroProfissional) return false
    if (filtroPlano !== 'todos' && c.assinatura?.plano_id !== filtroPlano) return false
    return true
  })

  async function fazerCheckin(cliente) {
    const status = statusCheckin(cliente)
    if (!status.ok) {
      setToast({ mensagem: `${cliente.nome}: ${status.motivo}`, tipo: 'erro' })
      return
    }

    const assinatura = assinaturaElegivel(cliente)
    setProcessando(cliente.id)
    try {
      const creditosAntes = assinatura.creditos_disponiveis
      const creditosDepois = creditosAntes - 1

      const { error } = await supabase.from('checkins').insert({
        cliente_id: cliente.id,
        assinatura_id: assinatura.id,
        profissional_id: profissionalAtendente || null,
        creditos_antes: creditosAntes,
        creditos_depois: creditosDepois,
      })
      if (error) throw error

      await supabase
        .from('assinaturas')
        .update({ creditos_disponiveis: creditosDepois })
        .eq('id', assinatura.id)

      setToast({ mensagem: `Check-in realizado: ${cliente.nome}`, tipo: 'sucesso' })
      carregarTudo()
    } catch {
      setToast({ mensagem: `Não foi possível registrar o check-in de ${cliente.nome}.`, tipo: 'erro' })
    } finally {
      setProcessando(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Check-in</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Busca por telefone, débito de crédito e cálculo de comissão
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Check-ins Hoje" valor={kpis.hoje} icon={ScanLine} cor="#2ecc8f" />
        <KpiCard label="Check-ins esta Semana" valor={kpis.semana} icon={CalendarDays} cor="#6c63ff" />
        <KpiCard label="Clientes Atendidos no Mês" valor={kpis.clientesMes} icon={Users} cor="#3da9fc" />
        <KpiCard label="Horário de Pico" valor={kpis.pico} icon={TrendingUp} cor="#f5a623" />
      </div>

      <div className="card mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Profissional atendendo
            </span>
            <select
              className="input-base"
              value={profissionalAtendente}
              onChange={(e) => setProfissionalAtendente(e.target.value)}
            >
              <option value="">Não informar</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-2.5">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            autoFocus
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder="Buscar cliente por nome ou CPF"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {busca.trim() && (
          <div className="flex flex-col gap-2">
            {resultadosBusca.length === 0 && (
              <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
                Nenhum cliente encontrado.
              </p>
            )}
            {resultadosBusca.map((cliente) => {
              const status = statusCheckin(cliente)
              const assinatura = assinaturaElegivel(cliente)
              return (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nome={cliente.nome} />
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{cliente.nome}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {cliente.telefone}
                        {status.ok
                          ? ` · ${assinatura.planos?.nome} · ${assinatura.creditos_disponiveis} créditos`
                          : ` · ${status.motivo}`}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={!status.ok || processando === cliente.id}
                    onClick={() => fazerCheckin(cliente)}
                    className="btn-primary"
                  >
                    {processando === cliente.id ? 'Processando...' : 'Fazer Check-in'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Campo label="Data">
          <input
            type="date"
            className="input-base"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </Campo>
        <Campo label="Profissional">
          <select
            className="input-base"
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
          >
            <option value="todos">Todos</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
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
      </div>

      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Histórico de check-ins</h2>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Clock size={14} />
            {historicoFiltrado.length} check-ins
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Horário</th>
              <th className="px-4 py-3 font-medium">Profissional</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && historicoFiltrado.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Nenhum check-in encontrado.
                </td>
              </tr>
            )}
            {historicoFiltrado.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                  {c.cliente?.nome || '—'}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {c.assinatura?.plano?.nome || '—'}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {formatarData(c.data_hora)} {formatarHora(c.data_hora)}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {c.profissional?.nome || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} />}
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
