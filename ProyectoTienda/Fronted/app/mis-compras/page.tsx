import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function MisComprasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/mis-compras")
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .single()

  let compras: any[] = []

  if (cliente) {
    const { data: comprasData } = await supabase
      .from("compras")
      .select(`
        *,
        detalle_compras (*)
      `)
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false })

    compras = comprasData || []
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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
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
                        {compra.detalle_compras?.length || 0} producto(s)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {compra.detalle_compras?.map((detalle: any) => (
                      <div
                        key={detalle.id}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{detalle.producto_nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">{formatPrice(detalle.subtotal)}</p>
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
              <Link href="/productos">
                <Button className="mt-6 gap-2">
                  Ver Productos
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
