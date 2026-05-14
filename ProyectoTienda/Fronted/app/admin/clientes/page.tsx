import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientsTable } from "./clients-table"

export default async function AdminClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="mt-2 text-muted-foreground">
          Listado de clientes registrados
        </p>
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
