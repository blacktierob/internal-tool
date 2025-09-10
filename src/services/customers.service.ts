import { supabase } from './supabase'
import type { Customer, CustomerInsert, CustomerUpdate, ActivityAction } from '../types/database.types'

export interface CustomerSearchFilters {
  search?: string
  email?: string
  phone?: string
  city?: string
  county?: string
  postcode?: string
}

export interface CustomerListResponse {
  customers: Customer[]
  total: number
  page: number
  limit: number
}

class CustomerService {
  
  async getAll(
    page = 1, 
    limit = 50, 
    filters?: CustomerSearchFilters
  ): Promise<CustomerListResponse> {
    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,` +
          `last_name.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%,` +
          `phone.ilike.%${filters.search}%`
        )
      }

      if (filters?.email) {
        query = query.ilike('email', `%${filters.email}%`)
      }

      if (filters?.phone) {
        query = query.ilike('phone', `%${filters.phone}%`)
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      if (filters?.county) {
        query = query.ilike('county', `%${filters.county}%`)
      }

      if (filters?.postcode) {
        query = query.ilike('postcode', `%${filters.postcode}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      query = query.range(from, from + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching customers:', error)
        throw new Error(`Failed to fetch customers: ${error.message}`)
      }

      await this.logActivity('view', 'customer_list', null, 'Viewed customer list', {
        filters,
        page,
        limit,
        total: count || 0
      })

      return {
        customers: data || [],
        total: count || 0,
        page,
        limit
      }
    } catch (error) {
      console.error('CustomerService.getAll error:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching customer:', error)
        throw new Error(`Failed to fetch customer: ${error.message}`)
      }

      if (!data) {
        throw new Error('Customer not found')
      }

      await this.logActivity('view', 'customer', id, `Viewed customer: ${data.first_name} ${data.last_name}`)

      return data
    } catch (error) {
      console.error('CustomerService.getById error:', error)
      throw error
    }
  }

  async create(customerData: CustomerInsert): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) {
        console.error('Error creating customer:', error)
        throw new Error(`Failed to create customer: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'customer', 
        data.id, 
        `Created customer: ${data.first_name} ${data.last_name}`,
        { customerData }
      )

      return data
    } catch (error) {
      console.error('CustomerService.create error:', error)
      throw error
    }
  }

  async update(id: string, customerData: CustomerUpdate): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating customer:', error)
        throw new Error(`Failed to update customer: ${error.message}`)
      }

      if (!data) {
        throw new Error('Customer not found')
      }

      await this.logActivity(
        'update', 
        'customer', 
        id, 
        `Updated customer: ${data.first_name} ${data.last_name}`,
        { updates: customerData }
      )

      return data
    } catch (error) {
      console.error('CustomerService.update error:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // First get customer name for logging
      const customer = await this.getById(id)
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting customer:', error)
        throw new Error(`Failed to delete customer: ${error.message}`)
      }

      await this.logActivity(
        'delete', 
        'customer', 
        id, 
        `Deleted customer: ${customer.first_name} ${customer.last_name}`
      )
    } catch (error) {
      console.error('CustomerService.delete error:', error)
      throw error
    }
  }

  async search(query: string, limit = 10): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(
          `first_name.ilike.%${query}%,` +
          `last_name.ilike.%${query}%,` +
          `email.ilike.%${query}%,` +
          `phone.ilike.%${query}%`
        )
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching customers:', error)
        throw new Error(`Failed to search customers: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('CustomerService.search error:', error)
      throw error
    }
  }

  async getCustomerWithOrders(id: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders:orders(
            *,
            order_members:order_members(
              count
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching customer with orders:', error)
        throw new Error(`Failed to fetch customer with orders: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('CustomerService.getCustomerWithOrders error:', error)
      throw error
    }
  }

  async getCustomerOrderHistory(id: string) {
    try {
      const customer = await this.getById(id)
      
      // Get orders where customer is the primary customer
      const { data: ownOrders, error: ownOrdersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          wedding_date,
          wedding_venue,
          status,
          total_members,
          created_at,
          customer:customers(first_name, last_name),
          order_members(count)
        `)
        .eq('customer_id', id)
        .order('created_at', { ascending: false })

      if (ownOrdersError) {
        console.error('Error fetching customer own orders:', ownOrdersError)
        throw new Error(`Failed to fetch customer own orders: ${ownOrdersError.message}`)
      }

      // Get orders where customer is a member of someone else's wedding party
      // We'll match by email or name since there's no direct customer link in order_members
      const { data: memberOrders, error: memberOrdersError } = await supabase
        .from('order_members')
        .select(`
          id,
          role,
          order:orders(
            id,
            order_number,
            wedding_date,
            wedding_venue,
            status,
            total_members,
            created_at,
            customer:customers(first_name, last_name)
          )
        `)
        .or(`email.eq.${customer.email},and(first_name.eq.${customer.first_name},last_name.eq.${customer.last_name})`)
        .order('created_at', { ascending: false })

      if (memberOrdersError) {
        console.error('Error fetching customer member orders:', memberOrdersError)
        // Don't throw, just continue with empty member orders
      }

      return {
        customer,
        ownOrders: ownOrders || [],
        memberOrders: memberOrders || []
      }
    } catch (error) {
      console.error('CustomerService.getCustomerOrderHistory error:', error)
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

const customerService = new CustomerService()

export { customerService }
export default customerService

// Re-export types for easier importing
export type { CustomerSearchFilters, CustomerListResponse }