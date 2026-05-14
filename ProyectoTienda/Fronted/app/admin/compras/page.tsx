import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchasesTable } from "./purchases-table"

export default async function AdminComprasPage() {
  const supabase = await createClient()

  const { data: compras } = await supabase
    .from("compras")
    .select(`
      *,
      clientes (nombre, apellidos, email),
      detalle_compras (*)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Compras</h1>
        <p className="mt-2 text-muted-foreground">
          Historial de todas las compras realizadas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Compras</CardTitle>
          <CardDescription>
            {compras?.length || 0} compras registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PurchasesTable compras={compras || []} />
        </CardContent>
      </Card>
    </div>
  )
}
