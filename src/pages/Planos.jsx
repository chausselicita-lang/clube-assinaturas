import { useEffect, useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarMoeda } from '../lib/format'
import Modal from '../components/Modal'

const VAZIO = {
  nome: '',
  descricao: '',
  periodicidade: 'mensal',
  valor: '',
  creditos: '',
  beneficios: '',
}

const LABEL_PERIODICIDADE = { mensal: '/mês', semestral: '/semestre', anual: '/ano' }

export default function Planos() {
  const [planos, setPlanos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarPlanos()
  }, [])

  async function carregarPlanos() {
    setCarregando(true)
    const { data } = await supabase.from('planos').select('*').order('valor')
    setPlanos(data || [])
    setCarregando(false)
  }

  function abrirModal() {
    setForm(VAZIO)
    setErro('')
    setModalAberto(true)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const beneficios = form.beneficios
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)

      const { error } = await supabase.from('planos').insert({
        nome: form.nome,
        descricao: form.descricao || null,
        periodicidade: form.periodicidade,
        valor: Number(form.valor),
        creditos: Number(form.creditos) || 0,
        beneficios,
      })
      if (error) throw error
      setModalAberto(false)
      carregarPlanos()
    } catch (err) {
      setErro('Não foi possível salvar o plano.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Planos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{planos.length} planos cadastrados</p>
        </div>
        <button onClick={abrirModal} className="btn-primary">
          <Plus size={16} />
          Novo plano
        </button>
      </div>

      {carregando ? (
        <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
      ) : planos.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Nenhum plano cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map((p) => (
            <div key={p.id} className="card flex flex-col">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text)]">{p.nome}</h3>
                {!p.ativo && (
                  <span className="rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                    Inativo
                  </span>
                )}
              </div>
              {p.descricao && (
                <p className="mb-3 text-sm text-[var(--color-text-muted)]">{p.descricao}</p>
              )}
              <div className="mb-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--color-accent)]">
                  {formatarMoeda(p.valor)}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {LABEL_PERIODICIDADE[p.periodicidade]}
                </span>
              </div>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                {p.creditos} créditos inclusos
              </p>
              {p.beneficios?.length > 0 && (
                <ul className="mt-auto flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3">
                  {p.beneficios.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-text)]"
                    >
                      <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <Modal titulo="Novo plano" onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar} className="flex flex-col gap-3">
            <Campo label="Nome">
              <input
                required
                className="input-base"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Campo>
            <Campo label="Descrição">
              <input
                className="input-base"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Campo>
            <div className="grid grid-cols-3 gap-3">
              <Campo label="Periodicidade">
                <select
                  className="input-base"
                  value={form.periodicidade}
                  onChange={(e) => setForm({ ...form, periodicidade: e.target.value })}
                >
                  <option value="mensal">Mensal</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </Campo>
              <Campo label="Valor (R$)">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-base"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </Campo>
              <Campo label="Créditos">
                <input
                  type="number"
                  min="0"
                  className="input-base"
                  value={form.creditos}
                  onChange={(e) => setForm({ ...form, creditos: e.target.value })}
                />
              </Campo>
            </div>
            <Campo label="Benefícios (um por linha)">
              <textarea
                className="input-base"
                rows={4}
                placeholder={'Corte ilimitado\nDesconto em produtos\nPrioridade na agenda'}
                value={form.beneficios}
                onChange={(e) => setForm({ ...form, beneficios: e.target.value })}
              />
            </Campo>

            {erro && <p className="text-sm text-[var(--color-danger)]">{erro}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="btn-primary">
                {salvando ? 'Salvando...' : 'Salvar'}
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
