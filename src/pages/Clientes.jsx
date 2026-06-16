import { useEffect, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../supabase'
import { formatarData } from '../lib/format'
import Modal from '../components/Modal'

const VAZIO = {
  nome: '',
  telefone: '',
  whatsapp: '',
  email: '',
  cpf: '',
  nascimento: '',
  observacoes: '',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    setCarregando(true)
    const { data } = await supabase.from('clientes').select('*').order('nome')
    setClientes(data || [])
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
      const { error } = await supabase.from('clientes').insert({
        nome: form.nome,
        telefone: form.telefone,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        cpf: form.cpf || null,
        nascimento: form.nascimento || null,
        observacoes: form.observacoes || null,
      })
      if (error) throw error
      setModalAberto(false)
      carregarClientes()
    } catch (err) {
      setErro('Não foi possível salvar o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(cliente) {
    const confirmado = confirm(
      `Excluir ${cliente.nome}? Isso também remove assinaturas e check-ins desse cliente.`,
    )
    if (!confirmado) return
    setExcluindo(cliente.id)
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', cliente.id)
      if (error) throw error
      carregarClientes()
    } catch {
      alert('Não foi possível excluir o cliente.')
    } finally {
      setExcluindo(null)
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nome} ${c.telefone} ${c.cpf || ''}`.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Clientes</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{clientes.length} cadastrados</p>
        </div>
        <button onClick={abrirModal} className="btn-primary">
          <Plus size={16} />
          Novo cliente
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 card max-w-sm">
        <Search size={16} className="text-[var(--color-text-muted)]" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          placeholder="Buscar por nome, telefone ou CPF"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Nascimento</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
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
            {!carregando && clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {clientesFiltrados.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">{c.nome}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.telefone}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.cpf || '—'}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.email || '—'}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {formatarData(c.nascimento)}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {formatarData(c.created_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    title="Excluir"
                    disabled={excluindo === c.id}
                    onClick={() => handleExcluir(c)}
                    className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-danger)] disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <Modal titulo="Novo cliente" onClose={() => setModalAberto(false)}>
          <form onSubmit={handleSalvar} className="flex flex-col gap-3">
            <Campo label="Nome">
              <input
                required
                className="input-base"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Telefone">
                <input
                  required
                  className="input-base"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </Campo>
              <Campo label="WhatsApp">
                <input
                  className="input-base"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="E-mail">
                <input
                  type="email"
                  className="input-base"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Campo>
              <Campo label="CPF">
                <input
                  className="input-base"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </Campo>
            </div>
            <Campo label="Nascimento">
              <input
                type="date"
                className="input-base"
                value={form.nascimento}
                onChange={(e) => setForm({ ...form, nascimento: e.target.value })}
              />
            </Campo>
            <Campo label="Observações">
              <textarea
                className="input-base"
                rows={3}
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
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
