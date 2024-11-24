import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeDownloadProps {
  qrCode: string
}

export function QRCodeDownload({ qrCode }: QRCodeDownloadProps) {
  const handleDownload = () => {
    const svgElement = document.getElementById(`qr-${qrCode}`)
    if (!svgElement) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${qrCode}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  }

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
      <div className="bg-white p-2 rounded">
        <QRCodeSVG
          id={`qr-${qrCode}`}
          value={qrCode}
          size={128}
          level="H"
          includeMargin={true}
        />
      </div>
      <Button 
        variant="outline"
        size="sm"
        className="ml-4"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  )
} 