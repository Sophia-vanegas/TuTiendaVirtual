"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Cliente } from "@/lib/types"

interface ClientsTableProps {
  clientes: Cliente[]
}

export function ClientsTable({ clientes }: ClientsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return
    setDeletingId(id)
    try {
      await apiClient.deleteCliente(id)
      router.refresh()
    } catch (err) {
      alert("Error al eliminar cliente")
    } finally {
      setDeletingId(null)
    }
  }

  if (clientes.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No hay clientes registrados</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cedula</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Celular</TableHead>
          <TableHead>Direccion</TableHead>
          <TableHead>Registro</TableHead>
          <TableHead className="w-12">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-mono">{cliente.cedula}</TableCell>
            <TableCell className="font-medium">
              {cliente.nombre} {cliente.apellidos}
            </TableCell>
            <TableCell>{cliente.email}</TableCell>
            <TableCell>{cliente.celular}</TableCell>
            <TableCell className="max-w-48 truncate">{cliente.direccion}</TableCell>
            <TableCell>{formatDate(cliente.created_at || "")}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => cliente.id && handleDelete(cliente.id)}
                disabled={deletingId === cliente.id}
              >
                {deletingId === cliente.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
