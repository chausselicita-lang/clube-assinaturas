'use client'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate } from '@/lib/utils/format'
import { calcularComissao } from '@/lib/utils/comissao'
import { Search, CheckCircle2, AlertTriangle, CreditCard, User, Scissors } from 'lucide-react'
import { useState } from 'react'
import type { Assinatura, Profissional, Servico, Cliente } from '@/lib/types'

type Step = 'busca' | 'confirmacao' | 'sucesso'

interface ClienteEncontrado {
  assinatura: Assinatura
  cliente: Cliente
}

export default function CheckinPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('busca')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [encontrado, setEncontrado] = useState<ClienteEncontrado | null>(null)
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [profissionalId, setProfissionalId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState<{ comissao: number; servico: string; profissional: string } | null>(null)

  async function handleBusca() {
    setErro('')
    setLoading(true)
    try {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('*')
        .or(`telefone.ilike.%${busca}%,whatsapp.ilike.%${busca}%`)
        .limit(1)

      if (!clientes?.length) { setErro('Cliente não encontrado. Verifique o telefone.'); setLoading(false); return }

      const cliente = clientes[0] as Cliente

      const { data: assinaturas } = await supabase
        .from('assinaturas')
        .select('*, planos(nome, creditos_mensais)')
        .eq('cliente_id', cliente.id)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!assinaturas?.length) { setErro('Nenhuma assinatura ativa encontrada para este cliente.'); setLoading(false); return }

      const [profsRes, servsRes] = await Promise.all([
        supabase.from('profissionais').select('*').eq('ativo', true).order('nome'),
        supabase.from('servicos').select('*').order('nome'),
      ])

      setEncontrado({ assinatura: assinaturas[0] as Assinatura, cliente })
      setProfissionais((profsRes.data ?? []) as Profissional[])
      setServicos((servsRes.data ?? []) as Servico[])
      setProfissionalId('')
      setServicoId('')
      setStep('confirmacao')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmar() {
    if (!profissionalId || !servicoId || !encontrado) return
    setConfirmando(true)

    const servico = servicos.find(s => s.id === servicoId)!
    const profissional = profissionais.find(p => p.id === profissionalId)!
    const { assinatura } = encontrado

    if (assinatura.creditos_disponiveis < servico.creditos_necessarios) {
      setErro('Créditos insuficientes para este serviço.')
      setConfirmando(false)
      return
    }

    const comissaoValor = calcularComissao(servico.valor_interno, profissional.comissao_percentual)
    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const [atendRes] = await Promise.all([
      supabase.from('atendimentos').insert({
        cliente_id: encontrado.cliente.id,
        assinatura_id: assinatura.id,
        profissional_id: profissionalId,
        servico_id: servicoId,
        creditos_consumidos: servico.creditos_necessarios,
        valor_servico: servico.valor_interno,
        valor_comissao: comissaoValor,
        status: 'concluido',
      }).select().single(),
    ])

    if (atendRes.data) {
      await Promise.all([
        supabase.from('comissoes').insert({
          profissional_id: profissionalId,
          atendimento_id: atendRes.data.id,
          valor: comissaoValor,
          periodo_mes: mes,
          periodo_ano: ano,
          status: 'pendente',
        }),
        supabase.from('assinaturas').update({
          creditos_disponiveis: assinatura.creditos_disponiveis - servico.creditos_necessarios,
          updated_at: new Date().toISOString(),
        }).eq('id', assinatura.id),
      ])
    }

    setResultado({ comissao: comissaoValor, servico: servico.nome, profissional: profissional.nome })
    setStep('sucesso')
    setConfirmando(false)
  }

  function reiniciar() {
    setStep('busca')
    setBusca('')
    setEncontrado(null)
    setErro('')
    setResultado(null)
  }

  const servicoSelecionado = servicos.find(s => s.id === servicoId)
  const profissionalSelecionado = profissionais.find(p => p.id === profissionalId)
  const comissaoPreview = servicoSelecionado && profissionalSelecionado
    ? calcularComissao(servicoSelecionado.valor_interno, profissionalSelecionado.comissao_percentual)
    : null

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Check-in" subtitle="Registrar atendimento" />
      <main className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
        <div className="w-full max-w-lg">

          {/* STEP: BUSCA */}
          {step === 'busca' && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Identificar Cliente</h2>
                <p className="text-xs text-gray-400 mt-0.5">Informe o telefone do cliente</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="(11) 99999-9999"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBusca()}
                    className="flex-1"
                  />
                  <Button onClick={handleBusca} loading={loading}>
                    <Search size={16} /> Buscar
                  </Button>
                </div>
                {erro && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    <AlertTriangle size={15} /> {erro}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* STEP: CONFIRMAÇÃO */}
          {step === 'confirmacao' && encontrado && (
            <div className="space-y-4">
              {/* Card do cliente */}
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <User size={18} className="text-violet-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{encontrado.cliente.nome}</div>
                      <div className="text-xs text-gray-400">{encontrado.cliente.telefone}</div>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={encontrado.assinatura.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="text-xs text-gray-500 mb-1">Plano</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {(encontrado.assinatura.planos as { nome: string })?.nome}
                      </div>
                    </div>
                    <div className="rounded-lg bg-violet-50 p-3">
                      <div className="text-xs text-violet-600 mb-1 flex items-center gap-1">
                        <CreditCard size={11} /> Créditos disponíveis
                      </div>
                      <div className="text-sm font-bold text-violet-700">
                        {encontrado.assinatura.creditos_disponiveis} / {encontrado.assinatura.creditos_totais}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-violet-500 rounded-full transition-all"
                        style={{ width: `${encontrado.assinatura.creditos_totais > 0 ? (encontrado.assinatura.creditos_disponiveis / encontrado.assinatura.creditos_totais) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Renova em {fmtDate(encontrado.assinatura.data_renovacao)}
                  </div>
                </CardBody>
              </Card>

              {/* Seleção serviço + profissional */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Scissors size={15} /> Registrar Atendimento
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Select
                    label="Serviço"
                    value={servicoId}
                    onChange={e => setServicoId(e.target.value)}
                  >
                    <option value="">Selecione o serviço...</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nome} — {s.creditos_necessarios} crédito(s)
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Profissional"
                    value={profissionalId}
                    onChange={e => setProfissionalId(e.target.value)}
                  >
                    <option value="">Selecione o profissional...</option>
                    {profissionais.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — {p.funcao}
                      </option>
                    ))}
                  </Select>

                  {comissaoPreview !== null && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor do serviço</span>
                        <span className="font-medium">{fmtBRL(servicoSelecionado!.valor_interno)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">Comissão ({profissionalSelecionado!.comissao_percentual}%)</span>
                        <span className="font-semibold text-emerald-700">{fmtBRL(comissaoPreview)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">Créditos a debitar</span>
                        <span className="font-medium text-violet-700">{servicoSelecionado!.creditos_necessarios}</span>
                      </div>
                    </div>
                  )}

                  {erro && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                      <AlertTriangle size={15} /> {erro}
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" onClick={reiniciar} className="flex-1">Cancelar</Button>
                    <Button
                      className="flex-1"
                      disabled={!profissionalId || !servicoId}
                      loading={confirmando}
                      onClick={handleConfirmar}
                    >
                      Confirmar Atendimento
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* STEP: SUCESSO */}
          {step === 'sucesso' && resultado && (
            <Card>
              <CardBody className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Atendimento Registrado!</h2>
                <p className="text-sm text-gray-500 mb-6">Crédito debitado com sucesso</p>
                <div className="rounded-lg bg-gray-50 p-4 text-left space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Serviço</span>
                    <span className="font-medium">{resultado.servico}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Profissional</span>
                    <span className="font-medium">{resultado.profissional}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Comissão gerada</span>
                    <span className="font-bold text-emerald-600">{fmtBRL(resultado.comissao)}</span>
                  </div>
                </div>
                <Button onClick={reiniciar} className="w-full">Novo Check-in</Button>
              </CardBody>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
