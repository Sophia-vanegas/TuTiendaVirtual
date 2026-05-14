"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Store,
  LogOut,
  ChevronLeft,
} from "lucide-react"

interface AdminSidebarProps {
  user: { email: string }
}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/compras", label: "Compras", icon: ShoppingCart },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Store className="h-6 w-6 text-sidebar-primary" />
        <span className="font-bold">Admin Panel</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 truncate text-sm text-sidebar-foreground/70">
          {user.email}
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a la Tienda
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </Button>
        </div>
      </div>
    </aside>
  )
}
