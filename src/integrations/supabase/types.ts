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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          by_name: string | null
          completed_at: string
          created_at: string
          id: string
          note: string | null
          task_id: string
        }
        Insert: {
          by_name?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          note?: string | null
          task_id: string
        }
        Update: {
          by_name?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          note?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          phone: string
          sms_opt_in: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          phone: string
          sms_opt_in?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          sms_opt_in?: boolean
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          contact_owner_id: string | null
          created_at: string
          detail: string | null
          id: string
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          contact_owner_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          contact_owner_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_contact_owner_fk"
            columns: ["contact_owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_shares: {
        Row: {
          created_at: string
          id: string
          property_id: string
          role: Database["public"]["Enums"]["share_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          role?: Database["public"]["Enums"]["share_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          role?: Database["public"]["Enums"]["share_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_shares_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_messages: {
        Row: {
          body: string
          created_at: string
          direction: Database["public"]["Enums"]["sms_direction"]
          error: string | null
          id: string
          owner_id: string
          status: string | null
          twilio_sid: string | null
        }
        Insert: {
          body: string
          created_at?: string
          direction: Database["public"]["Enums"]["sms_direction"]
          error?: string | null
          id?: string
          owner_id: string
          status?: string | null
          twilio_sid?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["sms_direction"]
          error?: string | null
          id?: string
          owner_id?: string
          status?: string | null
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_preferences: {
        Row: {
          daily_digest_enabled: boolean
          daily_digest_hour: number
          event_reminder_hours: number
          overdue_alerts_enabled: boolean
          owner_id: string
          updated_at: string
          weekly_summary_dow: number
          weekly_summary_enabled: boolean
          weekly_summary_hour: number
        }
        Insert: {
          daily_digest_enabled?: boolean
          daily_digest_hour?: number
          event_reminder_hours?: number
          overdue_alerts_enabled?: boolean
          owner_id: string
          updated_at?: string
          weekly_summary_dow?: number
          weekly_summary_enabled?: boolean
          weekly_summary_hour?: number
        }
        Update: {
          daily_digest_enabled?: boolean
          daily_digest_hour?: number
          event_reminder_hours?: number
          overdue_alerts_enabled?: boolean
          owner_id?: string
          updated_at?: string
          weekly_summary_dow?: number
          weekly_summary_enabled?: boolean
          weekly_summary_hour?: number
        }
        Relationships: [
          {
            foreignKeyName: "sms_preferences_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_overdue_notified_at: string | null
          next_due_at: string
          notes: string | null
          property_id: string
          recurrence_every_days: number | null
          recurrence_kind: Database["public"]["Enums"]["recurrence_kind"]
          recurrence_label: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_overdue_notified_at?: string | null
          next_due_at: string
          notes?: string | null
          property_id: string
          recurrence_every_days?: number | null
          recurrence_kind?: Database["public"]["Enums"]["recurrence_kind"]
          recurrence_label?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_overdue_notified_at?: string | null
          next_due_at?: string
          notes?: string | null
          property_id?: string
          recurrence_every_days?: number | null
          recurrence_kind?: Database["public"]["Enums"]["recurrence_kind"]
          recurrence_label?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_property: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      recurrence_kind: "once" | "recurring"
      share_role: "viewer" | "editor"
      sms_direction: "inbound" | "outbound"
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
    Enums: {
      recurrence_kind: ["once", "recurring"],
      share_role: ["viewer", "editor"],
      sms_direction: ["inbound", "outbound"],
    },
  },
} as const
