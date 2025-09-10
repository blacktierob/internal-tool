// Security utility functions for the Black Tie Menswear application

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate PIN format (4 digits only)
 */
export const validatePinFormat = (pin: string): boolean => {
  return /^\d{4}$/.test(pin)
}

/**
 * Validate phone number format (UK format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // UK phone number formats
  const ukPhoneRegex = /^(?:(?:\+44\s?|0)(?:\d{2}\s?\d{4}\s?\d{4}|\d{3}\s?\d{3}\s?\d{4}|\d{4}\s?\d{3}\s?\d{3}))$/
  return ukPhoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if we're running in a secure context (HTTPS in production)
 */
export const isSecureContext = (): boolean => {
  const isProduction = import.meta.env.VITE_ENV === 'production'
  const isHTTPS = window.location.protocol === 'https:'
  const isLocalhost = window.location.hostname === 'localhost'
  
  return !isProduction || isHTTPS || isLocalhost
}

/**
 * Content Security Policy headers (for reference in deployment)
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://app.posthog.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://app.posthog.com'],
  'font-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

/**
 * Session timeout configuration (in milliseconds)
 */
export const SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
  CHECK_INTERVAL: 60 * 1000 // Check every minute
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5, // Max login attempts
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes window
  API_REQUESTS: 100, // Max API requests per window
  API_WINDOW: 60 * 1000 // 1 minute window
}