"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, Calendar, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"

export default function MisComprasPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [compras, setCompras] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/mis-compras")
      } else {
        cargarCompras()
      }
    }
  }, [user, isAuthLoading, router])

  const cargarCompras = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await apiClient.getMisCompras(user.id)
      setCompras(data)
    } catch (error) {
      console.error("Error al cargar compras:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mis Compras</h1>
          <p className="mt-2 text-muted-foreground">Historial de todas tus compras</p>
        </div>

        {compras.length > 0 ? (
          <div className="space-y-4">
            {compras.map((compra) => (
              <Card key={compra.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Orden #{compra.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(compra.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatPrice(compra.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {compra.productos?.length || 0} producto(s)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {compra.productos?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{item.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.cantidad} x {formatPrice(item.precio)}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">{formatPrice(item.precio * item.cantidad)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center">
            <CardContent>
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No tienes compras todavia
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explora nuestros productos y realiza tu primera compra
              </p>
              <Link href="/cliente/tienda">
                <Button className="mt-6 gap-2">
                  Ir a la Tienda
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
