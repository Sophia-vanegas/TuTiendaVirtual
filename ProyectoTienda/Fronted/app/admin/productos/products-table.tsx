"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit2, Trash2, Package, Loader2 } from "lucide-react"
import type { Producto } from "@/lib/types"

interface ProductsTableProps {
  productos: Producto[]
}

export function ProductsTable({ productos }: ProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({ nombre: "", tipo_producto: "", cantidad: 0, precio: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const openEditDialog = (producto: Producto) => {
    setEditingProduct(producto)
    setFormData({
      nombre: producto.nombre,
      tipo_producto: producto.tipo_producto,
      cantidad: producto.cantidad,
      precio: producto.precio,
    })
  }

  const handleEdit = async () => {
    if (!editingProduct) return
    setIsLoading(true)

    try {
      await apiClient.updateProducto(editingProduct.id, {
        ...editingProduct,
        nombre: formData.nombre,
        tipo_producto: formData.tipo_producto,
        cantidad: formData.cantidad,
        precio: formData.precio,
        updated_at: new Date().toISOString(),
      })
      setEditingProduct(null)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    setIsLoading(true)

    try {
      await apiClient.deleteProducto(deletingProduct.id)
      setDeletingProduct(null)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (productos.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No hay productos registrados</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell className="font-medium">{producto.nombre}</TableCell>
              <TableCell className="capitalize">{producto.tipo_producto}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    producto.cantidad < 10
                      ? "font-medium text-destructive"
                      : ""
                  }
                >
                  {producto.cantidad}
                </span>
              </TableCell>
              <TableCell className="text-right">{formatPrice(producto.precio)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(producto)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingProduct(producto)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica los datos del producto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo de Producto</Label>
              <Input
                id="edit-tipo"
                value={formData.tipo_producto}
                onChange={(e) => setFormData({ ...formData, tipo_producto: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cantidad">Cantidad</Label>
                <Input
                  id="edit-cantidad"
                  type="number"
                  min="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-precio">Precio (COP)</Label>
                <Input
                  id="edit-precio"
                  type="number"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de eliminar {deletingProduct?.nombre}? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
