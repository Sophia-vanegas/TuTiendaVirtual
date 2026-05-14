"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo_producto: "",
    cantidad: 0,
    precio: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    await supabase.from("productos").insert({
      nombre: formData.nombre,
      tipo_producto: formData.tipo_producto.toLowerCase(),
      cantidad: formData.cantidad,
      precio: formData.precio,
    })

    setFormData({ nombre: "", tipo_producto: "", cantidad: 0, precio: 0 })
    setOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>Agrega un nuevo producto al inventario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Producto</Label>
              <Input
                id="nombre"
                placeholder="Ej: Manzana Roja"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Producto</Label>
              <Input
                id="tipo"
                placeholder="Ej: frutas, verduras, lacteos"
                value={formData.tipo_producto}
                onChange={(e) => setFormData({ ...formData, tipo_producto: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad en Stock</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (COP)</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Agregar Producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
