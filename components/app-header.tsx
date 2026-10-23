import Link from 'next/link'
import { Wrench } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Solucion-lab</h1>
            <p className="text-xs text-neutral-400">Soporte Técnico</p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-neutral-800/60"
          >
            Nueva orden
          </Link>
          <Link
            href="/historial"
            className="text-sm font-medium text-neutral-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-neutral-800/60 flex items-center gap-2"
          >
            Órdenes
          </Link>
        </nav>
      </div>
    </header>
  )
}
