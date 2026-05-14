import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface ItemCompra {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { cliente_id, items } = body as { cliente_id: string; items: ItemCompra[] }

    if (!cliente_id || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Verify products and stock
    const productoIds = items.map((item) => item.producto_id)
    const { data: productos, error: productosError } = await supabase
      .from("productos")
      .select("*")
      .in("id", productoIds)

    if (productosError || !productos) {
      return NextResponse.json({ error: "Error al verificar productos" }, { status: 500 })
    }

    // Check stock availability
    for (const item of items) {
      const producto = productos.find((p) => p.id === item.producto_id)
      if (!producto) {
        return NextResponse.json({ error: `Producto no encontrado` }, { status: 400 })
      }
      if (producto.cantidad < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto.nombre}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)

    // Create purchase
    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .insert({ cliente_id, total })
      .select()
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: "Error al crear la compra" }, { status: 500 })
    }

    // Create purchase details
    const detalles = items.map((item) => {
      const producto = productos.find((p) => p.id === item.producto_id)!
      return {
        compra_id: compra.id,
        producto_id: item.producto_id,
        producto_nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad,
      }
    })

    const { error: detallesError } = await supabase.from("detalle_compras").insert(detalles)

    if (detallesError) {
      return NextResponse.json({ error: "Error al registrar detalles" }, { status: 500 })
    }

    // Update product stock
    for (const item of items) {
      const producto = productos.find((p) => p.id === item.producto_id)!
      await supabase
        .from("productos")
        .update({ cantidad: producto.cantidad - item.cantidad, updated_at: new Date().toISOString() })
        .eq("id", item.producto_id)
    }

    return NextResponse.json({ compra, message: "Compra realizada exitosamente" })
  } catch (error) {
    console.error("[v0] Error processing purchase:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
