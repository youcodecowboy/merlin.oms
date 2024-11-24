import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { findInventoryItemById } from '@/lib/mock/store'
import { InventoryItemProfile } from '@/pages/InventoryItemProfile'
import type { InventoryItem } from '@/lib/schema'

interface ScanResult {
  timestamp: string
  code: string
  type: 'INVENTORY' | 'BIN' | 'UNKNOWN'
  item?: InventoryItem
}

export function Scanner() {
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<ScanResult[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerDivRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize scanner when component mounts
    if (scannerDivRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "scanner",
        { 
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          aspectRatio: 1
        },
        false // Don't start scanning automatically
      )
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (error) {
          console.error('Error cleaning up scanner:', error)
        }
      }
    }
  }, [])

  const startScanning = () => {
    if (!scannerRef.current) return

    setScanning(true)
    try {
      scannerRef.current.render(onScanSuccess, onScanError)
    } catch (error) {
      console.error('Failed to start scanner:', error)
      toast({
        title: "Error",
        description: "Failed to start scanner. Please try again.",
        variant: "destructive"
      })
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (!scannerRef.current) return

    try {
      await scannerRef.current.clear()
      setScanning(false)
    } catch (error) {
      console.error('Failed to stop scanner:', error)
      toast({
        title: "Error",
        description: "Failed to stop scanner. Please refresh the page.",
        variant: "destructive"
      })
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately after successful scan
    await stopScanning()

    try {
      // Find inventory item
      const item = findInventoryItemById(decodedText)
      
      // Determine QR code type and create result
      const newResult: ScanResult = {
        timestamp: new Date().toISOString(),
        code: decodedText,
        type: item ? 'INVENTORY' : 'UNKNOWN',
        item
      }

      // Add to results
      setResults(prev => [newResult, ...prev])

      // Show toast and open dashboard if item found
      if (item) {
        toast({
          title: "Item Found",
          description: `Found inventory item: ${item.sku}`,
        })
        setSelectedItemId(item.id!)
      } else {
        toast({
          title: "Item Not Found",
          description: "No inventory item found with this ID",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error processing scan result:', error)
      toast({
        title: "Error",
        description: "Failed to process scan result",
        variant: "destructive"
      })
    }
  }

  const onScanError = (error: string | Error) => {
    // Only log actual errors, not just failed scans
    if (error !== 'No QR code found' && error.toString() !== 'No QR code found') {
      console.error('QR Scan Error:', error)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const handleResultClick = (result: ScanResult) => {
    if (result.item) {
      setSelectedItemId(result.item.id!)
    }
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  id="scanner" 
                  ref={scannerDivRef}
                  className="rounded-lg overflow-hidden"
                />
                
                <div className="flex justify-center gap-4">
                  {!scanning ? (
                    <Button onClick={startScanning}>
                      Start Scanning
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopScanning}>
                      Stop Scanning
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Scan Results</CardTitle>
              {results.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearResults}
                >
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No scans yet
                  </div>
                ) : (
                  results.map((result, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 bg-muted/50 rounded-lg",
                        result.item && "cursor-pointer hover:bg-muted"
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={cn(
                              result.type === 'INVENTORY' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                              result.type === 'BIN' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                              result.type === 'UNKNOWN' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            )}
                          >
                            {result.type}
                          </Badge>
                          <span className="font-mono text-sm">{result.code}</span>
                        </div>
                        {result.item && (
                          <div className="text-sm text-muted-foreground">
                            SKU: {result.item.sku}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedItemId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="container h-full py-4 overflow-auto">
            <InventoryItemProfile itemId={selectedItemId} />
            <Button
              variant="outline"
              className="fixed top-4 right-4"
              onClick={() => setSelectedItemId(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}