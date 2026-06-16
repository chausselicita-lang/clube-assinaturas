import { CheckCircle2, XCircle } from 'lucide-react'

export default function Toast({ mensagem, tipo = 'sucesso' }) {
  const cor = tipo === 'sucesso' ? 'var(--color-success)' : 'var(--color-danger)'
  const Icon = tipo === 'sucesso' ? CheckCircle2 : XCircle

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl"
      style={{
        borderColor: cor,
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      }}
    >
      <Icon size={18} style={{ color: cor }} />
      {mensagem}
    </div>
  )
}
