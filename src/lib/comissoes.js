function paraISO(d) {
  return d.toISOString().slice(0, 10)
}

export function limitesMesAtual() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  return { inicio: paraISO(inicio), fim: paraISO(fim) }
}

export function limitesMesAnterior() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
  return { inicio: paraISO(inicio), fim: paraISO(fim) }
}

export function checkinNoPeriodo(checkin, periodoInicio, periodoFim) {
  const data = checkin.data_hora.slice(0, 10)
  return data >= periodoInicio && data <= periodoFim
}

export function calcularComissaoProfissional(checkinsDoPeriodo, percentual) {
  const valorBase = checkinsDoPeriodo.reduce((total, c) => total + (c.assinatura?.plano?.valor || 0), 0)
  const valorComissao = Number(((valorBase * percentual) / 100).toFixed(2))
  return { atendimentos: checkinsDoPeriodo.length, valorBase, valorComissao }
}

export const STATUS_PAGAMENTO = {
  pendente: { label: 'Pendente', cor: 'var(--color-warning)' },
  pago: { label: 'Pago', cor: 'var(--color-success)' },
  parcial: { label: 'Parcial', cor: '#ff8a3d' },
}
