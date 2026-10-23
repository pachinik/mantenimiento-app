'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MaintenanceRecord } from '@/lib/records'
import { formatDateTime } from '@/lib/format'
import { Trash2, Pencil, ChevronRight, Search } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface HistoryListProps {
  initialRecords: MaintenanceRecord[]
}

export function HistoryList({ initialRecords }: HistoryListProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialRecords)
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const filteredRecords = records.filter(
    (record) =>
      record.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      record.orderNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (record: MaintenanceRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Estás seguro de eliminar la orden ${record.orderNumber}? Esta acción no se puede deshacer.`)) return

    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', record.id)

    if (error) {
      alert('Hubo un error al eliminar el registro: ' + error.message)
      return
    }

    try {
      const filesToDelete: string[] = []
      if (record.signatureUrl) {
        const parts = record.signatureUrl.split('/maintenance-files/')
        if (parts[1]) filesToDelete.push(parts[1])
      }
      if (record.photos && record.photos.length > 0) {
        record.photos.forEach(photoUrl => {
          const parts = photoUrl.split('/maintenance-files/')
          if (parts[1]) filesToDelete.push(parts[1])
        })
      }
      if (filesToDelete.length > 0) {
        await supabase.storage.from('maintenance-files').remove(filesToDelete)
      }
    } catch (err) {
      console.error('Error al limpiar archivos del storage:', err)
    }

    setRecords(records.filter((r) => r.id !== record.id))
  }

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/editar-orden?id=${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por cliente o número de orden"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-800">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              No se encontraron órdenes registradas.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => router.push(`/historial/${record.id}`)}
                className="flex items-center justify-between p-4 hover:bg-neutral-800/50 transition cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-400 font-medium text-sm">
                      {record.orderNumber}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDateTime(record.createdAt)}
                    </span>
                  </div>
                  <div className="text-white font-medium text-sm">{record.clientName}</div>
                  <div className="text-xs text-neutral-400">
                    Equipo: <span className="text-neutral-300">{record.equipmentModel || 'Sin especificar'}</span> | Técnico: <span className="text-neutral-300">{record.technician || 'Soporte Técnico'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <div className="flex items-center gap-1 mr-2 bg-neutral-950/80 p-1 rounded-lg border border-neutral-800" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleEdit(record.id, e)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition"
                        title="Editar orden"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(record, e)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
                        title="Eliminar orden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-neutral-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
