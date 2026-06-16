export const STATUS_CONFIG = {
  ativa: { label: 'Ativa', cor: 'var(--color-success)' },
  suspensa: { label: 'Suspensa', cor: 'var(--color-warning)' },
  cancelada: { label: 'Cancelada', cor: 'var(--color-danger)' },
  inadimplente: { label: 'Inadimplente', cor: '#ff8a3d' },
}

const FATOR_MESES = { mensal: 1, semestral: 6, anual: 12 }

export function calcularProximaCobranca(dataInicio, periodicidade) {
  const d = new Date(`${dataInicio}T00:00:00`)
  d.setMonth(d.getMonth() + (FATOR_MESES[periodicidade] ?? 1))
  return d.toISOString().slice(0, 10)
}

export function diasAteVencer(dataStr) {
  if (!dataStr) return Infinity
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(`${dataStr}T00:00:00`)
  return Math.round((data - hoje) / (1000 * 60 * 60 * 24))
}
