export default function KpiCard({ label, valor, icon: Icon, cor = 'var(--color-accent)' }) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${cor}1a`, color: cor }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="text-xl font-bold text-[var(--color-text)]">{valor}</p>
      </div>
    </div>
  )
}
