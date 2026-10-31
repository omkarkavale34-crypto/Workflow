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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      application_files: {
        Row: {
          application_id: string
          content_type: string
          created_at: string
          file_name: string
          id: string
          kind: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          application_id: string
          content_type: string
          created_at?: string
          file_name: string
          id?: string
          kind: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          application_id?: string
          content_type?: string
          created_at?: string
          file_name?: string
          id?: string
          kind?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_files_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string | null
          body: string
          created_at: string
          id: number
        }
        Insert: {
          application_id: string
          author_id?: string | null
          body: string
          created_at?: string
          id?: never
        }
        Update: {
          application_id?: string
          author_id?: string | null
          body?: string
          created_at?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: number
          note: string | null
          to_status: string
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          note?: string | null
          to_status: string
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          note?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          availability: string
          behance: string | null
          branch: string
          client_ref: string
          created_at: string
          email: string
          full_name: string
          github: string | null
          id: string
          linkedin: string | null
          phone: string
          portfolio_url: string | null
          primary_role: string
          problem_solving: string
          project_description: string | null
          project_title: string | null
          role_assessment: string
          secondary_role: string | null
          skills: string
          status: string
          want_to_build: string
          website: string | null
          why_join: string
          year: string
        }
        Insert: {
          availability: string
          behance?: string | null
          branch: string
          client_ref: string
          created_at?: string
          email: string
          full_name: string
          github?: string | null
          id?: string
          linkedin?: string | null
          phone: string
          portfolio_url?: string | null
          primary_role: string
          problem_solving: string
          project_description?: string | null
          project_title?: string | null
          role_assessment: string
          secondary_role?: string | null
          skills: string
          status?: string
          want_to_build: string
          website?: string | null
          why_join: string
          year: string
        }
        Update: {
          availability?: string
          behance?: string | null
          branch?: string
          client_ref?: string
          created_at?: string
          email?: string
          full_name?: string
          github?: string | null
          id?: string
          linkedin?: string | null
          phone?: string
          portfolio_url?: string | null
          primary_role?: string
          problem_solving?: string
          project_description?: string | null
          project_title?: string | null
          role_assessment?: string
          secondary_role?: string | null
          skills?: string
          status?: string
          want_to_build?: string
          website?: string | null
          why_join?: string
          year?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          application_id: string | null
          created_at: string
          error: string | null
          id: number
          kind: string
          provider_id: string | null
          recipient: string
          status: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          error?: string | null
          id?: never
          kind: string
          provider_id?: string | null
          recipient: string
          status: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          error?: string | null
          id?: never
          kind?: string
          provider_id?: string | null
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "reviewer"],
    },
  },
} as const
