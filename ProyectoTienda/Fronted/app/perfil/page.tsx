"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Phone, MapPin, CreditCard, Loader2, Save, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function PerfilPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [formData, setFormData] = useState<any>({
    nombre: "",
    email: "",
    password: "",
    cedula: "",
    apellidos: "",
    celular: "",
    direccion: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/perfil")
      } else {
        cargarPerfil()
      }
    }
  }, [user, isAuthLoading, router])

  const cargarPerfil = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await apiClient.getProfile(user.id)
      setFormData({
        nombre: data.nombre || "",
        email: data.email || "",
        password: "", // No mostramos la contraseña actual por seguridad
        cedula: data.cedula || "",
        apellidos: data.apellidos || "",
        celular: data.celular || "",
        direccion: data.direccion || "",
      })
    } catch (error) {
      console.error("Error al cargar perfil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    setMsg(null)

    try {
      // Solo enviamos los campos que tienen valor si queremos ser eficientes, 
      // pero aquí enviamos el objeto completo (el backend maneja los opcionales)
      const updateData = { ...formData }
      if (!updateData.password) delete updateData.password // No actualizar si está vacío

      await apiClient.updateProfile(user.id, updateData)
      setMsg({ type: 'success', text: "¡Perfil actualizado correctamente!" })
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || "Error al actualizar perfil" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const isCliente = user?.rol === "cliente"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="mt-2 text-muted-foreground">Administra tu información personal y contraseña</p>
        </div>

        <form onSubmit={handleUpdate}>
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Datos de Cuenta</CardTitle>
                  <CardDescription>Rol: <span className="capitalize font-bold text-primary">{user?.rol}</span></CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              {msg && (
                <div className={`p-4 rounded-lg flex items-center gap-3 border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                  {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />}
                  <span className="text-sm font-medium">{msg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {isCliente && (
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña (Dejar vacío para no cambiar)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {isCliente && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="cedula"
                          value={formData.cedula}
                          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
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
                          value={formData.celular}
                          onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-end gap-3 rounded-b-xl border-t">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2 px-8">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  )
}
