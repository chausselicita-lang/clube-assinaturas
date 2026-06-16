export function calcularComissao(valor: number, percentual: number): number {
  return parseFloat(((valor * percentual) / 100).toFixed(2))
}

export function obterValorPlano(plano: { valor_mensal: number; valor_semestral: number; valor_anual: number }, periodicidade: string): number {
  if (periodicidade === 'mensal') return plano.valor_mensal
  if (periodicidade === 'semestral') return plano.valor_semestral
  if (periodicidade === 'anual') return plano.valor_anual
  return plano.valor_mensal
}

export function calcularMRR(assinaturas: Array<{ valor_pago: number; periodicidade: string }>): number {
  return assinaturas.reduce((acc, a) => {
    if (a.periodicidade === 'mensal') return acc + a.valor_pago
    if (a.periodicidade === 'semestral') return acc + a.valor_pago / 6
    if (a.periodicidade === 'anual') return acc + a.valor_pago / 12
    return acc
  }, 0)
}
