import { nanoid } from 'nanoid'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

interface ProductionBatch {
  id: string
  sku: string
  quantity: number
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED'
  created_at: string
}

interface InventoryItem {
  id: string
  sku: string
  status1: 'PRODUCTION'
  status2: 'UNCOMMITTED'
  qr_code: string
  batch_id: string
  created_at: string
}

export async function createProductionBatch({ 
  sku, 
  quantity 
}: { 
  sku: string
  quantity: number 
}): Promise<ProductionBatch> {
  const batch = {
    id: `batch_${nanoid()}`,
    sku,
    quantity,
    status: 'CREATED' as const,
    created_at: new Date().toISOString(),
  }

  // TODO: Save batch to your backend
  return batch
}

export async function generateInventoryItems({
  batchId,
  sku,
  quantity,
}: {
  batchId: string
  sku: string
  quantity: number
}): Promise<InventoryItem[]> {
  const items: InventoryItem[] = []

  for (let i = 0; i < quantity; i++) {
    const id = `inv_${nanoid()}`
    const qrCode = await QRCode.toDataURL(id)

    items.push({
      id,
      sku,
      status1: 'PRODUCTION',
      status2: 'UNCOMMITTED',
      qr_code: qrCode,
      batch_id: batchId,
      created_at: new Date().toISOString(),
    })
  }

  // TODO: Save inventory items to your backend
  return items
}

export async function generateBatchQRCodesPDF(items: InventoryItem[]): Promise<string> {
  const doc = new jsPDF()
  const qrSize = 50
  const margin = 10
  const itemsPerRow = 3
  const itemsPerPage = 12

  items.forEach((item, index) => {
    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage()
    }

    const pageIndex = index % itemsPerPage
    const row = Math.floor(pageIndex / itemsPerRow)
    const col = pageIndex % itemsPerRow

    const x = margin + (col * (qrSize + margin))
    const y = margin + (row * (qrSize + margin))

    // Add QR Code
    doc.addImage(item.qr_code, 'PNG', x, y, qrSize, qrSize)

    // Add SKU and ID below QR code
    doc.setFontSize(8)
    doc.text(item.sku, x, y + qrSize + 5)
    doc.text(item.id, x, y + qrSize + 10)
  })

  return doc.output('datauristring')
} 