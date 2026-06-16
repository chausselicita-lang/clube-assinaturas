import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { session, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!loading && session) {
    const destino = location.state?.from?.pathname || '/'
    return <Navigate to={destino} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await login(email, senha)
      navigate('/', { replace: true })
    } catch (err) {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-2xl font-bold text-white shadow-lg shadow-[var(--color-accent)]/30">
            C+
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Clube+ Assinaturas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gestão de planos e comissões</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input-base"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input-base"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {erro}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn-primary mt-2">
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Clube+ Assinaturas
        </p>
      </div>
    </div>
  )
}
