"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Mail, Lock, User, Phone, MapPin, CreditCard, Loader2, CheckCircle2 } from "lucide-react"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellidos: "",
    email: "",
    celular: "",
    direccion: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const data = await apiClient.register(formData)
      setSuccessInfo(data.debug_password_info)
      // En un flujo real redirigiríamos después de unos segundos o a una página de éxito
      setTimeout(() => {
        router.push("/auth/login")
      }, 5000)
    } catch (err: any) {
      setError(err.message || "Error al registrarse")
      setIsLoading(false)
    }
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

            {successInfo && (
              <div className="rounded-lg bg-primary/10 p-4 text-center border border-primary/20">
                <CheckCircle2 className="mx-auto h-8 w-8 text-primary mb-2" />
                <h4 className="font-bold text-primary">¡Registro Exitoso!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu usuario es tu correo electrónico.
                </p>
                <p className="text-sm font-mono bg-background p-2 mt-2 rounded border">
                  {successInfo}
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Redirigiendo al login en 5 segundos...
                </p>
              </div>
            )}

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
