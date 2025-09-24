import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    display_name?: string
  }
}

export type UserProfile = {
  id: string
  user_id: string
  display_name: string
  total_score: number
  games_played: number
  current_level: number
  created_at: string
  updated_at: string
}

export type GameResult = {
  id: string
  user_id: string
  score: number
  total_questions: number
  level: number
  completed_at: string
}