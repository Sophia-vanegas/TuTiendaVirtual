"use client"

import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import type { Producto } from "@/lib/types"
import { useState } from "react"

interface ProductCardProps {
  producto: Producto
}

const tipoEmojis: Record<string, string> = {
  frutas: "🍎",
  verduras: "🥬",
  lacteos: "🥛",
  carnes: "🥩",
  bebidas: "🥤",
  panaderia: "🍞",
  limpieza: "🧹",
  otros: "📦",
}

function getEmoji(tipo: string): string {
  const tipoLower = tipo.toLowerCase()
  return tipoEmojis[tipoLower] || "📦"
}

export function ProductCard({ producto }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)

  const cartItem = items.find((item) => item.producto.id === producto.id)
  const inCart = cartItem?.cantidad || 0
  const availableStock = producto.cantidad - inCart

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= availableStock) {
      addItem(producto, quantity)
      setQuantity(1)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-muted text-4xl">
          {getEmoji(producto.tipo_producto)}
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="line-clamp-2 font-semibold text-foreground">{producto.nombre}</h3>
          <span className="mt-1 text-xs text-muted-foreground capitalize">
            {producto.tipo_producto}
          </span>
          <div className="mt-auto pt-2">
            <p className="text-lg font-bold text-primary">
              {formatPrice(producto.precio)}
            </p>
            <p className="text-xs text-muted-foreground">
              {availableStock > 0
                ? `${availableStock} disponible${availableStock > 1 ? "s" : ""}`
                : "Agotado"}
              {inCart > 0 && ` (${inCart} en carrito)`}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t bg-muted/30 p-3">
        {availableStock > 0 ? (
          <>
            <div className="flex w-full items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Disminuir cantidad</span>
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Aumentar cantidad</span>
              </Button>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full gap-2"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar
            </Button>
          </>
        ) : (
          <Button disabled className="w-full" size="sm">
            Agotado
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
