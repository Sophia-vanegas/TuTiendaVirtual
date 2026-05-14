import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/perfil")
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Administra tu informacion personal
          </p>
        </div>

        <ProfileForm user={user} cliente={cliente} />
      </main>
    </div>
  )
}
