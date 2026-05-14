"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ClientsTableProps {
  clientes: Cliente[]
}

export function ClientsTable({ clientes }: ClientsTableProps) {
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
            <TableCell>{formatDate(cliente.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
