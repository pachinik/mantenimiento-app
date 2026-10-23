export const SERVICE_TYPES = [
  'Mantenimiento Preventivo',
  'Mantenimiento Correctivo',
  'Instalación',
  'Calibración/Diagnóstico',
] as const

export const OTHER_SERVICE_TYPE = 'Otro / Especificar'

export type Part = {
  id: string
  name: string
  code: string
  quantity: number
}

export type Photo = {
  id: string
  name: string
  dataUrl: string
}

export type ServiceOrder = {
  clientName: string
  company: string
  equipmentModel: string
  serialNumber: string
  serviceType: string
  customServiceType: string
  technician: string
  description: string
  parts: Part[]
  photos: Photo[]
  signerName: string
  signature: string | null
}

export type SavedServiceOrder = ServiceOrder & {
  orderNumber: string
  createdAt: string
}

export const STORAGE_KEY = 'fieldservice:orders'

export function createEmptyOrder(): ServiceOrder {
  return {
    clientName: '',
    company: '',
    equipmentModel: '',
    serialNumber: '',
    serviceType: '',
    customServiceType: '',
    technician: '',
    description: '',
    parts: [],
    photos: [],
    signerName: '',
    signature: null,
  }
}

export function resolveServiceType(order: ServiceOrder) {
  if (order.serviceType === OTHER_SERVICE_TYPE) return order.customServiceType.trim()
  return order.serviceType
}

export function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export function generateOrderNumber(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `OS-${stamp}-${suffix}`
}

export function validateOrder(order: ServiceOrder) {
  const errors: string[] = []
  if (!order.clientName.trim()) errors.push('Nombre del cliente')
  if (!order.equipmentModel.trim()) errors.push('Modelo del equipo')
  if (!order.serialNumber.trim()) errors.push('Número de serie')
  if (!resolveServiceType(order)) errors.push('Tipo de servicio')
  if (!order.technician.trim()) errors.push('Técnico responsable')
  if (!order.description.trim()) errors.push('Descripción del trabajo')
  if (!order.signature) errors.push('Firma del cliente (guardada)')
  return errors
}

export function compressImage(file: File, maxSize = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onerror = () => reject(new Error('Formato de imagen no soportado'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(reader.result as string)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
