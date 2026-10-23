'use client'

import { useState } from 'react'
import { Minus, Package, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createId, type Part } from '@/lib/service-order'
import { cn } from '@/lib/utils'
import { SectionCard, inputClass } from './form-primitives'

type Props = {
  parts: Part[]
  onChange: (parts: Part[]) => void
}

export function PartsList({ parts, onChange }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [quantity, setQuantity] = useState('')

  function addPart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    
    // Si la cantidad está vacía, toma 1 por defecto
    const finalQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1)
    
    onChange([...parts, { id: createId(), name: name.trim(), code: code.trim(), quantity: finalQuantity }])
    setName('')
    setCode('')
    setQuantity('')
  }

  function updateQuantity(id: string, delta: number) {
    onChange(
      parts.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)),
    )
  }

  const totalUnits = parts.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <SectionCard
      icon={Package}
      step={2}
      title="Repuestos utilizados"
      description="Agrega cada repuesto o material empleado en el servicio."
    >
      <form onSubmit={addPart} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="partName" className="text-sm font-medium text-secondary-foreground">
            Descripción del repuesto
          </label>
          <input
            id="partName"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Filtro de aceite"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2 sm:w-36 sm:flex-none">
            <label htmlFor="partCode" className="text-sm font-medium text-secondary-foreground">
              Código
            </label>
            <input
              id="partCode"
              className={cn(inputClass, 'font-mono uppercase')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Opcional"
              spellCheck={false}
            />
          </div>
          <div className="flex w-24 flex-col gap-2">
            <label htmlFor="partQty" className="text-sm font-medium text-secondary-foreground">
              Cant.
            </label>
            <input
              id="partQty"
              type="number"
              inputMode="numeric"
              min={1}
              className={cn(inputClass, 'text-center font-mono')}
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="h-12 px-5 text-base" disabled={!name.trim()}>
          <Plus className="size-5" aria-hidden="true" />
          Agregar
        </Button>
      </form>

      {parts.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no se han agregado repuestos.
        </p>
      ) : (
        <div className="mt-5">
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
            {parts.map((part, index) => (
              <li key={part.id} className="flex items-center gap-3 bg-background/40 px-3 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{part.name}</p>
                  {part.code && (
                    <p className="font-mono text-xs uppercase text-muted-foreground">{part.code}</p>
                  )}
                </div>
                <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${part.name}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    onClick={() => updateQuantity(part.id, -1)}
                    disabled={part.quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus aria-hidden="true" />
                  </Button>
                  <span className="w-8 text-center font-mono" aria-live="polite">
                    {part.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    onClick={() => updateQuantity(part.id, 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-lg"
                  onClick={() => onChange(parts.filter((p) => p.id !== part.id))}
                  aria-label={`Eliminar ${part.name}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-sm text-muted-foreground">
            {parts.length} {parts.length === 1 ? 'ítem' : 'ítems'} · {totalUnits}{' '}
            {totalUnits === 1 ? 'unidad' : 'unidades'}
          </p>
        </div>
      )}
    </SectionCard>
  )
}
