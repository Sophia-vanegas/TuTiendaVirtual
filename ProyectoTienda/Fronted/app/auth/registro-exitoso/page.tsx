import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, CheckCircle, Mail } from "lucide-react"

export default function RegistroExitosoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Mi Tienda</span>
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Registro Exitoso</CardTitle>
          <CardDescription>Tu cuenta ha sido creada correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span className="text-sm">
                Revisa tu correo electronico para confirmar tu cuenta
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Te hemos enviado un correo de confirmacion. Una vez confirmes tu cuenta, podras iniciar sesion y comenzar a comprar.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Ir a Iniciar Sesion</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Volver al Inicio</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
