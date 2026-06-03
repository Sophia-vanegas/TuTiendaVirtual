import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchasesTable } from "./purchases-table"

export default async function AdminComprasPage() {
  const compras = await apiClient.getAdminCompras()


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
