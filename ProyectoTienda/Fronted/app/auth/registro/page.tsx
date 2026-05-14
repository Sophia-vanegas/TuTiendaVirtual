"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Mail, Lock, User, Phone, MapPin, CreditCard, Loader2 } from "lucide-react"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellidos: "",
    email: "",
    celular: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          nombre: formData.nombre,
          apellidos: formData.apellidos,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    if (authData.user) {
      const { error: clienteError } = await supabase.from("clientes").insert({
        user_id: authData.user.id,
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        celular: formData.celular,
        direccion: formData.direccion,
      })

      if (clienteError) {
        console.log("[v0] Error creating cliente:", clienteError)
      }
    }

    router.push("/auth/registro-exitoso")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Mi Tienda</span>
          </Link>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Registrate para comenzar a comprar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cedula</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cedula"
                    name="cedula"
                    type="text"
                    placeholder="12345678"
                    value={formData.cedula}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="celular"
                    name="celular"
                    type="tel"
                    placeholder="300 123 4567"
                    value={formData.celular}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  placeholder="Perez Garcia"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Direccion</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  placeholder="Calle 123 # 45-67"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contrasena"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Ingresa aqui
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
