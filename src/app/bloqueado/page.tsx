import { Lock } from 'lucide-react'

export default function BloqueadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso bloqueado</h2>
        <p className="text-sm text-gray-500">
          O acesso da sua empresa ao Clube+ está temporariamente suspenso. Fale com o suporte pra mais detalhes.
        </p>
      </div>
    </div>
  )
}
