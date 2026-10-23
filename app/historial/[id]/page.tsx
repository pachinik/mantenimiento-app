import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { DateTime } from '@/components/date-time'
import { DownloadPdfButton } from '@/components/download-pdf-button'
import { RecordDetail } from '@/components/history/record-detail'
import { fetchRecord } from '@/lib/records'

export const metadata: Metadata = {
  title: 'Detalle de orden | FieldService',
  description: 'Detalle completo de una orden de servicio técnico.',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const record = await fetchRecord(decodeURIComponent(id))
  if (!record) notFound()

  return (
    <div className="min-h-dvh pb-10">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          href="/historial"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al historial
        </Link>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-primary">{record.orderNumber}</p>
            <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{record.clientName || 'Orden de servicio'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {'Registrada el '}
              <DateTime value={record.createdAt} className="font-mono" />
            </p>
          </div>
          <DownloadPdfButton record={record} className="sm:w-48" />
        </div>
        <RecordDetail record={record} />
      </main>
    </div>
  )
}
