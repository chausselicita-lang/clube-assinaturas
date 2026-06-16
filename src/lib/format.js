export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

export function formatarHora(dataHora) {
  if (!dataHora) return '—'
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(dataHora),
  )
}
