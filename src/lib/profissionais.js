import { calcularComissao } from './comissao'

export const ESPECIALIDADES = ['Barbeiro', 'Cabeleireiro', 'Manicure', 'Esteticista', 'Outro']

export function valorPorCheckin(checkin) {
  const plano = checkin.assinatura?.plano
  if (!plano || !plano.creditos) return 0
  return plano.valor / plano.creditos
}

export function calcularComissaoTotal(checkins, percentual) {
  return checkins.reduce((total, c) => total + calcularComissao(valorPorCheckin(c), percentual), 0)
}
