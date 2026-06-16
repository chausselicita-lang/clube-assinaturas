export function calcularComissao(valorServico: number, percentual: number): number {
  return parseFloat(((valorServico * percentual) / 100).toFixed(2))
}

export function calcularMRR(assinaturas: Array<{ valor_pago: number; periodicidade: string }>): number {
  return assinaturas.reduce((acc, a) => {
    if (a.periodicidade === 'mensal') return acc + a.valor_pago
    if (a.periodicidade === 'semestral') return acc + a.valor_pago / 6
    if (a.periodicidade === 'anual') return acc + a.valor_pago / 12
    return acc
  }, 0)
}
