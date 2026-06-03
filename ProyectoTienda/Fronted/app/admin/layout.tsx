"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin")
      } else if (user.rol !== 'admin') {
        router.push("/")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.rol !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
