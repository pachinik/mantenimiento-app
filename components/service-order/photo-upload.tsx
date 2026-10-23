'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { compressImage, createId, type Photo } from '@/lib/service-order'
import { SectionCard } from './form-primitives'

type Props = {
  photos: Photo[]
  onChange: (photos: Photo[]) => void
}

export function PhotoUpload({ photos, onChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (files.length === 0) return
    setProcessing(true)
    setError(null)
    try {
      const added = await Promise.all(
        files.map(async (file) => ({
          id: createId(),
          name: file.name,
          dataUrl: await compressImage(file),
        })),
      )
      onChange([...photos, ...added])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la imagen')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <SectionCard
      icon={Camera}
      step={3}
      title="Fotografías y adjuntos"
      description="Toma fotos con la cámara del dispositivo o súbelas desde la galería."
    >
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          className="h-14 text-base"
          onClick={() => cameraRef.current?.click()}
          disabled={processing}
        >
          <Camera className="size-5" aria-hidden="true" />
          Tomar foto
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14 text-base"
          onClick={() => galleryRef.current?.click()}
          disabled={processing}
        >
          <ImagePlus className="size-5" aria-hidden="true" />
          Subir imagen
        </Button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFiles}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFiles}
      />

      <div aria-live="polite">
        {processing && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Procesando imágenes...
          </p>
        )}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No hay fotografías adjuntas.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
              <img
                src={photo.dataUrl || '/placeholder.svg'}
                alt={`Fotografía ${index + 1} adjunta`}
                className="size-full object-cover"
              />
              <span className="absolute bottom-2 left-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">
                {String(index + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
                className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow transition-colors hover:bg-destructive hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                aria-label={`Eliminar fotografía ${index + 1}`}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
