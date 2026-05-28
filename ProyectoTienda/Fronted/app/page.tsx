import { apiClient } from "@/lib/api-client"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Truck, Shield, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const user = null // Temporalmente sin usuario

  const productos = await apiClient.getProductos()


  return (
    <div className="min-h-screen bg-background">
      <Header />

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
              <Link href="/cliente/tienda">
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

      {/* Store Information Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

            {/* Historia y Misión */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                Nuestra Tradición
              </div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Mas que una tienda, somos tu familia</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nacimos hace más de 15 años como un pequeño sueño familiar en el corazón del barrio. Nuestra misión siempre ha sido proveer alimentos frescos y productos de calidad con el calor humano que nos caracteriza. Hoy, evolucionamos digitalmente para seguir a tu lado, sin perder la esencia de la tienda de la esquina.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-primary">15+</p>
                  <p className="text-sm text-muted-foreground">Años de experiencia</p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-primary">5000+</p>
                  <p className="text-sm text-muted-foreground">Clientes felices</p>
                </div>
              </div>
            </div>

            {/* Contacto y Ubicación */}
            <div className="grid gap-6">
              {/* Ubicación */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <a
                  href="https://maps.app.goo.gl/dWiJ2queKUSkHF2E8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group/map cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover/map:bg-primary group-hover/map:text-white transition-colors duration-300">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Nuestra Ubicación</h3>
                      <p className="mt-1 text-muted-foreground">Calle Principal #12 - 45, Barrio Central</p>
                      <p className="text-sm text-primary font-medium mt-2 hover:underline">Ver en Google Maps →</p>
                    </div>
                  </div>
                  {/* Simulación de mapa interactivo */}
                  <div className="mt-4 h-32 w-full rounded-xl bg-muted overflow-hidden relative grayscale group-hover/map:grayscale-0 transition-all duration-500">
                    <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800" className="w-full h-full object-cover opacity-50 group-hover/map:opacity-100 transition-opacity" alt="Mapa" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">ENCUÉNTRANOS AQUÍ</span>
                    </div>
                  </div>
                </a>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="group rounded-2xl border border-border bg-background p-6 hover:border-primary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold">Llámanos</h4>
                  <p className="text-sm text-muted-foreground mt-1">+57 (310) 123 4567</p>
                </div>
                <div className="group rounded-2xl border border-border bg-background p-6 hover:border-primary/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold">Escríbenos</h4>
                  <p className="text-sm text-muted-foreground mt-1">hola@tienda.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-primary/5 py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-foreground md:text-4xl">
              ¿Listo para tu pedido?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Regístrate hoy y recibe tus productos favoritos en la comodidad de tu hogar.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/auth/registro">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                  Registrarse Ahora
                </Button>
              </Link>
            </div>
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
