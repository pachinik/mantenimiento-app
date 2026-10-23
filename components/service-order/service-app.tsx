'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Save, X } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { DownloadPdfButton } from '@/components/download-pdf-button'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import type { MaintenanceRecord } from '@/lib/records'
import { createEmptyOrder, generateOrderNumber, validateOrder, type ServiceOrder } from '@/lib/service-order'
import { submitOrder } from '@/lib/submit-order'
import { OrderDetails } from './order-details'
import { PartsList } from './parts-list'
import { PhotoUpload } from './photo-upload'
import { ReportSummary } from './report-summary'
import { SignaturePad } from './signature-pad'

type Status =
  | { type: 'idle' }
  | { type: 'saving' }
  | { type: 'success'; record: MaintenanceRecord }
  | { type: 'error'; messages: string[]; title?: string }

export function ServiceApp() {
  const [order, setOrder] = useState<ServiceOrder>(createEmptyOrder)
  const [orderNumber, setOrderNumber] = useState('OS-—')
  const [date, setDate] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  useEffect(() => {
    setOrderNumber(generateOrderNumber())
    setDate(formatDateTime(new Date()))
    const timer = setInterval(() => setDate(formatDateTime(new Date())), 30_000)
    return () => clearInterval(timer)
  }, [])

  function update<K extends keyof ServiceOrder>(key: K, value: ServiceOrder[K]) {
    setOrder((prev) => ({ ...prev, [key]: value }))
    if (status.type === 'error') setStatus({ type: 'idle' })
  }

  async function handleSave() {
    const errors = validateOrder(order)
    if (errors.length > 0) {
      setStatus({ type: 'error', messages: errors })
      return
    }
    setStatus({ type: 'saving' })
    try {
      const record = await submitOrder(order, orderNumber)
      setSavedCount((c) => c + 1)
      setStatus({ type: 'success', record })
      setOrder(createEmptyOrder())
      setOrderNumber(generateOrderNumber())
      setDate(formatDateTime(new Date()))
    } catch (err) {
      setStatus({
        type: 'error',
        title: 'Error al enviar a Supabase',
        messages: [err instanceof Error ? err.message : 'Error desconocido al conectar con el servidor.'],
      })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh pb-28 lg:pb-10">
      <AppHeader>
        <p className="font-mono text-sm">{orderNumber}</p>
        <p className="text-xs text-muted-foreground">
          {savedCount} {savedCount === 1 ? 'registro guardado' : 'registros guardados'}
        </p>
      </AppHeader>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Nueva orden de servicio</h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Completa los datos del servicio, adjunta evidencia y obtén la firma de conformidad.
          </p>
        </div>

        <div aria-live="polite">
          {status.type === 'success' && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Servicio registrado correctamente</p>
                  <p className="text-sm text-muted-foreground">
                    {'Orden '}
                    <span className="font-mono text-foreground">{status.record.orderNumber}</span>
                    {' del '}
                    <span className="font-mono text-foreground">{formatDateTime(status.record.createdAt)}</span>
                    {' enviada a Supabase con sus fotos y firma.'}
                  </p>
                </div>
                <DownloadPdfButton record={status.record} variant="outline" className="shrink-0" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setStatus({ type: 'idle' })} aria-label="Cerrar aviso">
                <X aria-hidden="true" />
              </Button>
            </div>
          )}
          {status.type === 'error' && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <p className="font-medium">{status.title ?? 'No se pudo registrar el servicio'}</p>
                {!status.title && <p className="text-sm text-muted-foreground">Revisa los siguientes campos:</p>}
                <ul className="mt-1 list-inside list-disc text-sm">
                  {status.messages.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            <OrderDetails order={order} onChange={update} />
            <PartsList parts={order.parts} onChange={(parts) => update('parts', parts)} />
            <PhotoUpload photos={order.photos} onChange={(photos) => update('photos', photos)} />
            <SignaturePad
              signerName={order.signerName}
              signature={order.signature}
              onSignerNameChange={(v) => update('signerName', v)}
              onSignatureChange={(v) => update('signature', v)}
            />
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <ReportSummary order={order} orderNumber={orderNumber} date={date} />
            <Button
              type="button"
              onClick={handleSave}
              disabled={status.type === 'saving'}
              className="hidden h-14 w-full text-base font-semibold lg:inline-flex"
            >
              {status.type === 'saving' ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-5" aria-hidden="true" />
              )}
              Guardar y Registrar Servicio
            </Button>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur lg:hidden">
        <Button
          type="button"
          onClick={handleSave}
          disabled={status.type === 'saving'}
          className="h-14 w-full text-base font-semibold"
        >
          {status.type === 'saving' ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-5" aria-hidden="true" />
          )}
          {status.type === 'saving' ? 'Enviando…' : 'Guardar y Registrar Servicio'}
        </Button>
      </div>
    </div>
  )
}
