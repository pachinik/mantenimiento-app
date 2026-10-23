'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, FileSpreadsheet, Inbox, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateTime } from '@/components/date-time'
import { inputClass } from '@/components/service-order/form-primitives'
import { exportRecordsCsv } from '@/lib/csv'
import type { MaintenanceRecord } from '@/lib/records'
import { cn } from '@/lib/utils'

const normalize = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function HistoryList({ records }: { records: MaintenanceRecord[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return records
    return records.filter((r) => normalize(`${r.orderNumber} ${r.clientName} ${r.company}`).includes(q))
  }, [records, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="history-search" className="sr-only">
            Buscar por cliente o número de orden
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="history-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente o número de orden"
            className={cn(inputClass, 'pl-10')}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => exportRecordsCsv(filtered)}
          disabled={filtered.length === 0}
          className="h-12 font-semibold"
        >
          <FileSpreadsheet className="size-4" aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'}
        {query.trim() ? ` de ${records.length}` : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">{records.length === 0 ? 'Aún no hay órdenes guardadas' : 'Sin resultados'}</p>
          <p className="text-sm text-muted-foreground">
            {records.length === 0 ? 'Las órdenes registradas aparecerán aquí.' : 'Prueba con otro cliente o número de orden.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[180px_140px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_20px] gap-4 border-b border-border px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
            <span>N.º de orden</span>
            <span>Fecha</span>
            <span>Cliente</span>
            <span>Equipo</span>
            <span>Técnico</span>
            <span className="sr-only">Abrir</span>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/historial/${encodeURIComponent(r.id)}`}
                  className="grid grid-cols-[minmax(0,1fr)_20px] items-center gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-none sm:px-5 md:grid-cols-[180px_140px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_20px]"
                >
                  <div className="flex items-center justify-between gap-3 md:contents">
                    <span className="truncate font-mono text-sm text-primary">{r.orderNumber}</span>
                    <DateTime value={r.createdAt} className="shrink-0 font-mono text-xs text-muted-foreground md:text-sm" />
                  </div>
                  <ChevronRight className="row-span-3 size-5 text-muted-foreground md:order-last md:row-span-1" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.clientName || 'Sin cliente'}</p>
                    {r.company && <p className="truncate text-xs text-muted-foreground">{r.company}</p>}
                  </div>
                  <p className="truncate text-sm text-secondary-foreground">
                    <span className="text-muted-foreground md:hidden">{'Equipo: '}</span>
                    {r.equipmentModel || '—'}
                  </p>
                  <p className="truncate text-sm text-secondary-foreground">
                    <span className="text-muted-foreground md:hidden">{'Técnico: '}</span>
                    {r.technician || '—'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
