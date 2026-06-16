import { useEffect, useMemo, useState } from 'react'
import { Plus, Eye, Pencil, PauseCircle, PlayCircle, Users, Trophy, Wallet } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarMoeda, formatarData, formatarHora } from '../lib/format'
import { inicioDoMes } from '../lib/checkins'
import { calcularComissaoProfissional } from '../lib/comissoes'
import { ESPECIALIDADES } from '../lib/profissionais'
import KpiCard from '../components/KpiCard'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'

const VAZIO = {
  nome: '',
  especialidade: ESPECIALIDADES[0],
  telefone: '',
  percentual_comissao: '',
  foto_url: '',
  ativo: true,
}

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([])
  const [checkins, setCheckins] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [detalhe, setDetalhe] = useState(null)

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    const [profissionaisRes, checkinsRes] = await Promise.all([
      supabase.from('profissionais').select('*').order('nome'),
      supabase
        .from('checkins')
        .select(
          '*, cliente:clientes(nome), assinatura:assinaturas(plano:planos(nome, valor, creditos))',
        )
        .order('data_hora', { ascending: false }),
    ])
    setProfissionais(profissionaisRes.data || [])
    setCheckins(checkinsRes.data || [])
    setCarregando(false)
  }

  const checkinsPorProfissional = useMemo(() => {
    const mapa = {}
    checkins.forEach((c) => {
      if (!c.profissional_id) return
      if (!mapa[c.profissional_id]) mapa[c.profissional_id] = []
      mapa[c.profissional_id].push(c)
    })
    return mapa
  }, [checkins])

  const checkinsDoMes = useMemo(() => {
    const inicio = inicioDoMes()
    return checkins.filter((c) => new Date(c.data_hora) >= inicio)
  }, [checkins])

  const kpis = useMemo(() => {
    const ativos = profissionais.filter((p) => p.ativo).length

    const contagemMes = {}
    checkinsDoMes.forEach((c) => {
      if (!c.profissional_id) return
      contagemMes[c.profissional_id] = (contagemMes[c.profissional_id] || 0) + 1
    })
    let destaque = '—'
    let maiorContagem = 0
    Object.entries(contagemMes).forEach(([profId, qtd]) => {
      if (qtd > maiorContagem) {
        maiorContagem = qtd
        destaque = profissionais.find((p) => p.id === profId)?.nome || '—'
      }
    })

    const comissoesMes = profissionais.reduce((total, p) => {
      const checkinsDoProf = (checkinsDoMes || []).filter((c) => c.profissional_id === p.id)
      return total + calcularComissaoProfissional(checkinsDoProf, p.percentual_comissao).valorComissao
    }, 0)

    return { ativos, destaque, comissoesMes }
  }, [profissionais, checkinsDoMes])

  function abrirModalNovo() {
    setEditando(null)
    setForm(VAZIO)
    setErro('')
    setModalAberto(true)
  }

  function abrirModalEditar(p) {
    setEditando(p)
    setForm({
      nome: p.nome,
      especialidade: p.especialidade || ESPECIALIDADES[0],
      telefone: p.telefone || '',
      percentual_comissao: p.percentual_comissao,
      foto_url: p.foto_url || '',
      ativo: p.ativo,
    })
    setErro('')
    setModalAberto(true)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const payload = {
        nome: form.nome,
        especialidade: form.especialidade,
        telefone: form.telefone || null,
        percentual_comissao: Number(form.percentual_comissao) || 0,
        foto_url: form.foto_url || null,
        ativo: form.ativo,
      }

      const { error } = editando
        ? await supabase.from('profissionais').update(payload).eq('id', editando.id)
        : await supabase.from('profissionais').insert(payload)

      if (error) throw error
      setModalAberto(false)
      carregarTudo()
    } catch {
      setErro('Não foi possível salvar o profissional.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarStatus(p) {
    await supabase.from('profissionais').update({ ativo: !p.ativo }).eq('id', p.id)
    carregarTudo()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Profissionais</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {profissionais.length} cadastrados
          </p>
        </div>
        <button onClick={abrirModalNovo} className="btn-primary">
          <Plus size={16} />
          Novo profissional
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Profissionais Ativos" valor={kpis.ativos} icon={Users} cor="#2ecc8f" />
        <KpiCard
          label="Mais Atendimentos no Mês"
          valor={kpis.destaque}
          icon={Trophy}
          cor="#f5a623"
        />
        <KpiCard
          label="Comissões a Pagar no Mês"
          valor={formatarMoeda(kpis.comissoesMes)}
          icon={Wallet}
          cor="#6c63ff"
        />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Especialidade</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">% Comissão</th>
              <th className="px-4 py-3 font-medium">Atendimentos</th>
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
            {!carregando && profissionais.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Nenhum profissional cadastrado.
                </td>
              </tr>
            )}
            {profissionais.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.nome}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar nome={p.nome} tamanho={32} />
                    )}
                    <span className="font-medium text-[var(--color-text)]">{p.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {p.especialidade || '—'}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.telefone || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: p.ativo ? '#2ecc8f1a' : '#ef4d6c1a',
                      color: p.ativo ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {p.percentual_comissao}%
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {(checkinsPorProfissional[p.id] || []).length}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      title="Ver profissional"
                      onClick={() => setDetalhe(p)}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      title="Editar"
                      onClick={() => abrirModalEditar(p)}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)]"
                    >
                      <Pencil size={16} />
                    </button>
                    {p.ativo ? (
                      <button
                        title="Desativar"
                        onClick={() => alternarStatus(p)}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-warning)]"
                      >
                        <PauseCircle size={16} />
                      </button>
                    ) : (
                      <button
                        title="Ativar"
                        onClick={() => alternarStatus(p)}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-success)]"
                      >
                        <PlayCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal
          titulo={editando ? 'Editar profissional' : 'Novo profissional'}
          onClose={() => setModalAberto(false)}
        >
          <form onSubmit={handleSalvar} className="flex flex-col gap-3">
            <Campo label="Nome completo">
              <input
                required
                className="input-base"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Especialidade">
                <select
                  className="input-base"
                  value={form.especialidade}
                  onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                >
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Telefone / WhatsApp">
                <input
                  className="input-base"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Percentual de comissão (%)">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input-base"
                  value={form.percentual_comissao}
                  onChange={(e) => setForm({ ...form, percentual_comissao: e.target.value })}
                />
              </Campo>
              <Campo label="Status">
                <select
                  className="input-base"
                  value={form.ativo ? 'ativo' : 'inativo'}
                  onChange={(e) => setForm({ ...form, ativo: e.target.value === 'ativo' })}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </Campo>
            </div>
            <Campo label="Foto/avatar (URL, opcional)">
              <input
                className="input-base"
                placeholder="https://..."
                value={form.foto_url}
                onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
              />
            </Campo>

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
        <DetalheProfissional
          profissional={detalhe}
          checkins={checkinsPorProfissional[detalhe.id] || []}
          checkinsDoMes={checkinsDoMes.filter((c) => c.profissional_id === detalhe.id)}
          onClose={() => setDetalhe(null)}
        />
      )}
    </div>
  )
}

function DetalheProfissional({ profissional, checkins, checkinsDoMes, onClose }) {
  const comissaoMes = calcularComissaoProfissional(checkinsDoMes, profissional.percentual_comissao)
    .valorComissao

  return (
    <Modal titulo="Detalhes do profissional" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {profissional.foto_url ? (
            <img
              src={profissional.foto_url}
              alt={profissional.nome}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Avatar nome={profissional.nome} tamanho={48} />
          )}
          <div>
            <p className="font-bold text-[var(--color-text)]">{profissional.nome}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {profissional.especialidade || '—'} · {profissional.telefone || 'sem telefone'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Atendimentos no Mês" valor={checkinsDoMes.length} icon={Users} cor="#2ecc8f" />
          <KpiCard
            label="Comissão a Receber no Mês"
            valor={formatarMoeda(comissaoMes)}
            icon={Wallet}
            cor="#6c63ff"
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
            Histórico de atendimentos
          </h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                  <th className="px-3 py-2 font-medium">Cliente</th>
                  <th className="px-3 py-2 font-medium">Plano</th>
                  <th className="px-3 py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {checkins.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-[var(--color-text-muted)]">
                      Nenhum atendimento registrado.
                    </td>
                  </tr>
                )}
                {checkins.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2 text-[var(--color-text)]">{c.cliente?.nome || '—'}</td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">
                      {c.assinatura?.plano?.nome || '—'}
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">
                      {formatarData(c.data_hora)} {formatarHora(c.data_hora)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
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
