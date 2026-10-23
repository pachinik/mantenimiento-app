'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadRecordPdf } from '@/lib/pdf'
import type { MaintenanceRecord } from '@/lib/records'
import { cn } from '@/lib/utils'

export function DownloadPdfButton({
  record,
  className,
  variant = 'default',
}: {
  record: MaintenanceRecord
  className?: string
  variant?: 'default' | 'outline'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      await downloadRecordPdf(record)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Button type="button" variant={variant} onClick={handleClick} disabled={loading} className="h-11 font-semibold">
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
        {loading ? 'Generando PDF…' : 'Descargar PDF'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
