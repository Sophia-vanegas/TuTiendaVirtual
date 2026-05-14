import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { CartContent } from "./cart-content"

export default async function CarritoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let cliente = null
  if (user) {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", user.id)
      .single()
    cliente = data
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <CartContent user={user} cliente={cliente} />
    </div>
  )
}
