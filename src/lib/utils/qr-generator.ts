import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import type { InventoryItem } from '@/lib/schema'

// QR code configuration
const QR_CONFIG = {
  width: 128,
  margin: 0,
  color: {
    dark: '#000',
    light: '#fff'
  }
}

// PDF configuration for label printer format
const PDF_CONFIG = {
  pageWidth: 2,        // 2 inches wide
  pageHeight: 11,      // Standard letter height
  qrSize: 1.75,        // QR code size in inches
  labelHeight: 2.5,    // Height of each label section in inches
  margin: 0.125,       // Margin in inches
  fontSize: 8          // Font size in points
}

export async function generateBatchQRPdf(items: InventoryItem[], batchId: string): Promise<Blob> {
  // Create new PDF document in portrait mode with inches as unit
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight]
  })

  let currentY = PDF_CONFIG.margin

  for (const item of items) {
    // Check if we need a new page
    if (currentY + PDF_CONFIG.labelHeight > PDF_CONFIG.pageHeight) {
      doc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight])
      currentY = PDF_CONFIG.margin
    }

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      id: item.id,
      sku: item.sku,
      batch_id: batchId
    }), QR_CONFIG)

    // Center X position for QR code
    const centerX = (PDF_CONFIG.pageWidth - PDF_CONFIG.qrSize) / 2

    // Add QR code
    doc.addImage(
      qrDataUrl,
      'PNG',
      centerX,
      currentY,
      PDF_CONFIG.qrSize,
      PDF_CONFIG.qrSize
    )

    // Add text information below QR code
    doc.setFontSize(PDF_CONFIG.fontSize)
    const textY = currentY + PDF_CONFIG.qrSize + 0.1 // Small gap after QR

    // Center text
    const textWidth = doc.getStringUnitWidth(item.sku) * PDF_CONFIG.fontSize / 72
    const textX = (PDF_CONFIG.pageWidth - textWidth) / 2

    // Add text lines
    doc.text(item.sku, textX, textY)
    doc.text(`ID: ${item.id}`, textX, textY + 0.15)
    doc.text(`Batch: ${batchId}`, textX, textY + 0.3)

    // Move to next label position
    currentY += PDF_CONFIG.labelHeight
  }

  // Return as blob
  return doc.output('blob')
} 