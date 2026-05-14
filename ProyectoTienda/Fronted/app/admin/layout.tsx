import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin")
  }

  // Check if user is admin
  const isAdmin = user.user_metadata?.is_admin === true

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  )
}
