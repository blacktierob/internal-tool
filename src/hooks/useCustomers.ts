import { useState, useEffect } from 'react'
import { customerService } from '../services/customers.service'
import type { CustomerSearchFilters, CustomerListResponse } from '../services/customers.service'
import type { Customer, CustomerInsert, CustomerUpdate } from '../types/database.types'

export interface UseCustomersOptions {
  page?: number
  limit?: number
  filters?: CustomerSearchFilters
  autoFetch?: boolean
}

export interface UseCustomersReturn {
  customers: Customer[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  createCustomer: (data: CustomerInsert) => Promise<Customer>
  updateCustomer: (id: string, data: CustomerUpdate) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  searchCustomers: (query: string, limit?: number) => Promise<Customer[]>
  setPage: (page: number) => void
  setFilters: (filters: CustomerSearchFilters) => void
  clearError: () => void
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const {
    page: initialPage = 1,
    limit = 50,
    filters: initialFilters = {},
    autoFetch = true
  } = options

  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(initialPage)
  const [filters, setFiltersState] = useState<CustomerSearchFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response: CustomerListResponse = await customerService.getAll(page, limit, filters)
      setCustomers(response.customers)
      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers'
      setError(errorMessage)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (data: CustomerInsert): Promise<Customer> => {
    setLoading(true)
    setError(null)
    
    try {
      const newCustomer = await customerService.create(data)
      // Refresh the list to include the new customer
      await fetchCustomers()
      return newCustomer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (id: string, data: CustomerUpdate): Promise<Customer> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedCustomer = await customerService.update(id, data)
      // Update the customer in the local state
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? updatedCustomer : customer
        )
      )
      return updatedCustomer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await customerService.delete(id)
      // Remove the customer from local state
      setCustomers(prev => prev.filter(customer => customer.id !== id))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const searchCustomers = async (query: string, searchLimit = 10): Promise<Customer[]> => {
    try {
      return await customerService.search(query, searchLimit)
    } catch (err) {
      console.error('Error searching customers:', err)
      return []
    }
  }

  const setPage = (newPage: number) => {
    setPageState(newPage)
  }

  const setFilters = (newFilters: CustomerSearchFilters) => {
    setFiltersState(newFilters)
    setPageState(1) // Reset to first page when filters change
  }

  const clearError = () => {
    setError(null)
  }

  // Auto-fetch on mount and when page or filters change
  useEffect(() => {
    if (autoFetch) {
      fetchCustomers()
    }
  }, [page, filters, autoFetch])

  return {
    customers,
    total,
    page,
    limit,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    setPage,
    setFilters,
    clearError
  }
}

export interface UseCustomerOptions {
  id: string
  autoFetch?: boolean
}

export interface UseCustomerReturn {
  customer: Customer | null
  loading: boolean
  error: string | null
  fetchCustomer: () => Promise<void>
  updateCustomer: (data: CustomerUpdate) => Promise<Customer>
  deleteCustomer: () => Promise<void>
  clearError: () => void
}

export function useCustomer(options: UseCustomerOptions): UseCustomerReturn {
  const { id, autoFetch = true } = options

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedCustomer = await customerService.getById(id)
      setCustomer(fetchedCustomer)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer'
      setError(errorMessage)
      console.error('Error fetching customer:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (data: CustomerUpdate): Promise<Customer> => {
    if (!id) throw new Error('No customer ID provided')
    
    setLoading(true)
    setError(null)
    
    try {
      const updatedCustomer = await customerService.update(id, data)
      setCustomer(updatedCustomer)
      return updatedCustomer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (): Promise<void> => {
    if (!id) throw new Error('No customer ID provided')
    
    setLoading(true)
    setError(null)
    
    try {
      await customerService.delete(id)
      setCustomer(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
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
      fetchCustomer()
    }
  }, [id, autoFetch])

  return {
    customer,
    loading,
    error,
    fetchCustomer,
    updateCustomer,
    deleteCustomer,
    clearError
  }
}