import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/router'

/**
 * Simple authentication context that stores a JWT token in localStorage.
 * The token is read on initial mount and kept in the component state.
 */
interface AuthContextProps {
  token: string | null
  setToken: (t: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load token from localStorage on first render
    const stored = localStorage.getItem('authToken')
    if (stored) setTokenState(stored)
  }, [])

  const setToken = (t: string | null) => {
    if (t) {
      localStorage.setItem('authToken', t)
    } else {
      localStorage.removeItem('authToken')
    }
    setTokenState(t)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    setToken(data.token)
    router.push('/')
  }

  const logout = () => {
    setToken(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth must be used within an AuthProvider')
  return context
}

/**
 * Helper that performs fetch with Bearer token if available.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken')
  const headers = {
    ...(options.headers as Record<string, string> | undefined),
    Authorization: token ? `Bearer ${token}` : undefined,
  }
  return fetch(url, { ...options, headers })
}

