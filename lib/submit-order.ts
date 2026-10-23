import { MAINTENANCE_BUCKET, MAINTENANCE_TABLE, getSupabase } from './supabase'
import { recordFromRow } from './records'
import { resolveServiceType, type ServiceOrder } from './service-order'

async function dataUrlToBlob(dataUrl: string) {
  const res = await fetch(dataUrl)
  return res.blob()
}

async function uploadFile(path: string, dataUrl: string) {
  const supabase = getSupabase()
  const blob = await dataUrlToBlob(dataUrl)
  const { error } = await supabase.storage
    .from(MAINTENANCE_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw new Error(`Error al subir ${path}: ${error.message}`)
  return supabase.storage.from(MAINTENANCE_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function submitOrder(order: ServiceOrder, orderNumber: string) {
  const supabase = getSupabase()
  const folder = `${orderNumber}-${Date.now()}`

  const photoUrls = await Promise.all(
    order.photos.map((photo, i) => uploadFile(`${folder}/photo-${i + 1}.jpg`, photo.dataUrl)),
  )
  const signatureUrl = order.signature
    ? await uploadFile(`${folder}/signature.png`, order.signature)
    : null

  const company = order.company.trim()
  const signerName = order.signerName.trim()
  const description = [
    order.description.trim(),
    signerName ? `Firmado por: ${signerName}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const { data, error } = await supabase
    .from(MAINTENANCE_TABLE)
    .insert({
    order_number: orderNumber,
    created_at: new Date().toISOString(),
    client_name: company ? `${order.clientName.trim()} (${company})` : order.clientName.trim(),
    equipment_model: order.equipmentModel.trim(),
    serial_number: order.serialNumber.trim(),
    service_type: resolveServiceType(order),
    technician_name: order.technician.trim(),
    description,
    parts_used: JSON.stringify(
      order.parts.map(({ name, code, quantity }) => ({ name, code, quantity })),
    ),
    photos: photoUrls,
    signature_url: signatureUrl,
  })
    .select('*')
    .single()
  if (error) throw new Error(`Error al guardar el registro: ${error.message}`)
  return recordFromRow(data)
}
