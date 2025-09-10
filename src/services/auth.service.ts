import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'staff'
  lastLogin?: Date
}

export const authService = {
  // PIN-based authentication
  async loginWithPin(pin: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Find user by PIN code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, pin_code')
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { user: null, error: 'Invalid PIN' }
      }

      // Update last PIN login
      await supabase
        .from('users')
        .update({ last_pin_login: new Date().toISOString() })
        .eq('id', userData.id)

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        lastLogin: new Date()
      }

      return { user, error: null }
    } catch (error) {
      console.error('PIN login error:', error)
      return { user: null, error: 'Login failed' }
    }
  },

  async logout(): Promise<{ error: string | null }> {
    try {
      // Clear the user session
      localStorage.removeItem('user')
      return { error: null }
    } catch (error) {
      console.error('Logout error:', error)
      return { error: 'Logout failed' }
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userJson = localStorage.getItem('user')
      if (userJson) {
        return JSON.parse(userJson) as AuthUser
      }
      return null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async saveUserSession(user: AuthUser): Promise<void> {
    try {
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      console.error('Save user session error:', error)
    }
  }
}
