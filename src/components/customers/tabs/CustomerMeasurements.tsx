import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { format } from 'date-fns'

interface Measurement {
  id: string
  date: string
  waist: number
  inseam: number
  notes?: string
}

interface CustomerMeasurementsProps {
  customerId: string
}

export function CustomerMeasurements({ customerId }: CustomerMeasurementsProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchMeasurements = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMeasurements([
        {
          id: '1',
          date: '2024-01-15T10:00:00Z',
          waist: 32,
          inseam: 34,
          notes: 'Initial measurement'
        },
        {
          id: '2',
          date: '2024-01-01T10:00:00Z',
          waist: 33,
          inseam: 34,
          notes: 'Updated measurement'
        }
      ])
      setLoading(false)
    }
    fetchMeasurements()
  }, [customerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Latest Measurements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Latest Measurements</CardTitle>
          <Button variant="outline" size="sm">Add New</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Waist</label>
              <p className="mt-1 text-2xl font-semibold">{measurements[0]?.waist}"</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Inseam</label>
              <p className="mt-1 text-2xl font-semibold">{measurements[0]?.inseam}"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>Inseam</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell>
                    {format(new Date(measurement.date), 'PPp')}
                  </TableCell>
                  <TableCell>{measurement.waist}"</TableCell>
                  <TableCell>{measurement.inseam}"</TableCell>
                  <TableCell>{measurement.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}