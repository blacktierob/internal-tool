import { createClient } from '@supabase/supabase-js'

// These would normally come from environment variables
// For development, we'll use placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types will be generated later
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  // This will be populated when we set up the database schema
}