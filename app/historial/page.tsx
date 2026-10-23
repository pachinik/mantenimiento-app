import type { Metadata } from 'next'
import { connection } from 'next/server'
import { AlertTriangle } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { HistoryList } from '@/components/history/history-list'
import { fetchRecords, type MaintenanceRecord } from '@/lib/records'

export const metadata: Metadata = {
  title: 'Historial de órdenes | FieldService',
  description: 'Consulta, busca y exporta las órdenes de servicio registradas.',
}

export default async function HistorialPage() {
  await connection()
  let records: MaintenanceRecord[] = []
  let error = ''
  try {
    records = await fetchRecords()
  } catch (err) {
    error = err instanceof Error ? err.message : 'No se pudo cargar el historial.'
  }

  return (
    <div className="min-h-dvh pb-10">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Historial de órdenes</h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Órdenes registradas en Supabase, de la más reciente a la más antigua.
          </p>
        </div>
        {error ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="font-medium">No se pudo cargar el historial</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <HistoryList initialRecords={records} />
        )}
      </main>
    </div>
  )
}
