"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShoppingCart, Eye, Package } from "lucide-react"

interface CompraSimple {
  id: string
  cliente_id: string
  cliente_nombre: string
  total: number
  created_at: string
  productos: {
    id: string
    nombre: string
    cantidad: number
    precio: number
  }[]
}

interface PurchasesTableProps {
  compras: CompraSimple[]
}

export function PurchasesTable({ compras }: PurchasesTableProps) {
  const [selectedCompra, setSelectedCompra] = useState<CompraSimple | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (compras.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No hay compras registradas</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-16">Ver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compras.map((compra) => (
            <TableRow key={compra.id}>
              <TableCell className="font-mono">
                #{compra.id.slice(0, 8).toUpperCase()}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {compra.cliente_nombre}
                </div>
              </TableCell>
              <TableCell>{formatDate(compra.created_at)}</TableCell>
              <TableCell className="text-right">
                {compra.productos?.length || 0}
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {formatPrice(compra.total)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCompra(compra)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalles</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedCompra} onOpenChange={() => setSelectedCompra(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Orden #{selectedCompra?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              {selectedCompra && formatDate(selectedCompra.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedCompra && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-lg">
                  {selectedCompra.cliente_nombre}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Productos</p>
                {selectedCompra.productos?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.cantidad} x {formatPrice(item.precio)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.precio * item.cantidad)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(selectedCompra.total)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

