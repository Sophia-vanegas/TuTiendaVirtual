import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: productosCount } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })

  const { count: clientesCount } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true })

  const { count: comprasCount } = await supabase
    .from("compras")
    .select("*", { count: "exact", head: true })

  const { data: ventasData } = await supabase
    .from("compras")
    .select("total")

  const totalVentas = ventasData?.reduce((sum, compra) => sum + compra.total, 0) || 0

  const { data: recentCompras } = await supabase
    .from("compras")
    .select(`
      *,
      clientes (nombre, apellidos)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Resumen general de tu tienda
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosCount || 0}</div>
            <p className="text-xs text-muted-foreground">productos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesCount || 0}</div>
            <p className="text-xs text-muted-foreground">clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprasCount || 0}</div>
            <p className="text-xs text-muted-foreground">compras realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalVentas)}</div>
            <p className="text-xs text-muted-foreground">ingresos totales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras Recientes</CardTitle>
          <CardDescription>Las ultimas 5 compras realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCompras && recentCompras.length > 0 ? (
            <div className="space-y-4">
              {recentCompras.map((compra: any) => (
                <div
                  key={compra.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {compra.clientes?.nombre} {compra.clientes?.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(compra.created_at)}
                    </p>
                  </div>
                  <p className="font-bold text-primary">{formatPrice(compra.total)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay compras registradas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
