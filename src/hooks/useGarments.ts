import { useState, useEffect } from 'react'
import { garmentService } from '../services/garments.service'
import type { GarmentSearchFilters, GarmentListResponse } from '../services/garments.service'
import type { 
  Garment, 
  GarmentInsert, 
  GarmentUpdate,
  GarmentCategory,
  GarmentCategoryInsert,
  MemberGarment,
  MemberGarmentInsert,
  MemberGarmentUpdate,
  MemberSize,
  MemberSizeInsert,
  MemberSizeUpdate
} from '../types/database.types'

export interface UseGarmentsOptions {
  page?: number
  limit?: number
  filters?: GarmentSearchFilters
  autoFetch?: boolean
}

export interface UseGarmentsReturn {
  garments: (Garment & { category: GarmentCategory })[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  fetchGarments: () => Promise<void>
  createGarment: (data: GarmentInsert) => Promise<Garment>
  updateGarment: (id: string, data: GarmentUpdate) => Promise<Garment>
  setPage: (page: number) => void
  setFilters: (filters: GarmentSearchFilters) => void
  clearError: () => void
}

export function useGarments(options: UseGarmentsOptions = {}): UseGarmentsReturn {
  const {
    page: initialPage = 1,
    limit = 50,
    filters: initialFilters = {},
    autoFetch = true
  } = options

  const [garments, setGarments] = useState<(Garment & { category: GarmentCategory })[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(initialPage)
  const [filters, setFiltersState] = useState<GarmentSearchFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGarments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response: GarmentListResponse = await garmentService.getAll(page, limit, filters)
      setGarments(response.garments)
      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch garments'
      setError(errorMessage)
      console.error('Error fetching garments:', err)
    } finally {
      setLoading(false)
    }
  }

  const createGarment = async (data: GarmentInsert): Promise<Garment> => {
    setLoading(true)
    setError(null)
    
    try {
      const newGarment = await garmentService.create(data)
      // Refresh the list to include the new garment
      await fetchGarments()
      return newGarment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create garment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateGarment = async (id: string, data: GarmentUpdate): Promise<Garment> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedGarment = await garmentService.update(id, data)
      // Update the garment in the local state
      setGarments(prev => 
        prev.map(garment => 
          garment.id === id ? { ...garment, ...updatedGarment } : garment
        )
      )
      return updatedGarment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update garment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setPage = (newPage: number) => {
    setPageState(newPage)
  }

  const setFilters = (newFilters: GarmentSearchFilters) => {
    setFiltersState(newFilters)
    setPageState(1) // Reset to first page when filters change
  }

  const clearError = () => {
    setError(null)
  }

  // Auto-fetch on mount and when page or filters change
  useEffect(() => {
    if (autoFetch) {
      fetchGarments()
    }
  }, [page, filters, autoFetch])

  return {
    garments,
    total,
    page,
    limit,
    loading,
    error,
    fetchGarments,
    createGarment,
    updateGarment,
    setPage,
    setFilters,
    clearError
  }
}

export interface UseGarmentCategoriesReturn {
  categories: GarmentCategory[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: GarmentCategoryInsert) => Promise<GarmentCategory>
  clearError: () => void
}

export function useGarmentCategories(): UseGarmentCategoriesReturn {
  const [categories, setCategories] = useState<GarmentCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const fetchedCategories = await garmentService.getAllCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data: GarmentCategoryInsert): Promise<GarmentCategory> => {
    setLoading(true)
    setError(null)
    
    try {
      const newCategory = await garmentService.createCategory(data)
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.sort_order - b.sort_order))
      return newCategory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category'
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
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    clearError
  }
}

export interface UseMemberGarmentsOptions {
  memberId: string
  autoFetch?: boolean
}

export interface UseMemberGarmentsReturn {
  memberGarments: (MemberGarment & { garment: Garment })[]
  loading: boolean
  error: string | null
  fetchMemberGarments: () => Promise<void>
  assignGarment: (data: MemberGarmentInsert) => Promise<MemberGarment>
  updateAssignment: (id: string, data: MemberGarmentUpdate) => Promise<MemberGarment>
  removeGarment: (id: string) => Promise<void>
  clearError: () => void
}

export function useMemberGarments(options: UseMemberGarmentsOptions): UseMemberGarmentsReturn {
  const { memberId, autoFetch = true } = options
  
  const [memberGarments, setMemberGarments] = useState<(MemberGarment & { garment: Garment })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMemberGarments = async () => {
    if (!memberId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedGarments = await garmentService.getMemberGarments(memberId)
      setMemberGarments(fetchedGarments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch member garments'
      setError(errorMessage)
      console.error('Error fetching member garments:', err)
    } finally {
      setLoading(false)
    }
  }

  const assignGarment = async (data: MemberGarmentInsert): Promise<MemberGarment> => {
    setLoading(true)
    setError(null)
    
    try {
      const newAssignment = await garmentService.assignGarmentToMember(data)
      // Refresh to get the full data with garment details
      await fetchMemberGarments()
      return newAssignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign garment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAssignment = async (id: string, data: MemberGarmentUpdate): Promise<MemberGarment> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedAssignment = await garmentService.updateGarmentAssignment(id, data)
      // Update the assignment in local state
      setMemberGarments(prev => 
        prev.map(assignment => 
          assignment.id === id ? { ...assignment, ...updatedAssignment } : assignment
        )
      )
      return updatedAssignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeGarment = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await garmentService.removeGarmentFromMember(id)
      setMemberGarments(prev => prev.filter(assignment => assignment.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove garment'
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
    if (autoFetch && memberId) {
      fetchMemberGarments()
    }
  }, [memberId, autoFetch])

  return {
    memberGarments,
    loading,
    error,
    fetchMemberGarments,
    assignGarment,
    updateAssignment,
    removeGarment,
    clearError
  }
}

export interface UseMemberSizesOptions {
  memberId: string
  autoFetch?: boolean
}

export interface UseMemberSizesReturn {
  sizes: MemberSize[]
  latestSizes: Record<string, MemberSize>
  loading: boolean
  error: string | null
  fetchSizes: () => Promise<void>
  addSize: (data: MemberSizeInsert) => Promise<MemberSize>
  updateSize: (id: string, data: MemberSizeUpdate) => Promise<MemberSize>
  clearError: () => void
}

export function useMemberSizes(options: UseMemberSizesOptions): UseMemberSizesReturn {
  const { memberId, autoFetch = true } = options
  
  const [sizes, setSizes] = useState<MemberSize[]>([])
  const [latestSizes, setLatestSizes] = useState<Record<string, MemberSize>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSizes = async () => {
    if (!memberId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const [allSizes, latest] = await Promise.all([
        garmentService.getMemberSizes(memberId),
        garmentService.getLatestMemberSizes(memberId)
      ])
      
      setSizes(allSizes)
      setLatestSizes(latest)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch member sizes'
      setError(errorMessage)
      console.error('Error fetching member sizes:', err)
    } finally {
      setLoading(false)
    }
  }

  const addSize = async (data: MemberSizeInsert): Promise<MemberSize> => {
    setLoading(true)
    setError(null)
    
    try {
      const newSize = await garmentService.addMemberSize(data)
      // Refresh to get updated latest sizes
      await fetchSizes()
      return newSize
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add size'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSize = async (id: string, data: MemberSizeUpdate): Promise<MemberSize> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedSize = await garmentService.updateMemberSize(id, data)
      // Refresh to get updated latest sizes
      await fetchSizes()
      return updatedSize
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update size'
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
    if (autoFetch && memberId) {
      fetchSizes()
    }
  }, [memberId, autoFetch])

  return {
    sizes,
    latestSizes,
    loading,
    error,
    fetchSizes,
    addSize,
    updateSize,
    clearError
  }
}