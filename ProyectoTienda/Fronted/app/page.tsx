import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Truck, Shield } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .gt("cantidad", 0)
    .order("created_at", { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Tu tienda de barrio
              <span className="block text-primary">de confianza</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Productos frescos y de calidad, al alcance de tu mano. Compra desde
              la comodidad de tu hogar y recibe en tu puerta.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/productos">
                <Button size="lg" className="gap-2">
                  Ver Productos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/registro">
                  <Button variant="outline" size="lg">
                    Crear Cuenta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Productos Frescos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Seleccionamos los mejores productos para tu hogar
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Entrega Rapida</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Recibe tus compras en la puerta de tu casa
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Compra Segura</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu informacion siempre protegida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Productos Destacados</h2>
              <p className="mt-1 text-muted-foreground">
                Lo mejor de nuestra tienda para ti
              </p>
            </div>
            <Link href="/productos">
              <Button variant="ghost" className="gap-2">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {productos && productos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No hay productos disponibles
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pronto agregaremos nuevos productos a nuestra tienda
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-primary py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              Unete a nuestra comunidad
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              Registrate hoy y disfruta de todos los beneficios de comprar en tu
              tienda de barrio favorita.
            </p>
            <Link href="/auth/registro">
              <Button
                size="lg"
                variant="secondary"
                className="mt-8"
              >
                Registrarse Ahora
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            2024 Mi Tienda de Barrio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
