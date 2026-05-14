"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Cliente } from "@/lib/types"

interface CartContentProps {
  user: { id: string; email: string } | null
  cliente: Cliente | null
}

export function CartContent({ user, cliente }: CartContentProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/carrito")
      return
    }

    if (!cliente) {
      router.push("/perfil?completar=true")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: cliente.id,
          items: items.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la compra")
      }

      clearCart()
      router.push(`/compra-exitosa?id=${data.compra.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la compra")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Tu carrito esta vacio</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega productos para comenzar tu compra
        </p>
        <Link href="/productos">
          <Button className="mt-6 gap-2">
            Ver Productos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Tu Carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.producto.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl">
                    {getEmoji(item.producto.tipo_producto)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.producto.nombre}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.producto.precio)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Disminuir</span>
                    </Button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.producto.cantidad}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Aumentar</span>
                    </Button>
                  </div>
                  <p className="w-24 text-right font-semibold text-foreground">
                    {formatPrice(item.producto.precio * item.cantidad)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.producto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envio</span>
                <span className="text-primary">Gratis</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-primary">{formatPrice(getTotal())}</span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {!user ? (
                <>
                  <Link href="/auth/login?redirect=/carrito" className="w-full">
                    <Button className="w-full">Iniciar Sesion para Comprar</Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground">
                    Necesitas una cuenta para realizar tu compra
                  </p>
                </>
              ) : !cliente ? (
                <>
                  <Link href="/perfil?completar=true" className="w-full">
                    <Button className="w-full">Completar Perfil</Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground">
                    Completa tus datos para continuar
                  </p>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Procesando..." : "Confirmar Compra"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
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
  return tipoEmojis[tipo.toLowerCase()] || "📦"
}
