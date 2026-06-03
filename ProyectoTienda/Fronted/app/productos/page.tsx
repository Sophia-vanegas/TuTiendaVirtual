import { apiClient } from "@/lib/api-client"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Package, Search } from "lucide-react"
import { ProductFilters } from "./product-filters"

interface ProductosPageProps {
  searchParams: Promise<{ tipo?: string; buscar?: string }>
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams

  // Temporalmente sin usuario hasta implementar auth en FastAPI
  const user = null

  const productos = await apiClient.getProductos(params.tipo, params.buscar)
  const tipos = await apiClient.getTipos()


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Nuestros Productos</h1>
          <p className="mt-2 text-muted-foreground">
            Encuentra todo lo que necesitas para tu hogar
          </p>
        </div>

        <ProductFilters tipos={tipos} currentTipo={params.tipo} currentBuscar={params.buscar} />

        {productos && productos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No se encontraron productos
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta con otros filtros de busqueda
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
