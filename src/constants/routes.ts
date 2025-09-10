export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  
  // Main pages
  DASHBOARD: '/',
  
  // Customer management
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/:id',
  CUSTOMER_CREATE: '/customers/create',
  
  // Order management
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  ORDER_CREATE: '/orders/create',
  ORDER_MEMBER_ADD: '/orders/:id/members/add',
  
  // Settings
  SETTINGS: '/settings',
  ABOUT: '/about',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]