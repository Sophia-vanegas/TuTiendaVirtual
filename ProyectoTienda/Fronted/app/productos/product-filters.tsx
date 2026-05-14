"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState, useCallback } from "react"

interface ProductFiltersProps {
  tipos: string[]
  currentTipo?: string
  currentBuscar?: string
}

export function ProductFilters({ tipos, currentTipo, currentBuscar }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentBuscar || "")

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/productos?${createQueryString("buscar", searchValue)}`)
  }

  const handleTipoChange = (tipo: string) => {
    router.push(`/productos?${createQueryString("tipo", tipo === currentTipo ? "" : tipo)}`)
  }

  const clearFilters = () => {
    setSearchValue("")
    router.push("/productos")
  }

  const hasFilters = currentTipo || currentBuscar

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Categorias:</span>
        {tipos.map((tipo) => (
          <Button
            key={tipo}
            variant={currentTipo === tipo ? "default" : "outline"}
            size="sm"
            onClick={() => handleTipoChange(tipo)}
            className="capitalize"
          >
            {tipo}
          </Button>
        ))}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
