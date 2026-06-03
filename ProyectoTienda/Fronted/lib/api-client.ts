import { Producto } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const apiClient = {
    async getProductos(tipo?: string, buscar?: string): Promise<Producto[]> {
        const params = new URLSearchParams()
        if (tipo) params.append('tipo', tipo)
        if (buscar) params.append('buscar', buscar)

        const response = await fetch(`${API_BASE_URL}/productos?${params.toString()}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error('Error al obtener productos')
        }

        return response.json()
    },

    async getTipos(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/productos/tipos`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error('Error al obtener tipos de productos')
        }

        return response.json()
    },

    async login(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al iniciar sesión')
        }

        return response.json()
    },

    async register(data: any) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al registrarse')
        }

        return response.json()
    },

    // --- ADMIN METHODS ---
    async getAdminClientes() {
        const response = await fetch(`${API_BASE_URL}/admin/clientes`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener clientes')
        return response.json()
    },

    async deleteCliente(id: string) {
        const response = await fetch(`${API_BASE_URL}/admin/clientes/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Error al eliminar cliente')
        return response.json()
    },

    async getAdminProductos() {
        const response = await fetch(`${API_BASE_URL}/admin/productos`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener productos')
        return response.json()
    },

    async addProducto(data: any) {
        const response = await fetch(`${API_BASE_URL}/admin/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Error al agregar producto')
        return response.json()
    },

    async updateProducto(id: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/admin/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Error al actualizar producto')
        return response.json()
    },

    async deleteProducto(id: string) {
        const response = await fetch(`${API_BASE_URL}/admin/productos/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Error al eliminar producto')
        return response.json()
    },

    async getAdminCompras() {
        const response = await fetch(`${API_BASE_URL}/admin/compras`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener compras')
        return response.json()
    },

    // --- CLIENT METHODS ---
    async getClienteProductos() {
        const response = await fetch(`${API_BASE_URL}/cliente/productos`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener productos')
        return response.json()
    },

    async comprar(clienteId: string, productos: { id_producto: string, cantidad: number }[]) {
        const response = await fetch(`${API_BASE_URL}/cliente/comprar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cliente: clienteId, productos })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al procesar la compra')
        }

        return response.json()
    },

    async getMisCompras(clienteId: string) {
        const response = await fetch(`${API_BASE_URL}/cliente/compras/${clienteId}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener mis compras')
        return response.json()
    },

    async getProfile(userId: string) {
        const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Error al obtener perfil')
        return response.json()
    },

    async updateProfile(userId: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al actualizar perfil')
        }
        return response.json()
    }
}
