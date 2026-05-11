const pageWidth = 612
const pageHeight = 792
const margin = 54
const lineHeight = 18
const maxLineLength = 82

const periodLabels = {
  week: 'Esta semana',
  month: 'Este mes',
  year: 'Este ano',
}

function cleanText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\\()]/g, '\\$&')
}

function wrapLine(text) {
  const words = cleanText(text).split(/\s+/)
  const lines = []
  let currentLine = ''

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (nextLine.length > maxLineLength) {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = nextLine
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

function buildContentStream(lines) {
  const commands = ['BT', '/F1 12 Tf', '14 TL', `${margin} ${pageHeight - margin} Td`]

  lines.forEach((line, index) => {
    if (index > 0) commands.push('T*')
    commands.push(`(${cleanText(line)}) Tj`)
  })

  commands.push('ET')
  return commands.join('\n')
}

function byteLength(value) {
  return new TextEncoder().encode(value).length
}

function buildPdf(lines) {
  const contentStream = buildContentStream(lines)
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${byteLength(contentStream)} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object) => {
    offsets.push(byteLength(pdf))
    pdf += object
  })

  const xrefOffset = byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

function downloadPdf(pdf, filename) {
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function generateDashboardPdf({ role, content, period, user }) {
  const today = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const lines = [
    'Reporte del panel de alojamiento',
    `Fecha: ${today}`,
    `Usuario: ${user?.name || 'Usuario demo'}`,
    `Rol: ${role.name}`,
    `Grupo: ${role.group}`,
    `Periodo: ${periodLabels[period] || periodLabels.month}`,
    '',
    content.headline,
    content.summary,
    '',
    'Permisos:',
    ...role.permissions.map((permission) => `- ${permission}`),
    '',
    'Acciones disponibles:',
    ...content.actions.map((action) => `- ${action}`),
    '',
    'Modulos:',
    ...content.modules.flatMap((module) => [
      `- ${module.title}`,
      `  ${module.detail}`,
    ]),
  ].flatMap((line) => (line ? wrapLine(line) : ['']))

  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)
  const pdf = buildPdf(lines.slice(0, maxLines))
  const filename = `reporte-${role.id}-${period}.pdf`

  downloadPdf(pdf, filename)
}

export function generateGuestReservationPdf({
  guestName,
  reservationNumber,
  checkIn,
  checkOut,
  amountPaid,
  reservationType,
  hotelName,
  nights,
}) {
  const lines = [
    'Comprobante de reservacion pagada',
    '',
    `Nombre del huesped: ${guestName}`,
    `Numero de reservacion: ${reservationNumber}`,
    `Hotel: ${hotelName}`,
    `Fecha de reservacion: ${checkIn}`,
    `Fin de la reservacion: ${checkOut}`,
    `Noches: ${nights}`,
    `Monto de la reservacion pagada: $${amountPaid.toLocaleString()}`,
    `Tipo de reservacion: ${reservationType}`,
    '',
    'Estado: Confirmada y pagada',
    'Gracias por reservar con Estetica Hoteles.',
  ].flatMap((line) => (line ? wrapLine(line) : ['']))

  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)
  const pdf = buildPdf(lines.slice(0, maxLines))
  const filename = `reservacion-${reservationNumber}.pdf`

  downloadPdf(pdf, filename)
}
