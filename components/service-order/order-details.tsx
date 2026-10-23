'use client'

import { ChevronDown, ClipboardList } from 'lucide-react'
import {
  OTHER_SERVICE_TYPE,
  SERVICE_TYPES,
  type ServiceOrder,
} from '@/lib/service-order'
import { cn } from '@/lib/utils'
import { Field, SectionCard, inputClass } from './form-primitives'

type Props = {
  order: ServiceOrder
  onChange: <K extends keyof ServiceOrder>(key: K, value: ServiceOrder[K]) => void
}

export function OrderDetails({ order, onChange }: Props) {
  const isOther = order.serviceType === OTHER_SERVICE_TYPE

  return (
    <SectionCard
      icon={ClipboardList}
      step={1}
      title="Orden de servicio"
      description="Datos del cliente, equipo y trabajo realizado."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="clientName" label="Nombre del cliente" required>
          <input
            id="clientName"
            className={inputClass}
            value={order.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            placeholder="Ej. María González"
            autoComplete="name"
          />
        </Field>
        <Field id="company" label="Empresa">
          <input
            id="company"
            className={inputClass}
            value={order.company}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder="Ej. Industrias del Norte S.A."
            autoComplete="organization"
          />
        </Field>
        <Field id="equipmentModel" label="Modelo del equipo" required>
          <input
            id="equipmentModel"
            className={inputClass}
            value={order.equipmentModel}
            onChange={(e) => onChange('equipmentModel', e.target.value)}
            placeholder="Ej. Compresor Atlas GA-37"
          />
        </Field>
        <Field id="serialNumber" label="Número de serie" required>
          <input
            id="serialNumber"
            className={cn(inputClass, 'font-mono uppercase')}
            value={order.serialNumber}
            onChange={(e) => onChange('serialNumber', e.target.value)}
            placeholder="SN-000000"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </Field>
        <Field id="serviceType" label="Tipo de servicio" required>
          <div className="relative">
            <select
              id="serviceType"
              className={cn(inputClass, 'appearance-none pr-10', !order.serviceType && 'text-muted-foreground/70')}
              value={order.serviceType}
              onChange={(e) => onChange('serviceType', e.target.value)}
            >
              <option value="" disabled>
                Selecciona un tipo de servicio
              </option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value={OTHER_SERVICE_TYPE}>{OTHER_SERVICE_TYPE}</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </Field>
        <Field id="technician" label="Técnico responsable" required>
          <input
            id="technician"
            className={inputClass}
            value={order.technician}
            onChange={(e) => onChange('technician', e.target.value)}
            placeholder="Nombre del técnico"
          />
        </Field>

        {isOther && (
          <Field
            id="customServiceType"
            label="Especificar tipo de servicio"
            required
            className="md:col-span-2 animate-in fade-in slide-in-from-top-1"
          >
            <input
              id="customServiceType"
              className={cn(inputClass, 'border-primary/60')}
              value={order.customServiceType}
              onChange={(e) => onChange('customServiceType', e.target.value)}
              placeholder="Ej. Inspección de seguridad eléctrica"
              autoFocus
            />
          </Field>
        )}

        <Field
          id="description"
          label="Descripción del trabajo / observación del problema"
          required
          className="md:col-span-2"
        >
          <textarea
            id="description"
            rows={5}
            className={cn(inputClass, 'h-auto min-h-32 resize-y py-3 leading-relaxed')}
            value={order.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe el problema encontrado, el diagnóstico y las acciones realizadas..."
          />
        </Field>
      </div>
    </SectionCard>
  )
}
