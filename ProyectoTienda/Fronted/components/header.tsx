"use client"

import Link from "next/link"
import { ShoppingCart, User, Store, Menu, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { LogOut } from "lucide-react"

export function Header() {
  const { getItemCount } = useCart()
  const { user, logout } = useAuth()
  const itemCount = getItemCount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Mi Tienda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Inicio
            </Link>
            <Link
              href={user?.rol === 'cliente' ? "/cliente/tienda" : "/productos"}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tienda
            </Link>
            {user && (
              <Link
                href="/mis-compras"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Mis Compras
              </Link>
            )}
            {user?.rol === 'admin' && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Administrar
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Ver carrito</span>
              </Button>
            </Link>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/perfil">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-24 truncate">
                      {user.nombre}
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} title="Cerrar Sesión">
                  <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="hidden gap-2 md:flex">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href={user?.rol === 'cliente' ? "/cliente/tienda" : "/productos"}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tienda
              </Link>
              {user && (
                <>
                  <Link
                    href="/perfil"
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  {user.rol === "cliente" && (
                    <Link
                      href="/mis-compras"
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Mis Compras
                    </Link>
                  )}
                  {user.rol === 'admin' && (
                    <Link
                      href="/admin"
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Administrar
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="justify-start gap-2 text-muted-foreground"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </>
              )}
              {!user && (
                <div className="flex flex-col gap-2 px-3 pt-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Ingresar
                    </Button>
                  </Link>
                  <Link href="/auth/registro" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Registrarse</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
