export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: CustomerInsert
        Update: CustomerUpdate
      }
      orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      order_members: {
        Row: OrderMember
        Insert: OrderMemberInsert
        Update: OrderMemberUpdate
      }
      garment_categories: {
        Row: GarmentCategory
        Insert: GarmentCategoryInsert
        Update: GarmentCategoryUpdate
      }
      garments: {
        Row: Garment
        Insert: GarmentInsert
        Update: GarmentUpdate
      }
      member_garments: {
        Row: MemberGarment
        Insert: MemberGarmentInsert
        Update: MemberGarmentUpdate
      }
      member_sizes: {
        Row: MemberSize
        Insert: MemberSizeInsert
        Update: MemberSizeUpdate
      }
      activity_logs: {
        Row: ActivityLog
        Insert: ActivityLogInsert
        Update: ActivityLogUpdate
      }
    }
    Views: {
      order_summary: {
        Row: OrderSummary
      }
      member_details: {
        Row: MemberDetails
      }
    }
    Enums: {
      order_status: 'draft' | 'confirmed' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
      member_role: 'groom' | 'best_man' | 'groomsman' | 'father_of_bride' | 'father_of_groom' | 'usher' | 'page_boy' | 'other'
      activity_action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout'
      size_type: 'chest' | 'waist' | 'inside_leg' | 'trouser_waist' | 'jacket_length' | 'shirt_collar' | 'shoe_size' | 'height' | 'weight'
    }
  }
}

export type OrderStatus = Database['public']['Enums']['order_status']
export type MemberRole = Database['public']['Enums']['member_role']
export type ActivityAction = Database['public']['Enums']['activity_action']
export type SizeType = Database['public']['Enums']['size_type']

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  county: string | null
  postcode: string | null
  country: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerInsert {
  id?: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  county?: string | null
  postcode?: string | null
  country?: string
  notes?: string | null
}

export interface CustomerUpdate {
  first_name?: string
  last_name?: string
  email?: string | null
  phone?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  county?: string | null
  postcode?: string | null
  country?: string
  notes?: string | null
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  wedding_date: string | null
  wedding_venue: string | null
  wedding_time: string | null
  function_type: string
  status: OrderStatus
  total_members: number
  special_requirements: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface OrderInsert {
  id?: string
  customer_id: string
  order_number: string
  wedding_date?: string | null
  wedding_venue?: string | null
  wedding_time?: string | null
  function_type?: string
  status?: OrderStatus
  total_members?: number
  special_requirements?: string | null
  internal_notes?: string | null
}

export interface OrderUpdate {
  wedding_date?: string | null
  wedding_venue?: string | null
  wedding_time?: string | null
  function_type?: string
  status?: OrderStatus
  total_members?: number
  special_requirements?: string | null
  internal_notes?: string | null
  completed_at?: string | null
}

export interface OrderMember {
  id: string
  order_id: string
  first_name: string
  last_name: string
  role: MemberRole
  email: string | null
  phone: string | null
  sort_order: number
  measurements_taken: boolean
  outfit_assigned: boolean
  fitting_completed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderMemberInsert {
  id?: string
  order_id: string
  first_name: string
  last_name: string
  role: MemberRole
  email?: string | null
  phone?: string | null
  sort_order?: number
  measurements_taken?: boolean
  outfit_assigned?: boolean
  fitting_completed?: boolean
  notes?: string | null
}

export interface OrderMemberUpdate {
  first_name?: string
  last_name?: string
  role?: MemberRole
  email?: string | null
  phone?: string | null
  sort_order?: number
  measurements_taken?: boolean
  outfit_assigned?: boolean
  fitting_completed?: boolean
  notes?: string | null
}

export interface GarmentCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface GarmentCategoryInsert {
  id?: string
  name: string
  description?: string | null
  sort_order?: number
  active?: boolean
}

export interface GarmentCategoryUpdate {
  name?: string
  description?: string | null
  sort_order?: number
  active?: boolean
}

export interface Garment {
  id: string
  category_id: string
  name: string
  description: string | null
  color: string | null
  material: string | null
  brand: string | null
  sku: string | null
  rental_price: number | null
  purchase_price: number | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface GarmentInsert {
  id?: string
  category_id: string
  name: string
  description?: string | null
  color?: string | null
  material?: string | null
  brand?: string | null
  sku?: string | null
  rental_price?: number | null
  purchase_price?: number | null
  active?: boolean
  sort_order?: number
}

export interface GarmentUpdate {
  category_id?: string
  name?: string
  description?: string | null
  color?: string | null
  material?: string | null
  brand?: string | null
  sku?: string | null
  rental_price?: number | null
  purchase_price?: number | null
  active?: boolean
  sort_order?: number
}

export interface MemberGarment {
  id: string
  member_id: string
  garment_id: string
  quantity: number
  is_rental: boolean
  notes: string | null
  created_at: string
}

export interface MemberGarmentInsert {
  id?: string
  member_id: string
  garment_id: string
  quantity?: number
  is_rental?: boolean
  notes?: string | null
}

export interface MemberGarmentUpdate {
  quantity?: number
  is_rental?: boolean
  notes?: string | null
}

export interface MemberSize {
  id: string
  member_id: string
  size_type: SizeType
  measurement: string
  measurement_unit: string | null
  notes: string | null
  measured_at: string
  measured_by: string | null
}

export interface MemberSizeInsert {
  id?: string
  member_id: string
  size_type: SizeType
  measurement: string
  measurement_unit?: string | null
  notes?: string | null
  measured_at?: string
  measured_by?: string | null
}

export interface MemberSizeUpdate {
  measurement?: string
  measurement_unit?: string | null
  notes?: string | null
  measured_by?: string | null
}

export interface ActivityLog {
  id: string
  user_identifier: string
  user_name: string | null
  action: ActivityAction
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  description: string
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  created_at: string
}

export interface ActivityLogInsert {
  id?: string
  user_identifier: string
  user_name?: string | null
  action: ActivityAction
  entity_type: string
  entity_id?: string | null
  entity_name?: string | null
  description: string
  details?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
}

export interface ActivityLogUpdate {
  description?: string
  details?: Record<string, any> | null
}

export interface OrderSummary {
  id: string
  order_number: string
  status: OrderStatus
  wedding_date: string | null
  wedding_venue: string | null
  function_type: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  total_members: number
  actual_members: number
  created_at: string
  updated_at: string
}

export interface MemberDetails {
  id: string
  order_id: string
  member_name: string
  role: MemberRole
  email: string | null
  phone: string | null
  sort_order: number
  measurements_taken: boolean
  outfit_assigned: boolean
  fitting_completed: boolean
  assigned_garments: number
  recorded_measurements: number
}