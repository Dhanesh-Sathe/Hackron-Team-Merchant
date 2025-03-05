"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown } from "lucide-react"

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    category: "Electronics",
    quantity: 25,
    location: "Warehouse A",
    status: "In Stock",
  },
  { id: 2, name: "Office Chair", category: "Furniture", quantity: 12, location: "Warehouse B", status: "In Stock" },
  { id: 3, name: "Wireless Mouse", category: "Electronics", quantity: 5, location: "Warehouse A", status: "Low Stock" },
  { id: 4, name: "Desk Lamp", category: "Office", quantity: 18, location: "Warehouse C", status: "In Stock" },
  { id: 5, name: "Keyboard", category: "Electronics", quantity: 3, location: "Warehouse A", status: "Low Stock" },
  { id: 6, name: "Whiteboard", category: "Office", quantity: 7, location: "Warehouse B", status: "In Stock" },
  { id: 7, name: "Monitor", category: "Electronics", quantity: 0, location: "Warehouse A", status: "Out of Stock" },
  { id: 8, name: "Filing Cabinet", category: "Furniture", quantity: 9, location: "Warehouse C", status: "In Stock" },
]

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredData = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="min-w-[150px]">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("name")}>
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("category")}>
                  Category
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div
                  className="flex items-center justify-end gap-1 cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("location")}>
                  Location
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "In Stock"
                          ? "outline"
                          : item.status === "Low Stock"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

