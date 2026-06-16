export default function PaginaEmConstrucao({ titulo, descricao }) {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">{titulo}</h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">{descricao}</p>
      <div className="card flex items-center justify-center py-16 text-sm text-[var(--color-text-muted)]">
        Módulo em construção
      </div>
    </div>
  )
}
