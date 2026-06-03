export interface Cliente {
  id: string
  user_id: string | null
  cedula: string
  nombre: string
  apellidos: string
  email: string
  celular: string
  direccion: string
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  tipo_producto: string
  cantidad: number
  precio: number
  imagen_url?: string
  created_at: string
  updated_at: string
}

export interface Compra {
  id: string
  cliente_id: string
  total: number
  created_at: string
}

export interface DetalleCompra {
  id: string
  compra_id: string
  producto_id: string | null
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface CartItem {
  producto: Producto
  cantidad: number
}

export interface User {
  id: string
  email: string
  nombre: string
  rol: string
}
