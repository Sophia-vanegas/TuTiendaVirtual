"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, CreditCard, Loader2, LogOut } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ProfileFormProps {
  user: { id: string; email: string }
  cliente: Cliente | null
}

export function ProfileForm({ user, cliente }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    cedula: cliente?.cedula || "",
    nombre: cliente?.nombre || "",
    apellidos: cliente?.apellidos || "",
    celular: cliente?.celular || "",
    direccion: cliente?.direccion || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    const supabase = createClient()

    if (cliente) {
      const { error } = await supabase
        .from("clientes")
        .update({
          cedula: formData.cedula,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          celular: formData.celular,
          direccion: formData.direccion,
        })
        .eq("id", cliente.id)

      if (error) {
        setError("Error al actualizar el perfil")
        setIsLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from("clientes").insert({
        user_id: user.id,
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: user.email,
        celular: formData.celular,
        direccion: formData.direccion,
      })

      if (error) {
        setError("Error al crear el perfil")
        setIsLoading(false)
        return
      }
    }

    setSuccess(true)
    setIsLoading(false)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacion Personal</CardTitle>
          <CardDescription>
            {cliente ? "Actualiza tus datos personales" : "Completa tu perfil para poder comprar"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  className="pl-10"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El correo no se puede cambiar
              </p>
            </div>

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

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-primary">Perfil actualizado correctamente</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : cliente ? (
                "Guardar Cambios"
              ) : (
                "Completar Perfil"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesion</CardTitle>
          <CardDescription>Administra tu sesion actual</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
