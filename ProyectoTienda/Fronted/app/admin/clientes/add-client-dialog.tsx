"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"

export function AddClientDialog() {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        cedula: "",
        nombre: "",
        apellidos: "",
        email: "",
        celular: "",
        direccion: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setSuccessMsg(null)

        try {
            const resp = await apiClient.register(formData)
            setSuccessMsg(resp.debug_password_info)
            setFormData({ cedula: "", nombre: "", apellidos: "", email: "", celular: "", direccion: "" })
            router.refresh()
            // Keep open to show high-security auto-password
        } catch (err: any) {
            alert(err.message || "Error al crear cliente")
            setIsLoading(false)
        } finally {
            if (!successMsg) setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSuccessMsg(null); }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                {successMsg ? (
                    <div className="py-6 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-green-100 p-3 text-green-600">
                                <Plus className="h-6 w-6" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold">Cliente Creado</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Se han generado las credenciales automáticamente:
                        </p>
                        <div className="mt-4 p-3 bg-muted rounded font-mono text-sm">
                            {successMsg}
                        </div>
                        <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
                            Entendido
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                            <DialogDescription>
                                Ingresa los datos personales del cliente. El sistema generará su clave.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cedula">Cédula</Label>
                                    <Input id="cedula" value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="celular">Celular</Label>
                                    <Input id="celular" value={formData.celular} onChange={(e) => setFormData({ ...formData, celular: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input id="apellidos" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input id="direccion" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Crear Cliente
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
