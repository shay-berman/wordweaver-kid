export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_generated_challenges: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string
          id: string
          image_path: string
          questions: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level?: string
          id?: string
          image_path: string
          questions: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string
          id?: string
          image_path?: string
          questions?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_hebrew: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_hebrew: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_hebrew?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category_id: string
          created_at: string
          description: string
          difficulty_level: string
          estimated_duration_minutes: number | null
          id: string
          title: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          difficulty_level: string
          estimated_duration_minutes?: number | null
          id?: string
          title: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          estimated_duration_minutes?: number | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "challenge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          completed_at: string
          id: string
          level: number
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          level?: number
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          level?: number
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      high_scores: {
        Row: {
          created_at: string
          id: string
          play_time: number
          player_name: string
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          play_time: number
          player_name: string
          score: number
        }
        Update: {
          created_at?: string
          id?: string
          play_time?: number
          player_name?: string
          score?: number
        }
        Relationships: []
      }
      memory_mate_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_mate_reminders: {
        Row: {
          audio_path: string | null
          cancel_reason: string | null
          cancelled: boolean | null
          cancelled_all_future: boolean | null
          cancelled_for_date: string | null
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          is_recurring: boolean
          note: string | null
          recurrence_days: number[] | null
          recurrence_type: string | null
          snooze_until: string | null
          text: string
          time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_path?: string | null
          cancel_reason?: string | null
          cancelled?: boolean | null
          cancelled_all_future?: boolean | null
          cancelled_for_date?: string | null
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_recurring?: boolean
          note?: string | null
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          snooze_until?: string | null
          text: string
          time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_path?: string | null
          cancel_reason?: string | null
          cancelled?: boolean | null
          cancelled_all_future?: boolean | null
          cancelled_for_date?: string | null
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_recurring?: boolean
          note?: string | null
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          snooze_until?: string | null
          text?: string
          time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_selections: {
        Row: {
          cancelled_at: string | null
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          selected_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          selected_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          selected_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_selections_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          current_level: number
          display_name: string | null
          games_played: number
          id: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          display_name?: string | null
          games_played?: number
          id?: string
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          display_name?: string | null
          games_played?: number
          id?: string
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
