import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTable() {
  return (
    <div className="container mx-auto mt-8">
      <div className="bg-card p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Data Table</h1>
        <Table>
          <TableCaption>A list of your data.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>001</TableCell>
              <TableCell>Example Row</TableCell>
              <TableCell>Active</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>002</TableCell>
              <TableCell>Sample Data</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell className="text-right">$125.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}