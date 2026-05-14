"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { CartItem, Producto } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addItem: (producto: Producto, cantidad?: number) => void
  removeItem: (productoId: string) => void
  updateQuantity: (productoId: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((producto: Producto, cantidad: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.producto.id === producto.id)
      if (existingItem) {
        const newCantidad = Math.min(
          existingItem.cantidad + cantidad,
          producto.cantidad
        )
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: newCantidad }
            : item
        )
      }
      return [...prev, { producto, cantidad: Math.min(cantidad, producto.cantidad) }]
    })
  }, [])

  const removeItem = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((item) => item.producto.id !== productoId))
  }, [])

  const updateQuantity = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.producto.id === productoId
          ? { ...item, cantidad: Math.min(cantidad, item.producto.cantidad) }
          : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getTotal = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    )
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.cantidad, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
