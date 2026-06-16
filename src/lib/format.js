export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}
