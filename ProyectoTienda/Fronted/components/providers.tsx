"use client"

import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
