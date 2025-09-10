import { supabase } from './supabase'
import type { 
  Order, 
  OrderInsert, 
  OrderUpdate, 
  OrderSummary,
  OrderMember,
  OrderMemberInsert,
  OrderMemberUpdate,
  ActivityAction 
} from '../types/database.types'

export interface OrderSearchFilters {
  search?: string
  status?: string
  customer_id?: string
  wedding_date_from?: string
  wedding_date_to?: string
  function_type?: string
}

export interface OrderListResponse {
  orders: OrderSummary[]
  total: number
  page: number
  limit: number
}

class OrderService {
  
  private mapStatusToDisplayStatus(status: string, weddingDate: string | null): string {
    const today = new Date().toISOString().split('T')[0]
    const isWeddingPast = weddingDate && weddingDate < today
    
    switch (status) {
      case 'draft':
        return 'no_deposit'
      case 'confirmed':
      case 'in_progress':
      case 'ready':
        return isWeddingPast ? 'past' : 'active'
      case 'completed':
        return 'past'
      case 'cancelled':
        return 'past'
      default:
        return 'active'
    }
  }
  
  async getAll(
    page = 1, 
    limit = 50, 
    filters?: OrderSearchFilters
  ): Promise<OrderListResponse> {
    try {
      let query = supabase
        .from('order_summary')
        .select('*', { count: 'exact' })
        .order('wedding_date', { ascending: true })
        .order('customer_name', { ascending: true })

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,` +
          `customer_name.ilike.%${filters.search}%,` +
          `wedding_venue.ilike.%${filters.search}%`
        )
      }

      if (filters?.status) {
        // Map business logic statuses to database statuses
        switch (filters.status) {
          case 'no_deposit':
            query = query.eq('status', 'draft')
            break
          case 'active':
            query = query.in('status', ['confirmed', 'in_progress', 'ready'])
            // Also filter for future or current dates
            query = query.gte('wedding_date', new Date().toISOString().split('T')[0])
            break
          case 'past':
            query = query.eq('status', 'completed')
            // Also filter for past dates
            query = query.lt('wedding_date', new Date().toISOString().split('T')[0])
            break
          default:
            // For any other status, filter by exact match
            query = query.eq('status', filters.status)
        }
      }

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id)
      }

      if (filters?.function_type) {
        query = query.eq('function_type', filters.function_type)
      }

      if (filters?.wedding_date_from) {
        query = query.gte('wedding_date', filters.wedding_date_from)
      }

      if (filters?.wedding_date_to) {
        query = query.lte('wedding_date', filters.wedding_date_to)
      }

      // Apply pagination
      const from = (page - 1) * limit
      query = query.range(from, from + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        throw new Error(`Failed to fetch orders: ${error.message}`)
      }

      await this.logActivity('view', 'order_list', null, 'Viewed order list', {
        filters,
        page,
        limit,
        total: count || 0
      })

      // Map the database status to display status for each order
      const ordersWithMappedStatus = (data || []).map(order => ({
        ...order,
        status: this.mapStatusToDisplayStatus(order.status, order.wedding_date)
      }))

      return {
        orders: ordersWithMappedStatus,
        total: count || 0,
        page,
        limit
      }
    } catch (error) {
      console.error('OrderService.getAll error:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        throw new Error(`Failed to fetch order: ${error.message}`)
      }

      if (!data) {
        throw new Error('Order not found')
      }

      await this.logActivity('view', 'order', id, `Viewed order: ${data.order_number}`)

      return data
    } catch (error) {
      console.error('OrderService.getById error:', error)
      throw error
    }
  }

  async getOrderWithMembers(id: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          order_members:order_members(
            *,
            member_garments:member_garments(
              *,
              garment:garments(*)
            ),
            member_sizes:member_sizes(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching order with members:', error)
        throw new Error(`Failed to fetch order with members: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('OrderService.getOrderWithMembers error:', error)
      throw error
    }
  }

  async create(orderData: OrderInsert): Promise<Order> {
    try {
      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number')

      if (orderNumberError) {
        throw new Error(`Failed to generate order number: ${orderNumberError.message}`)
      }

      const orderWithNumber = {
        ...orderData,
        order_number: orderNumberData
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(orderWithNumber)
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        throw new Error(`Failed to create order: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'order', 
        data.id, 
        `Created order: ${data.order_number}`,
        { orderData: orderWithNumber }
      )

      return data
    } catch (error) {
      console.error('OrderService.create error:', error)
      throw error
    }
  }

  async update(id: string, orderData: OrderUpdate): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating order:', error)
        throw new Error(`Failed to update order: ${error.message}`)
      }

      if (!data) {
        throw new Error('Order not found')
      }

      await this.logActivity(
        'update', 
        'order', 
        id, 
        `Updated order: ${data.order_number}`,
        { updates: orderData }
      )

      return data
    } catch (error) {
      console.error('OrderService.update error:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // First get order details for logging
      const order = await this.getById(id)
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting order:', error)
        throw new Error(`Failed to delete order: ${error.message}`)
      }

      await this.logActivity(
        'delete', 
        'order', 
        id, 
        `Deleted order: ${order.order_number}`
      )
    } catch (error) {
      console.error('OrderService.delete error:', error)
      throw error
    }
  }

  // Order Member Management
  async addMember(memberData: OrderMemberInsert): Promise<OrderMember> {
    try {
      const { data, error } = await supabase
        .from('order_members')
        .insert(memberData)
        .select()
        .single()

      if (error) {
        console.error('Error adding order member:', error)
        throw new Error(`Failed to add order member: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'order_member', 
        data.id, 
        `Added member: ${data.first_name} ${data.last_name} to order`,
        { memberData }
      )

      return data
    } catch (error) {
      console.error('OrderService.addMember error:', error)
      throw error
    }
  }

  async updateMember(id: string, memberData: OrderMemberUpdate): Promise<OrderMember> {
    try {
      const { data, error } = await supabase
        .from('order_members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating order member:', error)
        throw new Error(`Failed to update order member: ${error.message}`)
      }

      if (!data) {
        throw new Error('Order member not found')
      }

      await this.logActivity(
        'update', 
        'order_member', 
        id, 
        `Updated member: ${data.first_name} ${data.last_name}`,
        { updates: memberData }
      )

      return data
    } catch (error) {
      console.error('OrderService.updateMember error:', error)
      throw error
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      // First get member details for logging
      const { data: member, error: fetchError } = await supabase
        .from('order_members')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch member: ${fetchError.message}`)
      }

      const { error } = await supabase
        .from('order_members')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting order member:', error)
        throw new Error(`Failed to delete order member: ${error.message}`)
      }

      await this.logActivity(
        'delete', 
        'order_member', 
        id, 
        `Deleted member: ${member.first_name} ${member.last_name}`
      )
    } catch (error) {
      console.error('OrderService.deleteMember error:', error)
      throw error
    }
  }

  async getOrderMembers(orderId: string): Promise<OrderMember[]> {
    try {
      const { data, error } = await supabase
        .from('order_members')
        .select('*')
        .eq('order_id', orderId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching order members:', error)
        throw new Error(`Failed to fetch order members: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('OrderService.getOrderMembers error:', error)
      throw error
    }
  }

  async addMemberGarment(memberGarmentData: { member_id: string, garment_id: string, hire: boolean }) {
    try {
      const { data, error } = await supabase
        .from('member_garments')
        .insert(memberGarmentData)
        .select()
        .single()

      if (error) {
        console.error('Error adding member garment:', error)
        throw new Error(`Failed to add member garment: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('OrderService.addMemberGarment error:', error)
      throw error
    }
  }

  async addMemberSize(memberSizeData: { member_id: string, size_type: string, value: number, unit: string }) {
    try {
      const { data, error } = await supabase
        .from('member_sizes')
        .insert(memberSizeData)
        .select()
        .single()

      if (error) {
        console.error('Error adding member size:', error)
        throw new Error(`Failed to add member size: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('OrderService.addMemberSize error:', error)
      throw error
    }
  }

  private async logActivity(
    action: ActivityAction,
    entityType: string,
    entityId: string | null,
    description: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      // For now, using a placeholder user identifier
      // This will be replaced with actual session/auth data
      const userIdentifier = '1234' // PIN from current auth
      
      await supabase.rpc('log_activity', {
        p_user_identifier: userIdentifier,
        p_user_name: 'Staff User', // Will be from auth context
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_entity_name: null,
        p_description: description,
        p_details: details || null
      })
    } catch (error) {
      // Don't throw on logging errors, just log them
      console.warn('Failed to log activity:', error)
    }
  }
}

const orderService = new OrderService()

export { orderService }
export default orderService

// Re-export types for easier importing
export type { OrderSearchFilters, OrderListResponse }