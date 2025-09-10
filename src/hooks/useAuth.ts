import { useState, useEffect, useCallback } from 'react'
import { authService, type AuthUser } from '../services/auth.service'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const loginWithPin = useCallback(async (pin: string) => {
    setLoading(true)
    try {
      const { user, error } = await authService.loginWithPin(pin)
      if (error) {
        throw new Error(error)
      }
      if (user) {
        await authService.saveUserSession(user)
        setUser(user)
      }
    } catch (error) {
      console.error('PIN login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setUser(null)
      // Navigate to root, which will show login screen but preserve weekly session
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  return {
    user,
    loading,
    loginWithPin,
    logout,
    isAuthenticated: !!user
  }
}