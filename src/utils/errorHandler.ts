/**
 * Standardized error handling utility
 */
export const handleServiceError = (operation: string, error: unknown): never => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  console.error(`Error in ${operation}:`, error)
  throw new Error(`Failed to ${operation}: ${errorMessage}`)
}

/**
 * Safe error message extraction
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Async operation wrapper with error handling
 */
export const withErrorHandling = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    return handleServiceError(operation, error)
  }
}

/**
 * Supabase query error handler
 */
export const handleSupabaseError = (operation: string, error: any, data: any): any => {
  if (error) {
    throw new Error(`${operation} failed: ${error.message}`)
  }
  return data
}