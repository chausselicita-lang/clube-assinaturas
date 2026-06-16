const CORES = ['#6c63ff', '#2ecc8f', '#f5a623', '#ef4d6c', '#3da9fc', '#ff8a3d']

function corDoNome(nome) {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return CORES[Math.abs(hash) % CORES.length]
}

export default function Avatar({ nome, tamanho = 40 }) {
  const iniciais = (nome || '?')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  const cor = corDoNome(nome || '')

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: tamanho,
        height: tamanho,
        backgroundColor: `${cor}1a`,
        color: cor,
        fontSize: tamanho * 0.4,
      }}
    >
      {iniciais}
    </div>
  )
}
