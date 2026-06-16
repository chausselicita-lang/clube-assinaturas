export function inicioDoDia(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function inicioDaSemana(d = new Date()) {
  const x = inicioDoDia(d)
  const diferenca = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - diferenca)
  return x
}

export function inicioDoMes(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function horarioPico(checkins) {
  if (checkins.length === 0) return '—'
  const contagemPorHora = {}
  checkins.forEach((c) => {
    const hora = new Date(c.data_hora).getHours()
    contagemPorHora[hora] = (contagemPorHora[hora] || 0) + 1
  })
  const [horaTop] = Object.entries(contagemPorHora).sort((a, b) => b[1] - a[1])[0]
  return `${String(horaTop).padStart(2, '0')}h`
}

export function assinaturaElegivel(cliente) {
  return (
    (cliente.assinaturas || []).find((a) => a.status === 'ativa' && a.creditos_disponiveis > 0) ||
    null
  )
}

export function statusCheckin(cliente) {
  const lista = cliente.assinaturas || []
  if (lista.some((a) => a.status === 'ativa' && a.creditos_disponiveis > 0)) {
    return { ok: true }
  }
  if (lista.some((a) => a.status === 'inadimplente')) {
    return { ok: false, motivo: 'Cliente inadimplente' }
  }
  if (lista.some((a) => a.status === 'suspensa')) {
    return { ok: false, motivo: 'Assinatura suspensa' }
  }
  if (lista.some((a) => a.status === 'ativa')) {
    return { ok: false, motivo: 'Sem créditos disponíveis' }
  }
  if (lista.length === 0) {
    return { ok: false, motivo: 'Sem assinatura ativa' }
  }
  return { ok: false, motivo: 'Assinatura cancelada' }
}
