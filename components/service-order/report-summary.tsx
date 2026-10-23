import { FileText } from 'lucide-react'
import { resolveServiceType, type ServiceOrder } from '@/lib/service-order'
import { cn } from '@/lib/utils'

type Props = {
  order: ServiceOrder
  orderNumber: string
  date: string
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

export function ReportSummary({ order, orderNumber, date }: Props) {
  const serviceType = resolveServiceType(order)
  const isCustom = order.serviceType === 'Otro / Especificar'

  return (
    <section aria-labelledby="summary-heading" className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="summary-heading" className="font-semibold">
              Vista previa del reporte
            </h2>
            <p className="font-mono text-xs text-muted-foreground">{orderNumber}</p>
          </div>
        </div>
        <time className="font-mono text-xs text-muted-foreground">{date}</time>
      </header>

      <div className="flex flex-col gap-5 p-4 sm:p-5">
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Tipo de servicio</p>
          {serviceType ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/15 px-2.5 py-1 text-sm font-medium text-primary">
              {serviceType}
              {isCustom && (
                <span className="rounded bg-primary/20 px-1.5 text-xs font-normal">Personalizado</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground/60 italic">Sin seleccionar</span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <Row label="Cliente" value={order.clientName} />
          <Row label="Empresa" value={order.company} />
          <Row label="Equipo" value={order.equipmentModel} />
          <Row label="N.º de serie" value={order.serialNumber} mono />
          <div className="col-span-2">
            <Row label="Técnico responsable" value={order.technician} />
          </div>
        </dl>

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Trabajo realizado</p>
          <p className={cn('rounded-lg bg-background/50 p-3 text-sm leading-relaxed whitespace-pre-wrap', !order.description && 'text-muted-foreground/60 italic')}>
            {order.description || 'Sin descripción'}
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            {'Repuestos ('}
            {order.parts.length}
            {')'}
          </p>
          {order.parts.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="sr-only">
                <tr>
                  <th>Repuesto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.parts.map((part) => (
                  <tr key={part.id}>
                    <td className="py-1.5 pr-2">
                      {part.name}
                      {part.code && (
                        <span className="ml-2 font-mono text-xs uppercase text-muted-foreground">{part.code}</span>
                      )}
                    </td>
                    <td className="py-1.5 text-right font-mono">{'×'}{part.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">Ninguno</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            {'Fotografías ('}
            {order.photos.length}
            {')'}
          </p>
          {order.photos.length > 0 ? (
            <ul className="grid grid-cols-4 gap-2">
              {order.photos.map((photo, i) => (
                <li key={photo.id} className="aspect-square overflow-hidden rounded-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                  <img src={photo.dataUrl || '/placeholder.svg'} alt={`Miniatura de fotografía ${i + 1}`} className="size-full object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">Sin fotografías</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Firma de conformidad</p>
          <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50">
            {order.signature ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
              <img src={order.signature || '/placeholder.svg'} alt="Firma del cliente" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-sm text-slate-500">Firma pendiente</span>
            )}
          </div>
          <p className="mt-1.5 text-center text-sm text-muted-foreground">
            {order.signerName || order.clientName || 'Nombre de quien recibe'}
          </p>
        </div>
      </div>
    </section>
  )
}
