export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RepairStatus =
  | "pending"
  | "diagnosed"
  | "in_progress"
  | "waiting_parts"
  | "completed"
  | "delivered"
  | "cancelled";

export type DeviceType =
  | "smartphone"
  | "tablet"
  | "laptop"
  | "desktop"
  | "console"
  | "other";

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string | null;
          phone: string;
          address: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email?: string | null;
          phone: string;
          address?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          address?: string | null;
          notes?: string | null;
        };
      };
      devices: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          type: DeviceType;
          brand: string;
          model: string;
          serial_number: string | null;
          color: string | null;
          condition_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id: string;
          type: DeviceType;
          brand: string;
          model: string;
          serial_number?: string | null;
          color?: string | null;
          condition_notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string;
          type?: DeviceType;
          brand?: string;
          model?: string;
          serial_number?: string | null;
          color?: string | null;
          condition_notes?: string | null;
        };
      };
      repairs: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          ticket_number: string;
          device_id: string;
          customer_id: string;
          technician_id: string | null;
          status: RepairStatus;
          issue_description: string;
          diagnosis: string | null;
          resolution: string | null;
          estimated_cost: number | null;
          final_cost: number | null;
          estimated_completion: string | null;
          completed_at: string | null;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          ticket_number?: string;
          device_id: string;
          customer_id: string;
          technician_id?: string | null;
          status?: RepairStatus;
          issue_description: string;
          diagnosis?: string | null;
          resolution?: string | null;
          estimated_cost?: number | null;
          final_cost?: number | null;
          estimated_completion?: string | null;
          completed_at?: string | null;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          ticket_number?: string;
          device_id?: string;
          customer_id?: string;
          technician_id?: string | null;
          status?: RepairStatus;
          issue_description?: string;
          diagnosis?: string | null;
          resolution?: string | null;
          estimated_cost?: number | null;
          final_cost?: number | null;
          estimated_completion?: string | null;
          completed_at?: string | null;
          delivered_at?: string | null;
        };
      };
      inventory: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          sku: string;
          description: string | null;
          category: string;
          quantity: number;
          min_quantity: number;
          cost_price: number;
          sell_price: number;
          location: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          sku: string;
          description?: string | null;
          category: string;
          quantity?: number;
          min_quantity?: number;
          cost_price: number;
          sell_price: number;
          location?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          sku?: string;
          description?: string | null;
          category?: string;
          quantity?: number;
          min_quantity?: number;
          cost_price?: number;
          sell_price?: number;
          location?: string | null;
        };
      };
      repair_parts: {
        Row: {
          id: string;
          repair_id: string;
          inventory_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          repair_id: string;
          inventory_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: string;
          repair_id?: string;
          inventory_id?: string;
          quantity?: number;
          unit_price?: number;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string;
          role: "admin" | "technician";
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name: string;
          role?: "admin" | "technician";
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string;
          role?: "admin" | "technician";
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      repair_status: RepairStatus;
      device_type: DeviceType;
      user_role: "admin" | "technician";
    };
  };
}
