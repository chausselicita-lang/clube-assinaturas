'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Scissors } from 'lucide-react'

// Destino do e-mail de convite (inviteUserByEmail): assim como o magic link
// de "acessar como", o token vem no fragmento da URL, então a sessão só é
// processada no client (createBrowserClient detecta sozinho ao inicializar).
export default function DefinirSenhaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [carregando, setCarregando] = useState(true)
  const [valido, setValido] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setValido(!!data.session)
      setCarregando(false)
    })
  }, [supabase])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 6) { setErro('Mínimo 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setEnviando(false)
    if (error) { setErro(error.message); return }
    router.push('/')
  }

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Carregando...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Scissors size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">Clube+</span>
        </div>

        {!valido ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Link inválido</h1>
            <p className="text-sm text-gray-500">Esse convite expirou ou já foi usado. Peça um novo pra quem te cadastrou.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Defina sua senha</h1>
            <p className="text-sm text-gray-500 mb-8">Escolha uma senha pra acessar o Clube+.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Nova senha" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} />
              <Input label="Confirmar senha" type="password" placeholder="Repita a senha" value={confirmar} onChange={e => setConfirmar(e.target.value)} />
              {erro && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{erro}</div>
              )}
              <Button type="submit" className="w-full" loading={enviando}>Entrar no Clube+</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
