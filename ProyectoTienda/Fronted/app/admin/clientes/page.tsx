import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientsTable } from "./clients-table"
import { AddClientDialog } from "./add-client-dialog"

export default async function AdminClientesPage() {
  const clientes = await apiClient.getAdminClientes()

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="mt-2 text-muted-foreground">
            Listado de clientes registrados
          </p>
        </div>
        <AddClientDialog />
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            {clientes?.length || 0} clientes registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientsTable clientes={clientes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
