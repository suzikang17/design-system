import type { Showcase } from "@/catalog/types"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const INVOICES = [
  ["INV-001", "Paid", "$250.00"],
  ["INV-002", "Pending", "$150.00"],
  ["INV-003", "Paid", "$350.00"],
]

export default {
  title: "Table",
  group: "Data",
  description: "The styled parts of an HTML table: header, body, rows, cells and caption.",
  examples: {
    Invoices: () => (
      <div className="w-full max-w-md rounded-lg border">
        <Table>
          <TableCaption className="pb-3">Invoices this month</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map(([id, status, amount]) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{id}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell className="text-right tabular-nums">{amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ),
  },
} satisfies Showcase
