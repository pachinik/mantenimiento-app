import { MAINTENANCE_TABLE, getSupabase } from './supabase'

export type RecordPart = { name: string; code: string; quantity: number }

export type MaintenanceRecord = {
  id: string
  orderNumber: string
  createdAt: string | null
  clientName: string
  company: string
  equipmentModel: string
  serialNumber: string
  serviceType: string
  technician: string
  description: string
  signerName: string
  parts: RecordPart[]
  photos: string[]
  signatureUrl: string | null
}

type Row = Record<string, unknown>

const ORDER_NUMBER_PATTERN = /OS-\d{8}-\d{4}/
const SIGNED_BY_SEPARATOR = '\n\nFirmado por: '

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

function parseUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
  if (typeof value === 'string' && value.trim()) {
    try {
      return parseUrls(JSON.parse(value))
    } catch {
      return [value.trim()]
    }
  }
  return []
}

function parseParts(value: unknown): RecordPart[] {
  let parsed = value
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return []
    try {
      parsed = JSON.parse(text)
    } catch {
      return [{ name: text, code: '', quantity: 1 }]
    }
  }
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((p) =>
      typeof p === 'string'
        ? { name: p, code: '', quantity: 1 }
        : { name: str(p?.name), code: str(p?.code), quantity: Number(p?.quantity) || 1 },
    )
    .filter((p) => p.name)
}

export function recordFromRow(row: Row): MaintenanceRecord {
  const photos = parseUrls(row.photos ?? row.photo_urls)
  const signatureUrl = str(row.signature_url) || null

  let clientName = str(row.client_name)
  let company = str(row.company)
  if (company && clientName.endsWith(` (${company})`)) {
    clientName = clientName.slice(0, -(company.length + 3))
  } else if (!company) {
    const match = clientName.match(/^(.*) \(([^()]+)\)$/)
    if (match) [, clientName, company] = match
  }

  let description = str(row.description)
  let signerName = str(row.signer_name)
  const signedAt = description.lastIndexOf(SIGNED_BY_SEPARATOR)
  if (signedAt !== -1) {
    signerName ||= description.slice(signedAt + SIGNED_BY_SEPARATOR.length).trim()
    description = description.slice(0, signedAt)
  }

  const fallbackNumber = [signatureUrl ?? '', ...photos].join(' ').match(ORDER_NUMBER_PATTERN)?.[0]

  return {
    id: str(row.id),
    orderNumber: str(row.order_number) || fallbackNumber || `#${str(row.id)}`,
    createdAt: str(row.created_at) || null,
    clientName,
    company,
    equipmentModel: str(row.equipment_model),
    serialNumber: str(row.serial_number),
    serviceType: str(row.service_type),
    technician: str(row.technician_name) || str(row.technician),
    description,
    signerName,
    parts: parseParts(row.parts_used ?? row.parts),
    photos,
    signatureUrl,
  }
}

export async function fetchRecords() {
  const { data, error } = await getSupabase()
    .from(MAINTENANCE_TABLE)
    .select('*')
    .order('created_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
  if (error) throw new Error(`Error al leer el historial: ${error.message}`)
  return (data ?? []).map(recordFromRow)
}

export async function fetchRecord(id: string) {
  const { data, error } = await getSupabase().from(MAINTENANCE_TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Error al leer la orden: ${error.message}`)
  return data ? recordFromRow(data) : null
}
