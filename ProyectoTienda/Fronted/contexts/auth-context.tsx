"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    email: string
    nombre: string
    rol: 'admin' | 'cliente'
}

interface AuthContextType {
    user: User | null
    login: (userData: any) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Cargar usuario desde localStorage al iniciar
        const savedUser = localStorage.getItem("tienda_user")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (userData: any) => {
        setUser(userData)
        localStorage.setItem("tienda_user", JSON.stringify(userData))
        localStorage.setItem("tienda_token", userData.token)
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("tienda_user")
        localStorage.removeItem("tienda_token")
        router.push("/")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider")
    }
    return context
}
