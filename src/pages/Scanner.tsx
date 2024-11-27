import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QrCode, Box, MapPin } from 'lucide-react'
import { batchUpdateByBin } from '@/lib/services/batch-updates'
import { toast } from '@/components/ui/use-toast'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, AlertCircle, CheckCircle } from "lucide-react"

type ScanMode = 'ITEM_SEARCH' | 'BIN_UPDATE' | 'ITEM_UPDATE'

interface ScanConfig {
  mode: ScanMode
  updateType?: 'LOCATION' | 'STATUS1' | 'STATUS2'
  value?: string
}

interface ScanResult {
  id: string
  timestamp: string
  value: string
  mode: ScanMode
  success: boolean
  result?: string
  error?: string
}

export function Scanner() {
  const [config, setConfig] = useState<ScanConfig>({
    mode: 'ITEM_SEARCH'
  })
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])

  const handleScan = async (scannedValue: string) => {
    try {
      let result: string | undefined
      let success = true
      let error: string | undefined

      switch (config.mode) {
        case 'ITEM_SEARCH':
          // Navigate to item details
          // navigate(`/inv/${scannedValue}`)
          result = 'Item found'
          break

        case 'BIN_UPDATE':
          if (!config.updateType || !config.value) {
            error = "Missing update configuration"
            success = false
            break
          }

          const updateResult = await batchUpdateByBin(
            scannedValue,
            {
              [config.updateType.toLowerCase()]: config.value
            },
            'system'
          )

          result = `Updated ${updateResult.totalUpdated} items`
          if (updateResult.errors.length > 0) {
            error = `${updateResult.errors.length} items failed`
            success = false
          }
          break

        case 'ITEM_UPDATE':
          // Handle individual item updates
          break
      }

      // Add to scan history
      setScanHistory(prev => [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        value: scannedValue,
        mode: config.mode,
        success,
        result,
        error
      }, ...prev.slice(0, 49)]) // Keep last 50 scans

      setLastScan(scannedValue)

      if (!success) {
        throw new Error(error)
      }

      toast({
        title: "Scan Successful",
        description: result
      })

    } catch (error) {
      console.error('Scan error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process scan",
        variant: "destructive"
      })
    }
  }

  // Simulate a scan for development
  const simulateScan = () => {
    const mockValues = {
      'ITEM_SEARCH': 'ITEM-12345',
      'BIN_UPDATE': 'BIN-1-Z1-0001',
      'ITEM_UPDATE': 'ITEM-67890'
    }
    handleScan(mockValues[config.mode])
  }

  return (
    <PageLayout title="Scanner">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scanner Configuration - Left Column */}
          <Card>
            <CardHeader>
              <CardTitle>Scanner Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scan Mode Selection */}
              <div className="space-y-2">
                <Label>Scan Mode</Label>
                <Select
                  value={config.mode}
                  onValueChange={(value: ScanMode) => setConfig({ mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scan mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITEM_SEARCH">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        <span>Item Search</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="BIN_UPDATE">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Bin Update</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Update Configuration */}
              {config.mode === 'BIN_UPDATE' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Update Type</Label>
                    <Select
                      value={config.updateType}
                      onValueChange={(value: 'LOCATION' | 'STATUS1' | 'STATUS2') => 
                        setConfig(prev => ({ ...prev, updateType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select what to update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOCATION">Location</SelectItem>
                        <SelectItem value="STATUS1">Status 1</SelectItem>
                        <SelectItem value="STATUS2">Status 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Update Value</Label>
                    {config.updateType === 'LOCATION' ? (
                      <Select
                        value={config.value}
                        onValueChange={(value) => 
                          setConfig(prev => ({ ...prev, value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAUNDRY">Laundry</SelectItem>
                          <SelectItem value="QC-ZONE">QC Zone</SelectItem>
                          <SelectItem value="FINISHING">Finishing</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        placeholder="Enter value"
                        value={config.value}
                        onChange={(e) => 
                          setConfig(prev => ({ ...prev, value: e.target.value }))
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Scan Button */}
              <div className="pt-4">
                <Button 
                  onClick={simulateScan}
                  className="w-full"
                  size="lg"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {scanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>

              {/* Last Scan Result */}
              {lastScan && (
                <div className="pt-4 text-center text-sm text-muted-foreground">
                  Last scan: {lastScan}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan History - Right Column */}
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {scanHistory.map((scan) => (
                    <Card key={scan.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {scan.success ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">{scan.value}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Mode: {scan.mode.replace('_', ' ')}
                          </div>
                          {scan.result && (
                            <div className="text-sm text-success">
                              {scan.result}
                            </div>
                          )}
                          {scan.error && (
                            <div className="text-sm text-destructive">
                              {scan.error}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(scan.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {scanHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No scans yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}