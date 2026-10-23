'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MaintenanceRecord } from '@/lib/records'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState<MaintenanceRecord | null>(null)

  // Campos editables principales
  const [clientName, setClientName] = useState('')
  const [equipmentModel, setEquipmentModel] = useState('')
  const [technician, setTechnician] = useState('')
  const [workDone, setWorkDone] = useState('')

  useEffect(() => {
    async function fetchRecord() {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Error al cargar la orden: ' + error.message)
        router.push('/historial')
      } else if (data) {
        setRecord(data)
        setClientName(data.clientName || '')
        setEquipmentModel(data.equipmentModel || '')
        setTechnician(data.technician || '')
        setWorkDone(data.workDone || '')
      }
      setLoading(false)
    }

    fetchRecord()
  }, [id, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('maintenance_records')
      .update({
        clientName,
        equipmentModel,
        technician,
        workDone,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert('Error al actualizar la orden: ' + error.message)
    } else {
      router.push(`/historial/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Cargando datos de la orden...
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/historial/${id}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
        <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
          Editando orden: {record?.orderNumber}
        </span>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Editar Orden de Servicio</h2>
          <p className="text-xs text-neutral-400">Modifica los campos necesarios y guarda los cambios en Supabase.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Nombre del Cliente / Laboratorio</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Modelo de Equipo</label>
              <input
                type="text"
                value={equipmentModel}
                onChange={(e) => setEquipmentModel(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Técnico Responsable</label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Trabajo Realizado / Observaciones</label>
            <textarea
              rows={4}
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <Link
              href={`/historial/${id}`}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition bg-neutral-800 rounded-xl"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
