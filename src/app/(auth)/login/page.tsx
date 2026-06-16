'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginForm } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Scissors } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setError('')
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) { setError('E-mail ou senha incorretos.'); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex w-1/2 bg-violet-600 flex-col justify-center items-center p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Scissors size={24} className="text-white" />
          </div>
          <div className="text-2xl font-bold">Clube+</div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-4">Gestão inteligente de assinaturas</h2>
        <p className="text-violet-200 text-center max-w-sm">
          Controle assinaturas, créditos e comissões do seu negócio em um só lugar.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { label: 'MRR Automático', desc: 'Receita recorrente calculada em tempo real' },
            { label: 'Check-in Rápido', desc: 'Débito de crédito com um clique' },
            { label: 'Comissões', desc: 'Cálculo automático por atendimento' },
            { label: 'Relatórios', desc: 'PDF e Excel com um clique' },
          ].map(f => (
            <div key={f.label} className="bg-white/10 rounded-lg p-3">
              <div className="text-sm font-semibold mb-1">{f.label}</div>
              <div className="text-xs text-violet-200">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Scissors size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Clube+</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
          <p className="text-sm text-gray-500 mb-8">Acesse o painel da sua empresa</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link href="/register" className="text-violet-600 font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
