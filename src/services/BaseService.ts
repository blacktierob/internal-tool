import { supabase } from './supabase'
import { handleSupabaseError, handleServiceError } from '../utils/errorHandler'
import type { ActivityAction } from '../types/database.types'

export abstract class BaseService {
  /**
   * Execute a Supabase query with standardized error handling
   */
  protected async executeQuery<T>(
    operation: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn()
      return handleSupabaseError(operation, error, data)
    } catch (error) {
      return handleServiceError(operation, error)
    }
  }

  /**
   * Execute a Supabase query that returns count
   */
  protected async executeCountQuery(
    operation: string,
    queryFn: () => Promise<{ data: any; error: any; count: number | null }>
  ): Promise<{ data: any; count: number }> {
    try {
      const { data, error, count } = await queryFn()
      handleSupabaseError(operation, error, data)
      return { data: data || [], count: count || 0 }
    } catch (error) {
      return handleServiceError(operation, error)
    }
  }

  /**
   * Log activity for audit trail
   */
  protected async logActivity(
    action: ActivityAction,
    entity_type: string,
    entity_id: string | null,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Get current user from localStorage or auth context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: currentUser?.id,
          action,
          entity_type,
          entity_id,
          description,
          metadata: metadata || {}
        }])

      if (error) {
        console.error('Failed to log activity:', error)
        // Don't throw here - activity logging should not break the main flow
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  /**
   * Generate pagination info for lists
   */
  protected getPaginationInfo(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}