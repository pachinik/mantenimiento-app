'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Eraser, PenLine, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, SectionCard, inputClass } from './form-primitives'

type Props = {
  signerName: string
  signature: string | null
  onSignerNameChange: (value: string) => void
  onSignatureChange: (value: string | null) => void
}

const INK_COLOR = '#0f1b33'

export function SignaturePad({
  signerName,
  signature,
  onSignerNameChange,
  onSignatureChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let lastWidth = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (Math.round(rect.width) === lastWidth) return
      lastWidth = Math.round(rect.width)
      const ratio = window.devicePixelRatio || 1
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(ratio, ratio)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = INK_COLOR
      ctx.lineWidth = 2.5
      setHasStrokes(false)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (signature === null) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      setHasStrokes(false)
      setDirty(false)
    }
  }, [signature])

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const point = getPoint(e)
    lastPointRef.current = point
    const ctx = e.currentTarget.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = INK_COLOR
      ctx.fill()
    }
    setHasStrokes(true)
    setDirty(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !lastPointRef.current) return
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    const point = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
  }

  function stopDrawing() {
    drawingRef.current = false
    lastPointRef.current = null
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }
    setHasStrokes(false)
    setDirty(false)
    onSignatureChange(null)
  }

  function save() {
    const canvas = canvasRef.current
    if (!canvas || !hasStrokes) return
    onSignatureChange(canvas.toDataURL('image/png'))
    setDirty(false)
  }

  const isSaved = Boolean(signature) && !dirty

  return (
    <SectionCard
      icon={PenLine}
      step={4}
      title="Firma digital"
      description="El cliente o responsable de recibir el servicio firma en el recuadro."
    >
      <Field id="signerName" label="Nombre de quien recibe" className="mb-4">
        <input
          id="signerName"
          className={inputClass}
          value={signerName}
          onChange={(e) => onSignerNameChange(e.target.value)}
          placeholder="Nombre y cargo"
        />
      </Field>

      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-input bg-slate-50">
        <canvas
          ref={canvasRef}
          className="block h-52 w-full cursor-crosshair touch-none sm:h-60"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          role="img"
          aria-label="Área de firma. Dibuje su firma con el dedo, lápiz o ratón."
        />
        <div className="pointer-events-none absolute right-6 bottom-10 left-6 border-b border-slate-300" aria-hidden="true" />
        {!hasStrokes && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm text-slate-500">
            Firme aquí
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p
          className="flex-1 text-sm"
          aria-live="polite"
        >
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Firma guardada
            </span>
          ) : dirty ? (
            <span className="text-muted-foreground">Firma sin guardar</span>
          ) : (
            <span className="text-muted-foreground">Pendiente de firma</span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-12 px-4 text-base" onClick={clear}>
            <Eraser className="size-5" aria-hidden="true" />
            Limpiar firma
          </Button>
          <Button
            type="button"
            className="h-12 px-4 text-base"
            onClick={save}
            disabled={!hasStrokes || isSaved}
          >
            <Save className="size-5" aria-hidden="true" />
            Guardar firma
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
