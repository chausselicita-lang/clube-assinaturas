export function calcularComissao(valorServico, percentual) {
  return Number(((valorServico * percentual) / 100).toFixed(2))
}

const FATOR_PERIODICIDADE = {
  mensal: 1,
  semestral: 1 / 6,
  anual: 1 / 12,
}

export function calcularMRR(assinaturas, planosPorId) {
  return assinaturas
    .filter((a) => a.status === 'ativa')
    .reduce((total, a) => {
      const plano = planosPorId[a.plano_id]
      if (!plano) return total
      const fator = FATOR_PERIODICIDADE[plano.periodicidade] ?? 1
      return total + plano.valor * fator
    }, 0)
}
