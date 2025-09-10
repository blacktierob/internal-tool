import { supabase } from './supabase'

export interface PinAttemptRow {
  pin_hash: string
  attempts: number
  lock_until: string | null
  last_attempt_at: string | null
}

export const adminService = {
  async listPinAttempts(): Promise<{ rows: PinAttemptRow[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('pin_list_attempts')
      if (error) return { rows: [], error: error.message }
      return { rows: (data as PinAttemptRow[]) || [], error: null }
    } catch (e) {
      return { rows: [], error: 'Failed to load PIN attempts' }
    }
  },

  async resetPinAttempts(pinHash: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('pin_reset_attempts', { p_pin_hash: pinHash })
      return { error: error?.message || null }
    } catch (e) {
      return { error: 'Failed to reset PIN attempts' }
    }
  }
}

