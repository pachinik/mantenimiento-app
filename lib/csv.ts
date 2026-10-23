import { fileStamp, formatDateTime } from './format'
import type { MaintenanceRecord } from './records'

const HEADERS = [
  'Número de orden',
  'Fecha',
  'Cliente',
  'Empresa',
  'Equipo',
  'N.º de serie',
  'Tipo de servicio',
  'Técnico',
  'Descripción',
  'Repuestos',
  'Fotos',
  'Firmado por',
  'Firma',
]

const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

export function exportRecordsCsv(records: MaintenanceRecord[]) {
  const rows = records.map((r) => [
    r.orderNumber,
    formatDateTime(r.createdAt),
    r.clientName,
    r.company,
    r.equipmentModel,
    r.serialNumber,
    r.serviceType,
    r.technician,
    r.description,
    r.parts.map((p) => `${p.name}${p.code ? ` [${p.code}]` : ''} x${p.quantity}`).join(' | '),
    r.photos.join(' | '),
    r.signerName,
    r.signatureUrl ?? '',
  ])
  const csv = '\uFEFF' + [HEADERS, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `historial-ordenes-${fileStamp()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
