import { supabase } from './supabase'
import type { 
  Garment, 
  GarmentInsert, 
  GarmentUpdate,
  GarmentCategory,
  GarmentCategoryInsert,
  GarmentCategoryUpdate,
  MemberGarment,
  MemberGarmentInsert,
  MemberGarmentUpdate,
  MemberSize,
  MemberSizeInsert,
  MemberSizeUpdate,
  ActivityAction 
} from '../types/database.types'

export interface GarmentSearchFilters {
  search?: string
  category_id?: string
  active?: boolean
  color?: string
  material?: string
}

export interface GarmentListResponse {
  garments: (Garment & { category: GarmentCategory })[]
  total: number
  page: number
  limit: number
}

class GarmentService {
  
  // Garment Categories
  async getAllCategories(): Promise<GarmentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('garment_categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching garment categories:', error)
        throw new Error(`Failed to fetch garment categories: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('GarmentService.getAllCategories error:', error)
      throw error
    }
  }

  async createCategory(categoryData: GarmentCategoryInsert): Promise<GarmentCategory> {
    try {
      const { data, error } = await supabase
        .from('garment_categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) {
        console.error('Error creating garment category:', error)
        throw new Error(`Failed to create garment category: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'garment_category', 
        data.id, 
        `Created garment category: ${data.name}`,
        { categoryData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.createCategory error:', error)
      throw error
    }
  }

  // Garments
  async getAll(
    page = 1, 
    limit = 50, 
    filters?: GarmentSearchFilters
  ): Promise<GarmentListResponse> {
    try {
      let query = supabase
        .from('garments')
        .select(`
          *,
          category:garment_categories(*)
        `, { count: 'exact' })
        .order('sort_order', { ascending: true })

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%,` +
          `brand.ilike.%${filters.search}%,` +
          `sku.ilike.%${filters.search}%`
        )
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active)
      }

      if (filters?.color) {
        query = query.ilike('color', `%${filters.color}%`)
      }

      if (filters?.material) {
        query = query.ilike('material', `%${filters.material}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      query = query.range(from, from + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching garments:', error)
        throw new Error(`Failed to fetch garments: ${error.message}`)
      }

      await this.logActivity('view', 'garment_list', null, 'Viewed garment list', {
        filters,
        page,
        limit,
        total: count || 0
      })

      return {
        garments: data || [],
        total: count || 0,
        page,
        limit
      }
    } catch (error) {
      console.error('GarmentService.getAll error:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Garment & { category: GarmentCategory }> {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select(`
          *,
          category:garment_categories(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching garment:', error)
        throw new Error(`Failed to fetch garment: ${error.message}`)
      }

      if (!data) {
        throw new Error('Garment not found')
      }

      await this.logActivity('view', 'garment', id, `Viewed garment: ${data.name}`)

      return data
    } catch (error) {
      console.error('GarmentService.getById error:', error)
      throw error
    }
  }

  async getByCategory(categoryId: string): Promise<Garment[]> {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('category_id', categoryId)
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching garments by category:', error)
        throw new Error(`Failed to fetch garments by category: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('GarmentService.getByCategory error:', error)
      throw error
    }
  }

  async create(garmentData: GarmentInsert): Promise<Garment> {
    try {
      const { data, error } = await supabase
        .from('garments')
        .insert(garmentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating garment:', error)
        throw new Error(`Failed to create garment: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'garment', 
        data.id, 
        `Created garment: ${data.name}`,
        { garmentData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.create error:', error)
      throw error
    }
  }

  async update(id: string, garmentData: GarmentUpdate): Promise<Garment> {
    try {
      const { data, error } = await supabase
        .from('garments')
        .update(garmentData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating garment:', error)
        throw new Error(`Failed to update garment: ${error.message}`)
      }

      if (!data) {
        throw new Error('Garment not found')
      }

      await this.logActivity(
        'update', 
        'garment', 
        id, 
        `Updated garment: ${data.name}`,
        { updates: garmentData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.update error:', error)
      throw error
    }
  }

  // Member Garment Assignments
  async assignGarmentToMember(assignmentData: MemberGarmentInsert): Promise<MemberGarment> {
    try {
      const { data, error } = await supabase
        .from('member_garments')
        .insert(assignmentData)
        .select()
        .single()

      if (error) {
        console.error('Error assigning garment to member:', error)
        throw new Error(`Failed to assign garment to member: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'member_garment', 
        data.id, 
        `Assigned garment to member`,
        { assignmentData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.assignGarmentToMember error:', error)
      throw error
    }
  }

  async updateGarmentAssignment(id: string, assignmentData: MemberGarmentUpdate): Promise<MemberGarment> {
    try {
      const { data, error } = await supabase
        .from('member_garments')
        .update(assignmentData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating garment assignment:', error)
        throw new Error(`Failed to update garment assignment: ${error.message}`)
      }

      if (!data) {
        throw new Error('Garment assignment not found')
      }

      await this.logActivity(
        'update', 
        'member_garment', 
        id, 
        `Updated garment assignment`,
        { updates: assignmentData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.updateGarmentAssignment error:', error)
      throw error
    }
  }

  async removeGarmentFromMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('member_garments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error removing garment from member:', error)
        throw new Error(`Failed to remove garment from member: ${error.message}`)
      }

      await this.logActivity('delete', 'member_garment', id, `Removed garment from member`)
    } catch (error) {
      console.error('GarmentService.removeGarmentFromMember error:', error)
      throw error
    }
  }

  async getMemberGarments(memberId: string): Promise<(MemberGarment & { garment: Garment })[]> {
    try {
      const { data, error } = await supabase
        .from('member_garments')
        .select(`
          *,
          garment:garments(*)
        `)
        .eq('member_id', memberId)

      if (error) {
        console.error('Error fetching member garments:', error)
        throw new Error(`Failed to fetch member garments: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('GarmentService.getMemberGarments error:', error)
      throw error
    }
  }

  // Member Sizes
  async addMemberSize(sizeData: MemberSizeInsert): Promise<MemberSize> {
    try {
      const { data, error } = await supabase
        .from('member_sizes')
        .insert(sizeData)
        .select()
        .single()

      if (error) {
        console.error('Error adding member size:', error)
        throw new Error(`Failed to add member size: ${error.message}`)
      }

      await this.logActivity(
        'create', 
        'member_size', 
        data.id, 
        `Added size measurement: ${data.size_type}`,
        { sizeData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.addMemberSize error:', error)
      throw error
    }
  }

  async updateMemberSize(id: string, sizeData: MemberSizeUpdate): Promise<MemberSize> {
    try {
      const { data, error } = await supabase
        .from('member_sizes')
        .update(sizeData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating member size:', error)
        throw new Error(`Failed to update member size: ${error.message}`)
      }

      if (!data) {
        throw new Error('Member size not found')
      }

      await this.logActivity(
        'update', 
        'member_size', 
        id, 
        `Updated size measurement: ${data.size_type}`,
        { updates: sizeData }
      )

      return data
    } catch (error) {
      console.error('GarmentService.updateMemberSize error:', error)
      throw error
    }
  }

  async getMemberSizes(memberId: string): Promise<MemberSize[]> {
    try {
      const { data, error } = await supabase
        .from('member_sizes')
        .select('*')
        .eq('member_id', memberId)
        .order('measured_at', { ascending: false })

      if (error) {
        console.error('Error fetching member sizes:', error)
        throw new Error(`Failed to fetch member sizes: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('GarmentService.getMemberSizes error:', error)
      throw error
    }
  }

  async getLatestMemberSizes(memberId: string): Promise<Record<string, MemberSize>> {
    try {
      const sizes = await this.getMemberSizes(memberId)
      
      // Group by size_type and get the latest measurement for each
      const latestSizes: Record<string, MemberSize> = {}
      
      sizes.forEach(size => {
        if (!latestSizes[size.size_type] || 
            new Date(size.measured_at) > new Date(latestSizes[size.size_type].measured_at)) {
          latestSizes[size.size_type] = size
        }
      })

      return latestSizes
    } catch (error) {
      console.error('GarmentService.getLatestMemberSizes error:', error)
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

const garmentService = new GarmentService()

export { garmentService }
export default garmentService

// Re-export types for easier importing
export type { GarmentSearchFilters, GarmentListResponse }