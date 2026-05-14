import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsTable } from "./products-table"
import { AddProductDialog } from "./add-product-dialog"

export default async function AdminProductosPage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .order("nombre", { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="mt-2 text-muted-foreground">
            Administra el inventario de tu tienda
          </p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
          <CardDescription>
            {productos?.length || 0} productos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable productos={productos || []} />
        </CardContent>
      </Card>
    </div>
  )
}
