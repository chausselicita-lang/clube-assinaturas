'use client'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'
import { fmtBRL, fmtDate } from '@/lib/utils/format'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, TrendingUp, Users, Plus, LogIn, Lock, Unlock, MailCheck } from 'lucide-react'
import { useState } from 'react'

interface Tenant {
  id: string
  nome: string
  status: 'ativo' | 'bloqueado'
  plano_saas: string
  created_at: string
  assinantesAtivos: number
  mrr: number
}

interface Resumo {
  totalTenants: number
  tenantsAtivos: number
  mrrRede: number
  assinantesAtivos: number
}

export default function AdminPage() {
  const qc = useQueryClient()
  const [novoOpen, setNovoOpen] = useState(false)
  const [convidado, setConvidado] = useState<{ email: string } | null>(null)
  const [form, setForm] = useState({ empresaNome: '', adminNome: '', adminEmail: '' })
  const [erro, setErro] = useState('')
  const [erroAcessar, setErroAcessar] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tenants')
      if (!res.ok) throw new Error('Falha ao carregar tenants')
      return res.json() as Promise<{ tenants: Tenant[]; resumo: Resumo }>
    },
  })

  const criar = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha ao criar empresa')
      return json as { email: string }
    },
    onSuccess: ({ email }) => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] })
      setNovoOpen(false)
      setForm({ empresaNome: '', adminNome: '', adminEmail: '' })
      setErro('')
      setConvidado({ email })
    },
    onError: (err: Error) => setErro(err.message),
  })

  const alternarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ativo' | 'bloqueado' }) => {
      const res = await fetch(`/api/admin/tenants/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar status')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  })

  const acessarComo = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tenants/${id}/acessar-como`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha ao gerar acesso')
      return json as { link: string }
    },
    onMutate: () => setErroAcessar(''),
    onSuccess: ({ link }) => {
      window.location.href = link
    },
    onError: (err: Error) => {
      console.error('acessar como falhou:', err)
      setErroAcessar(err.message)
    },
  })

  const resumo = data?.resumo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Rede de empresas</h1>
          <p className="text-sm text-gray-500">Todas as barbearias/salões que assinam o Clube+</p>
        </div>
        <Button onClick={() => setNovoOpen(true)}><Plus size={16} /> Nova empresa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Empresas ativas" value={String(resumo?.tenantsAtivos ?? 0)} subtitle={`${resumo?.totalTenants ?? 0} no total`} icon={Building2} color="violet" />
        <KpiCard title="MRR da rede" value={fmtBRL(resumo?.mrrRede ?? 0)} icon={TrendingUp} color="emerald" />
        <KpiCard title="Assinantes ativos" value={String(resumo?.assinantesAtivos ?? 0)} subtitle="somando todas as empresas" icon={Users} color="blue" />
        <KpiCard title="Bloqueados" value={String((resumo?.totalTenants ?? 0) - (resumo?.tenantsAtivos ?? 0))} icon={Lock} color="orange" />
      </div>

      {erroAcessar && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{erroAcessar}</div>
      )}

      <Card>
        <DataTable<Tenant>
          loading={isLoading}
          keyField="id"
          data={data?.tenants ?? []}
          emptyMessage="Nenhuma empresa cadastrada ainda."
          columns={[
            { key: 'nome', header: 'Empresa' },
            {
              key: 'status', header: 'Status',
              render: r => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {r.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                </span>
              )
            },
            { key: 'assinantesAtivos', header: 'Assinantes' },
            { key: 'mrr', header: 'MRR', render: r => fmtBRL(r.mrr) },
            { key: 'created_at', header: 'Desde', render: r => fmtDate(r.created_at) },
            {
              key: 'acoes', header: '', className: 'w-64',
              render: r => (
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    loading={acessarComo.isPending && acessarComo.variables === r.id}
                    disabled={acessarComo.isPending && acessarComo.variables !== r.id}
                    onClick={() => acessarComo.mutate(r.id)}
                  >
                    <LogIn size={14} /> Acessar como
                  </Button>
                  <Button
                    size="sm"
                    variant={r.status === 'ativo' ? 'destructive' : 'success'}
                    loading={alternarStatus.isPending && alternarStatus.variables?.id === r.id}
                    disabled={alternarStatus.isPending && alternarStatus.variables?.id !== r.id}
                    onClick={() => alternarStatus.mutate({ id: r.id, status: r.status === 'ativo' ? 'bloqueado' : 'ativo' })}
                  >
                    {r.status === 'ativo' ? <><Lock size={14} /> Bloquear</> : <><Unlock size={14} /> Reativar</>}
                  </Button>
                </div>
              )
            },
          ]}
        />
      </Card>

      <Modal open={novoOpen} onClose={() => setNovoOpen(false)} title="Nova empresa" size="sm">
        <form onSubmit={e => { e.preventDefault(); criar.mutate() }} className="space-y-4">
          <Input label="Nome da barbearia/salão" placeholder="Barbearia do João" value={form.empresaNome}
            onChange={e => setForm(f => ({ ...f, empresaNome: e.target.value }))} required />
          <Input label="Nome do responsável" placeholder="João Silva" value={form.adminNome}
            onChange={e => setForm(f => ({ ...f, adminNome: e.target.value }))} required />
          <Input label="E-mail" type="email" placeholder="joao@barbearia.com" value={form.adminEmail}
            onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} required />
          {erro && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{erro}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={criar.isPending}>Criar empresa</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!convidado} onClose={() => setConvidado(null)} title="Empresa criada" size="sm">
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <MailCheck size={22} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-600">
            Convite enviado pra <span className="font-medium text-gray-900">{convidado?.email}</span>.
            O responsável recebe um e-mail pra definir a própria senha e já entra direto na conta.
          </p>
          <Button className="w-full" onClick={() => setConvidado(null)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  )
}
