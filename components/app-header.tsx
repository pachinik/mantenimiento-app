'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wrench, Lock, Unlock, LogOut } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AppHeader() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Correo configurado para el administrador en Supabase
    const adminEmail = 'admin@solucion-lab.com'

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    })

    setLoading(false)

    if (error) {
      setError('Contraseña incorrecta')
    } else {
      setIsAdmin(true)
      setShowModal(false)
      setPassword('')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  return (
    <>
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
              className="text-sm font-medium text-neutral-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-neutral-800/60"
            >
              Órdenes
            </Link>

            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-lg transition"
                title="Cerrar modo administrador"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Admin Activo</span>
                <LogOut className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-700 px-3 py-2 rounded-lg transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Modo Admin</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Acceso de Administrador
              </h3>
              <button
                onClick={() => { setShowModal(false); setPassword(''); setError(''); }}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Ingresa la contraseña para desbloquear las opciones de edición y borrado de fichas.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 text-sm"
                  autoFocus
                  required
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPassword(''); setError(''); }}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? 'Verificando...' : 'Desbloquear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
