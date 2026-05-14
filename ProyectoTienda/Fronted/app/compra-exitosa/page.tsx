import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"

interface CompraExitosaPageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function CompraExitosaPage({ searchParams }: CompraExitosaPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let compra = null
  let detalles = null

  if (params.id) {
    const { data: compraData } = await supabase
      .from("compras")
      .select("*")
      .eq("id", params.id)
      .single()
    compra = compraData

    if (compra) {
      const { data: detallesData } = await supabase
        .from("detalle_compras")
        .select("*")
        .eq("compra_id", compra.id)
      detalles = detallesData
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
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Compra Exitosa</CardTitle>
            <CardDescription>Tu pedido ha sido procesado correctamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {compra && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Numero de orden</p>
                <p className="font-mono text-lg font-semibold">{compra.id.slice(0, 8).toUpperCase()}</p>
              </div>
            )}

            {detalles && detalles.length > 0 && (
              <div className="space-y-3 text-left">
                <h3 className="font-semibold">Productos comprados:</h3>
                <div className="space-y-2">
                  {detalles.map((detalle) => (
                    <div key={detalle.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{detalle.producto_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">{formatPrice(detalle.subtotal)}</p>
                    </div>
                  ))}
                </div>
                {compra && (
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(compra.total)}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Hemos enviado un correo de confirmacion con los detalles de tu pedido.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/mis-compras" className="w-full">
              <Button className="w-full gap-2">
                Ver Mis Compras
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/productos" className="w-full">
              <Button variant="outline" className="w-full">
                Seguir Comprando
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
