"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, ShoppingBag, Loader2, Package, CheckCircle2, AlertCircle } from "lucide-react"
import type { Producto } from "@/lib/types"

export default function TiendaClientePage() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBuying, setIsBuying] = useState(false)
    const [cantidades, setCantidades] = useState<{ [id: string]: number }>({})
    const { user } = useAuth()
    const { items, addItem, removeItem, clearCart, getTotal, getItemCount } = useCart()

    useEffect(() => {
        cargarProductos()
    }, [])

    const cargarProductos = async () => {
        setIsLoading(true)
        try {
            const data = await apiClient.getClienteProductos()
            setProductos(data)
            const initialCantidades: { [id: string]: number } = {}
            data.forEach((p: Producto) => {
                initialCantidades[p.id] = p.cantidad > 0 ? 1 : 0
            })
            setCantidades(initialCantidades)
        } catch (error) {
            console.error("Error al cargar productos:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCantidadChange = (id: string, value: string, max: number) => {
        const val = parseInt(value) || 0
        if (val < 0) return
        if (val > max) return
        setCantidades(prev => ({ ...prev, [id]: val }))
    }

    const handleAddToCart = (producto: Producto) => {
        const cantidad = cantidades[producto.id]
        if (cantidad <= 0) return
        addItem(producto, cantidad)
    }

    const handleConfirmarCompra = async () => {
        if (!user) return
        if (items.length === 0) return

        setIsBuying(true)
        try {
            const cartItems = items.map(item => ({
                id_producto: item.producto.id,
                cantidad: item.cantidad
            }))

            const res = await apiClient.comprar(user.id, cartItems)

            if (res.success) {
                alert("¡Compra realizada con éxito! Revisa tu correo.")
                clearCart()
                cargarProductos()
            }
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setIsBuying(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tienda de Barrio</h1>
                        <p className="mt-2 text-muted-foreground">Productos frescos y de calidad directo a tu mesa</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Listado de Productos */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {productos.map((producto) => (
                                <Card key={producto.id} className={producto.cantidad === 0 ? "opacity-75" : ""}>
                                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                        {producto.imagen_url ? (
                                            <img
                                                src={producto.imagen_url}
                                                alt={producto.nombre}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-12 w-12 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                                            <span className="text-sm font-medium text-muted-foreground">{producto.tipo_producto}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-primary">{formatPrice(producto.precio)}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${producto.cantidad > 10 ? "bg-green-100 text-green-700" :
                                                    producto.cantidad > 0 ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                                }`}>
                                                {producto.cantidad > 0 ? `Stock: ${producto.cantidad}` : "Agotado"}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        {producto.cantidad > 0 ? (
                                            <div className="flex w-full items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-muted-foreground">Cant:</span>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={producto.cantidad}
                                                        value={cantidades[producto.id]}
                                                        onChange={(e) => handleCantidadChange(producto.id, e.target.value, producto.cantidad)}
                                                        className="h-9 w-16 px-2"
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full gap-2"
                                                    size="sm"
                                                    onClick={() => handleAddToCart(producto)}
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    Agregar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" className="w-full" disabled>
                                                Agotado
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Carrito de Compras */}
                    <div className="lg:sticky lg:top-24">
                        <Card className="border-primary/20 bg-primary/5 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                    <CardTitle>Mi Carrito</CardTitle>
                                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                        {getItemCount()} items
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {items.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">Agrega productos para comprar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.producto.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{item.producto.nombre}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeItem(item.producto.id)}>
                                                        ×
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span>{item.cantidad} x {formatPrice(item.producto.precio)}</span>
                                                    <span className="font-semibold text-foreground">{formatPrice(item.producto.precio * item.cantidad)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-primary">{formatPrice(getTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full gap-2 py-6 text-lg"
                                    disabled={items.length === 0 || isBuying}
                                    onClick={handleConfirmarCompra}
                                >
                                    {isBuying ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                    Confirmar Compra
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                                <p className="text-xs text-yellow-800">
                                    Al confirmar la compra, se descontará el stock y recibirás un correo con el resumen de tu orden.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
