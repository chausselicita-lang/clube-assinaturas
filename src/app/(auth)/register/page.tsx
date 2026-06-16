'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterForm } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Scissors } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nome: data.nome, empresa_nome: data.empresa_nome },
      },
    })

    if (authError) { setError(authError.message); return }

    if (authData.user) {
      const { error: empresaError } = await supabase.from('empresas').insert({
        nome: data.empresa_nome,
        plano_saas: 'trial',
        config: {},
      })
      if (empresaError) { setError('Erro ao criar empresa. Tente novamente.'); return }
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Conta criada!</h2>
          <p className="text-sm text-gray-500 mb-6">Verifique seu e-mail para confirmar o cadastro.</p>
          <Link href="/login" className="text-violet-600 font-medium hover:underline text-sm">
            Ir para login
          </Link>
        </div>
      </div>
    )
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

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h1>
        <p className="text-sm text-gray-500 mb-8">Comece grátis. Sem cartão de crédito.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome da empresa"
            placeholder="Barbearia do João"
            error={errors.empresa_nome?.message}
            {...register('empresa_nome')}
          />
          <Input
            label="Seu nome"
            placeholder="João Silva"
            error={errors.nome?.message}
            {...register('nome')}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="joao@barbearia.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-violet-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
