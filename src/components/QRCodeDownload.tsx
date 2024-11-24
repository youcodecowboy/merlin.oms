import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { QrCode, Download, Printer, CheckCircle } from "lucide-react"
import { LoadingSpinner } from "./LoadingSpinner"
import { jsPDF } from "jspdf"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { logQRCodeDownload } from "@/lib/core-functions"
import type { InventoryItem } from "@/lib/schema"

interface QRCodeDownloadProps {
  qrCode?: string
  qrCodes?: string[]
  batchNumber?: number
  skus?: string[]
  fileName?: string
  variant?: "ghost" | "outline" | "default"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  label?: string
  allowPrint?: boolean
  item?: InventoryItem
}

export function QRCodeDownload({
  qrCode,
  qrCodes,
  batchNumber,
  skus,
  fileName = 'qr-code',
  variant = "ghost",
  size = "sm",
  showIcon = true,
  label,
  allowPrint = false,
  item
}: QRCodeDownloadProps) {
  const [loading, setLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'none' | 'downloaded' | 'printed'>('none')
  const { toast } = useToast()

  const downloadSingleQR = async () => {
    if (!qrCode) {
      toast({
        title: "Error",
        description: "No QR code available to download",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      const link = document.createElement('a')
      link.href = qrCode
      link.download = `${fileName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setDownloadStatus('downloaded')

      // Log the download event if item is provided
      if (item?.id) {
        await logQRCodeDownload(item.id, item)
      }

      toast({
        title: "Success",
        description: "QR code downloaded successfully"
      })
    } catch (error) {
      console.error('Failed to download QR code:', error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (forPrint: boolean = false) => {
    if (!qrCodes?.length) {
      toast({
        title: "Error",
        description: "No QR codes available",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // Initialize PDF with custom page size
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210 // A4 width
      const pageHeight = 297 // A4 height
      const margin = 20
      const qrWidth = 150 // 150mm = ~400px at 72dpi
      const qrHeight = 150
      const labelHeight = 20
      const spacing = 20

      let currentY = margin

      for (let i = 0; i < qrCodes.length; i++) {
        // Add new page if needed
        if (currentY + qrHeight + labelHeight > pageHeight - margin) {
          doc.addPage()
          currentY = margin
        }

        // Add QR code
        await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            try {
              const xPos = (pageWidth - qrWidth) / 2
              doc.addImage(img, 'PNG', xPos, currentY, qrWidth, qrHeight)

              // Add label text
              const label = `Batch #${batchNumber} - ${skus?.[i] || ''}`
              doc.setFontSize(12)
              doc.text(label, pageWidth / 2, currentY + qrHeight + 10, { 
                align: 'center' 
              })

              currentY += qrHeight + labelHeight + spacing
              resolve(null)
            } catch (error) {
              reject(error)
            }
          }
          img.onerror = reject
          img.src = qrCodes[i]
        })
      }

      if (forPrint) {
        // Open PDF in new window for printing
        const pdfData = doc.output('datauristring')
        const printWindow = window.open()
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <body style="margin:0;">
                <embed width="100%" height="100%" src="${pdfData}" type="application/pdf">
              </body>
            </html>
          `)
        }
        setDownloadStatus('printed')
      } else {
        // Download PDF
        doc.save(`${fileName}.pdf`)
        setDownloadStatus('downloaded')
      }

      toast({
        title: "Success",
        description: forPrint ? "PDF opened for printing" : "PDF downloaded successfully"
      })
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (action: 'download' | 'print' = 'download') => {
    if (qrCodes?.length) {
      await generatePDF(action === 'print')
    } else if (qrCode) {
      await downloadSingleQR()
    }
  }

  if (!qrCode && (!qrCodes || qrCodes.length === 0)) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={() => handleClick('download')}
        disabled={loading}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {showIcon && (
              qrCodes?.length ? (
                <Download className="h-4 w-4 mr-2" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )
            )}
            {label || (qrCodes?.length ? 'Download All' : 'Download QR')}
          </>
        )}
      </Button>

      {allowPrint && qrCodes?.length > 0 && (
        <Button
          variant={variant}
          size={size}
          onClick={() => handleClick('print')}
          disabled={loading}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      )}

      {downloadStatus !== 'none' && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1",
          downloadStatus === 'printed' ? 
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        )}>
          <CheckCircle className="h-3 w-3" />
          {downloadStatus === 'printed' ? 'Printed' : 'Downloaded'}
        </div>
      )}
    </div>
  )
}