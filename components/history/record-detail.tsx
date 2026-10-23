import { CalendarClock, ClipboardList, FileText, ImageIcon, Package, PenLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DateTime } from '@/components/date-time'
import type { MaintenanceRecord } from '@/lib/records'
import { cn } from '@/lib/utils'

function Card({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      {children}
    </section>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn('text-sm break-words', !value && 'text-muted-foreground/60 italic', mono && value && 'font-mono uppercase')}>
        {value || 'Sin especificar'}
      </dd>
    </div>
  )
}

export function RecordDetail({ record }: { record: MaintenanceRecord }) {
  return (
    <div className="flex flex-col gap-6">
      <Card icon={ClipboardList} title="Datos de la orden">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {record.serviceType ? (
            <span className="inline-flex items-center rounded-md bg-primary/15 px-2.5 py-1 text-sm font-medium text-primary">
              {record.serviceType}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground/60 italic">Sin tipo de servicio</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            <DateTime value={record.createdAt} className="font-mono" />
          </span>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Row label="Cliente" value={record.clientName} />
          <Row label="Empresa" value={record.company} />
          <Row label="Equipo" value={record.equipmentModel} />
          <Row label="N.º de serie" value={record.serialNumber} mono />
          <Row label="Técnico responsable" value={record.technician} />
          <Row label="Número de orden" value={record.orderNumber} mono />
        </dl>
      </Card>

      <Card icon={FileText} title="Descripción del trabajo">
        <p className={cn('rounded-lg bg-background/50 p-3 text-sm leading-relaxed whitespace-pre-wrap', !record.description && 'text-muted-foreground/60 italic')}>
          {record.description || 'Sin descripción'}
        </p>
      </Card>

      <Card icon={Package} title={`Repuestos (${record.parts.length})`}>
        {record.parts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="pb-2 font-normal">Repuesto</th>
                <th scope="col" className="pb-2 font-normal">Código</th>
                <th scope="col" className="pb-2 text-right font-normal">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {record.parts.map((part, i) => (
                <tr key={`${part.name}-${i}`}>
                  <td className="py-2 pr-2">{part.name}</td>
                  <td className="py-2 pr-2 font-mono text-xs uppercase text-muted-foreground">{part.code || '—'}</td>
                  <td className="py-2 text-right font-mono">{'×'}{part.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">Ninguno</p>
        )}
      </Card>

      <Card icon={ImageIcon} title={`Fotografías (${record.photos.length})`}>
        {record.photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {record.photos.map((url, i) => (
              <li key={url} className="aspect-square overflow-hidden rounded-lg border border-border">
                <a href={url} target="_blank" rel="noopener noreferrer" className="block size-full">
                  <span className="sr-only">{`Abrir fotografía ${i + 1} en una nueva pestaña`}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase storage image */}
                  <img src={url || '/placeholder.svg'} alt={`Fotografía ${i + 1} del servicio`} className="size-full object-cover transition-transform hover:scale-105" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">Sin fotografías</p>
        )}
      </Card>

      <Card icon={PenLine} title="Firma de conformidad">
        <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50 p-3">
          {record.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase storage image
            <img src={record.signatureUrl || '/placeholder.svg'} alt="Firma del cliente" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-sm text-slate-500">Firma no disponible</span>
          )}
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {record.signerName || record.clientName || 'Nombre de quien recibe'}
        </p>
      </Card>
    </div>
  )
}
