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
      orders: {
        Row: {
          id: string
          customer_id: string
          number: number
          order_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          number: number
          order_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          number?: number
          order_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          sku: string
          style: string
          waist: number
          shape: string
          inseam: number
          wash: string
          hem: string
          quantity: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sku: string
          style: string
          waist: number
          shape: string
          inseam: number
          wash: string
          hem: string
          quantity?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sku?: string
          style?: string
          waist?: number
          shape?: string
          inseam?: number
          wash?: string
          hem?: string
          quantity?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          product_id: string | null
          sku: string
          status1: string
          status2: string
          qr_code: string | null
          batch_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          sku: string
          status1: string
          status2: string
          qr_code?: string | null
          batch_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          sku?: string
          status1?: string
          status2?: string
          qr_code?: string | null
          batch_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_events: {
        Row: {
          id: string
          inventory_item_id: string
          event_name: string
          event_description: string | null
          status: string
          timestamp: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inventory_item_id: string
          event_name: string
          event_description?: string | null
          status: string
          timestamp?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string
          event_name?: string
          event_description?: string | null
          status?: string
          timestamp?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      pending_production: {
        Row: {
          id: string
          sku: string
          quantity: number
          priority: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          quantity: number
          priority: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          quantity?: number
          priority?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          pending_request_id: string
          batch_number: number
          total_quantity: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pending_request_id: string
          batch_number?: number
          total_quantity: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pending_request_id?: string
          batch_number?: number
          total_quantity?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      production: {
        Row: {
          id: string
          sku: string
          current_stage: string
          notes: string | null
          batch_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          current_stage?: string
          notes?: string | null
          batch_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          current_stage?: string
          notes?: string | null
          batch_id?: string
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
  }
}