import type { jsPDF as JsPDF } from 'jspdf'
import { formatDateTime } from './format'
import type { MaintenanceRecord } from './records'

type LoadedImage = { data: string; width: number; height: number; format: 'JPEG' | 'PNG' }
type RGB = [number, number, number]

const ACCENT: RGB = [59, 130, 246]
const DARK: RGB = [24, 30, 42]
const TEXT: RGB = [30, 36, 48]
const MUTED: RGB = [110, 118, 132]
const LINE: RGB = [222, 226, 232]

async function loadImage(src: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(src, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
    const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = data
    })
    return { data, ...size, format: blob.type.includes('png') ? 'PNG' : 'JPEG' }
  } catch {
    return null
  }
}

function fit(img: LoadedImage, maxW: number, maxH: number) {
  const scale = Math.min(maxW / img.width, maxH / img.height)
  return { w: img.width * scale, h: img.height * scale }
}

export async function downloadRecordPdf(record: MaintenanceRecord) {
  const [{ jsPDF }, photos, signature] = await Promise.all([
    import('jspdf'),
    Promise.all(record.photos.map(loadImage)),
    record.signatureUrl ? loadImage(record.signatureUrl) : Promise.resolve(null),
  ])

  const doc: JsPDF = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentW = pageW - margin * 2
  const bottom = pageH - margin - 6
  let y = 0

  const color = (rgb: RGB) => doc.setTextColor(...rgb)
  const ensure = (h: number) => {
    if (y + h > bottom) {
      doc.addPage()
      y = margin
    }
  }
  const sectionTitle = (text: string) => {
    ensure(14)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    color(ACCENT)
    doc.text(text.toUpperCase(), margin, y)
    doc.setDrawColor(...LINE)
    doc.line(margin, y + 2, pageW - margin, y + 2)
    y += 8
  }

  doc.setFillColor(...DARK)
  doc.rect(0, 0, pageW, 32, 'F')
  doc.setFillColor(...ACCENT)
  doc.rect(0, 32, pageW, 1.2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('Orden de servicio técnico', margin, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(176, 186, 202)
  doc.text('FieldService - Registro técnico en campo', margin, 22)
  doc.setFont('courier', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(record.orderNumber, pageW - margin, 15, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(176, 186, 202)
  doc.text(formatDateTime(record.createdAt), pageW - margin, 22, { align: 'right' })
  y = 42

  sectionTitle('Datos de la orden')
  const fields: [string, string][] = [
    ['Número de orden', record.orderNumber],
    ['Fecha', formatDateTime(record.createdAt)],
    ['Cliente', record.clientName],
    ['Empresa', record.company],
    ['Equipo', record.equipmentModel],
    ['N.º de serie', record.serialNumber],
    ['Tipo de servicio', record.serviceType],
    ['Técnico responsable', record.technician],
  ]
  const colW = contentW / 2
  for (let i = 0; i < fields.length; i += 2) {
    const cells = fields.slice(i, i + 2).map(([label, value]) => ({
      label,
      lines: doc.setFontSize(10.5).splitTextToSize(value || 'Sin especificar', colW - 6) as string[],
      empty: !value,
    }))
    const rowH = 5 + Math.max(...cells.map((c) => c.lines.length)) * 5 + 3
    ensure(rowH)
    cells.forEach((cell, col) => {
      const x = margin + col * colW
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      color(MUTED)
      doc.text(cell.label.toUpperCase(), x, y)
      doc.setFont('helvetica', cell.empty ? 'italic' : 'normal')
      doc.setFontSize(10.5)
      color(cell.empty ? MUTED : TEXT)
      doc.text(cell.lines, x, y + 5.5)
    })
    y += rowH
  }

  sectionTitle('Descripción del trabajo')
  doc.setFont('helvetica', record.description ? 'normal' : 'italic')
  doc.setFontSize(10.5)
  color(record.description ? TEXT : MUTED)
  const descLines = doc.splitTextToSize(record.description || 'Sin descripción', contentW) as string[]
  for (const line of descLines) {
    ensure(5.5)
    doc.text(line, margin, y)
    y += 5.5
  }

  sectionTitle(`Repuestos utilizados (${record.parts.length})`)
  if (record.parts.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    color(MUTED)
    doc.text('Ninguno', margin, y)
    y += 6
  } else {
    const codeX = margin + contentW * 0.62
    const qtyX = pageW - margin - 3
    const drawHeader = () => {
      doc.setFillColor(240, 243, 247)
      doc.rect(margin, y - 4.5, contentW, 7.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      color(MUTED)
      doc.text('REPUESTO', margin + 3, y)
      doc.text('CÓDIGO', codeX, y)
      doc.text('CANT.', qtyX, y, { align: 'right' })
      y += 7.5
    }
    ensure(16)
    drawHeader()
    record.parts.forEach((part) => {
      doc.setFontSize(10)
      const nameLines = doc.splitTextToSize(part.name, contentW * 0.58) as string[]
      const rowH = nameLines.length * 5 + 2.5
      if (y + rowH > bottom) {
        doc.addPage()
        y = margin + 4
        drawHeader()
      }
      doc.setFont('helvetica', 'normal')
      color(TEXT)
      doc.text(nameLines, margin + 3, y)
      doc.setFont('courier', 'normal')
      doc.text(part.code ? part.code.toUpperCase() : '-', codeX, y)
      doc.text(`x${part.quantity}`, qtyX, y, { align: 'right' })
      doc.setDrawColor(...LINE)
      doc.line(margin, y + rowH - 4, pageW - margin, y + rowH - 4)
      y += rowH
    })
  }

  sectionTitle(`Fotografías (${record.photos.length})`)
  if (photos.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    color(MUTED)
    doc.text('Sin fotografías', margin, y)
    y += 6
  } else {
    const gap = 6
    const cellW = (contentW - gap) / 2
    const maxH = 72
    for (let i = 0; i < photos.length; i += 2) {
      const pair = photos.slice(i, i + 2)
      const sizes = pair.map((img) => (img ? fit(img, cellW, maxH) : { w: cellW, h: 30 }))
      const rowH = Math.max(...sizes.map((s) => s.h))
      ensure(rowH + gap)
      pair.forEach((img, col) => {
        const x = margin + col * (cellW + gap)
        const { w, h } = sizes[col]
        if (img) {
          doc.addImage(img.data, img.format, x + (cellW - w) / 2, y, w, h)
          doc.setDrawColor(...LINE)
          doc.rect(x + (cellW - w) / 2, y, w, h)
        } else {
          doc.setDrawColor(...LINE)
          doc.rect(x, y, cellW, h)
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(9)
          color(MUTED)
          doc.text(`No se pudo cargar la foto ${i + col + 1}`, x + cellW / 2, y + h / 2, { align: 'center' })
        }
      })
      y += rowH + gap
    }
  }

  sectionTitle('Firma de conformidad del cliente')
  const boxW = 90
  const boxH = 38
  ensure(boxH + 16)
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(...LINE)
  doc.rect(margin, y, boxW, boxH, 'FD')
  if (signature) {
    const { w, h } = fit(signature, boxW - 8, boxH - 8)
    doc.addImage(signature.data, signature.format, margin + (boxW - w) / 2, y + (boxH - h) / 2, w, h)
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    color(MUTED)
    doc.text('Firma no disponible', margin + boxW / 2, y + boxH / 2, { align: 'center' })
  }
  y += boxH + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  color(TEXT)
  doc.text(record.signerName || record.clientName || 'Cliente', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  color(MUTED)
  doc.text('Nombre de quien recibe el servicio', margin, y + 4.5)

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    color(MUTED)
    doc.text(`${record.orderNumber} - ${formatDateTime(record.createdAt)}`, margin, pageH - 8)
    doc.text(`Página ${i} de ${pages}`, pageW - margin, pageH - 8, { align: 'right' })
  }

  doc.save(`${record.orderNumber.replace(/[\\/:*?"<>|#]/g, '').trim() || 'orden'}.pdf`)
}
