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
          date: string
          client_name: string
          client_brand: string | null
          client_email: string | null
          client_our_ref: string | null
          client_ref: string | null
          client_description: string | null
          client_sample_size: string | null
          article_image: string | null
          quantities: number[]
          margins: number[]
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          date?: string
          client_name: string
          client_brand?: string | null
          client_email?: string | null
          client_our_ref?: string | null
          client_ref?: string | null
          client_description?: string | null
          client_sample_size?: string | null
          article_image?: string | null
          quantities?: number[]
          margins?: number[]
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          date?: string
          client_name?: string
          client_brand?: string | null
          client_email?: string | null
          client_our_ref?: string | null
          client_ref?: string | null
          client_description?: string | null
          client_sample_size?: string | null
          article_image?: string | null
          quantities?: number[]
          margins?: number[]
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      components: {
        Row: {
          id: string
          quotation_id: string
          description: string
          supplier: string | null
          unit_price: number
          consumption: number
          has_moq: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quotation_id: string
          description: string
          supplier?: string | null
          unit_price?: number
          consumption?: number
          has_moq?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quotation_id?: string
          description?: string
          supplier?: string | null
          unit_price?: number
          consumption?: number
          has_moq?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      developments: {
        Row: {
          id: string
          quotation_id: string
          description: string
          supplier: string | null
          cost: number
          is_from_moq: boolean
          moq_quantity: number | null
          include_in_subtotal: boolean
          show_in_pdf: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quotation_id: string
          description: string
          supplier?: string | null
          cost?: number
          is_from_moq?: boolean
          moq_quantity?: number | null
          include_in_subtotal?: boolean
          show_in_pdf?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quotation_id?: string
          description?: string
          supplier?: string | null
          cost?: number
          is_from_moq?: boolean
          moq_quantity?: number | null
          include_in_subtotal?: boolean
          show_in_pdf?: boolean
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