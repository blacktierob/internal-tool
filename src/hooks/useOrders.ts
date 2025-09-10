import { useState, useEffect } from 'react'
import { orderService } from '../services/orders.service'
import type { OrderSearchFilters, OrderListResponse } from '../services/orders.service'
import type { 
  Order, 
  OrderInsert, 
  OrderUpdate, 
  OrderSummary,
  OrderMember,
  OrderMemberInsert,
  OrderMemberUpdate 
} from '../types/database.types'

export interface UseOrdersOptions {
  page?: number
  limit?: number
  filters?: OrderSearchFilters
  autoFetch?: boolean
}

export interface UseOrdersReturn {
  orders: OrderSummary[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  createOrder: (data: OrderInsert) => Promise<Order>
  updateOrder: (id: string, data: OrderUpdate) => Promise<Order>
  deleteOrder: (id: string) => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: OrderSearchFilters) => void
  clearError: () => void
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    page: initialPage = 1,
    limit = 25,
    filters: initialFilters = {},
    autoFetch = true
  } = options

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(initialPage)
  const [filters, setFiltersState] = useState<OrderSearchFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response: OrderListResponse = await orderService.getAll(page, limit, filters)
      setOrders(response.orders)
      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (data: OrderInsert): Promise<Order> => {
    setLoading(true)
    setError(null)
    
    try {
      const newOrder = await orderService.create(data)
      // Refresh the list to include the new order
      await fetchOrders()
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateOrder = async (id: string, data: OrderUpdate): Promise<Order> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedOrder = await orderService.update(id, data)
      // Refresh the orders list to show updated data
      await fetchOrders()
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await orderService.delete(id)
      // Remove the order from local state
      setOrders(prev => prev.filter(order => order.id !== id))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setPage = (newPage: number) => {
    setPageState(newPage)
  }

  const setFilters = (newFilters: OrderSearchFilters) => {
    setFiltersState(newFilters)
    setPageState(1) // Reset to first page when filters change
  }

  const clearError = () => {
    setError(null)
  }

  // Auto-fetch on mount and when page or filters change
  useEffect(() => {
    if (autoFetch) {
      fetchOrders()
    }
  }, [page, filters, autoFetch])

  return {
    orders,
    total,
    page,
    limit,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    setPage,
    setFilters,
    clearError
  }
}

export interface UseOrderOptions {
  id: string
  includeMembers?: boolean
  autoFetch?: boolean
}

export interface UseOrderReturn {
  order: Order | null
  orderWithMembers: any | null
  members: OrderMember[]
  loading: boolean
  error: string | null
  fetchOrder: () => Promise<void>
  fetchOrderWithMembers: () => Promise<void>
  updateOrder: (data: OrderUpdate) => Promise<Order>
  deleteOrder: () => Promise<void>
  addMember: (data: OrderMemberInsert) => Promise<OrderMember>
  updateMember: (memberId: string, data: OrderMemberUpdate) => Promise<OrderMember>
  deleteMember: (memberId: string) => Promise<void>
  clearError: () => void
}

export function useOrder(options: UseOrderOptions): UseOrderReturn {
  const { id, includeMembers = false, autoFetch = true } = options

  const [order, setOrder] = useState<Order | null>(null)
  const [orderWithMembers, setOrderWithMembers] = useState<any | null>(null)
  const [members, setMembers] = useState<OrderMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedOrder = await orderService.getById(id)
      setOrder(fetchedOrder)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order'
      setError(errorMessage)
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderWithMembers = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedOrder = await orderService.getOrderWithMembers(id)
      setOrderWithMembers(fetchedOrder)
      setMembers(fetchedOrder.order_members || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order with members'
      setError(errorMessage)
      console.error('Error fetching order with members:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrder = async (data: OrderUpdate): Promise<Order> => {
    if (!id) throw new Error('No order ID provided')
    
    setLoading(true)
    setError(null)
    
    try {
      const updatedOrder = await orderService.update(id, data)
      setOrder(updatedOrder)
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (): Promise<void> => {
    if (!id) throw new Error('No order ID provided')
    
    setLoading(true)
    setError(null)
    
    try {
      await orderService.delete(id)
      setOrder(null)
      setOrderWithMembers(null)
      setMembers([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (data: OrderMemberInsert): Promise<OrderMember> => {
    setLoading(true)
    setError(null)
    
    try {
      const newMember = await orderService.addMember(data)
      setMembers(prev => [...prev, newMember].sort((a, b) => a.sort_order - b.sort_order))
      return newMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMember = async (memberId: string, data: OrderMemberUpdate): Promise<OrderMember> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedMember = await orderService.updateMember(memberId, data)
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? updatedMember : member
        ).sort((a, b) => a.sort_order - b.sort_order)
      )
      return updatedMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMember = async (memberId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await orderService.deleteMember(memberId)
      setMembers(prev => prev.filter(member => member.id !== memberId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete member'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    if (autoFetch && id) {
      if (includeMembers) {
        fetchOrderWithMembers()
      } else {
        fetchOrder()
      }
    }
  }, [id, includeMembers, autoFetch])

  return {
    order,
    orderWithMembers,
    members,
    loading,
    error,
    fetchOrder,
    fetchOrderWithMembers,
    updateOrder,
    deleteOrder,
    addMember,
    updateMember,
    deleteMember,
    clearError
  }
}