export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quotations: {
        Row: {
          id: string
          code: string
          client_name: string
          client_brand: string | null
          client_email: string | null
          client_our_ref: string | null
          client_ref: string | null
          client_description: string | null
          client_sample_size: string | null
          article_image: string | null
          components: Json
          developments: Json
          quantities: number[]
          margins: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          client_name: string
          client_brand?: string | null
          client_email?: string | null
          client_our_ref?: string | null
          client_ref?: string | null
          client_description?: string | null
          client_sample_size?: string | null
          article_image?: string | null
          components?: Json
          developments?: Json
          quantities?: number[]
          margins?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          client_name?: string
          client_brand?: string | null
          client_email?: string | null
          client_our_ref?: string | null
          client_ref?: string | null
          client_description?: string | null
          client_sample_size?: string | null
          article_image?: string | null
          components?: Json
          developments?: Json
          quantities?: number[]
          margins?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}