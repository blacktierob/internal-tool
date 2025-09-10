import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'
const ENV = import.meta.env.VITE_ENV || 'development'

export const initAnalytics = () => {
  if (POSTHOG_KEY && ENV === 'production') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      // Disable in development
      loaded: (posthog) => {
        if (ENV === 'development') posthog.debug()
      }
    })
  }
}

// Analytics tracking functions
export const analytics = {
  // Page views
  pageView: (path: string) => {
    if (ENV === 'production') {
      posthog.capture('$pageview', {
        $current_url: path
      })
    }
  },

  // User authentication events
  login: (userId: string) => {
    if (ENV === 'production') {
      posthog.identify(userId)
      posthog.capture('user_logged_in')
    }
  },

  logout: () => {
    if (ENV === 'production') {
      posthog.capture('user_logged_out')
      posthog.reset()
    }
  },

  // Business events
  customerCreated: (customerId: string) => {
    if (ENV === 'production') {
      posthog.capture('customer_created', {
        customer_id: customerId
      })
    }
  },

  orderCreated: (orderId: string, orderType: string) => {
    if (ENV === 'production') {
      posthog.capture('order_created', {
        order_id: orderId,
        order_type: orderType
      })
    }
  },

  memberAdded: (orderId: string, memberCount: number) => {
    if (ENV === 'production') {
      posthog.capture('member_added_to_order', {
        order_id: orderId,
        total_members: memberCount
      })
    }
  },

  // Error tracking
  error: (errorMessage: string, errorType: string) => {
    if (ENV === 'production') {
      posthog.capture('error_occurred', {
        error_message: errorMessage,
        error_type: errorType
      })
    }
  },

  // Feature usage
  featureUsed: (feature: string, context?: Record<string, any>) => {
    if (ENV === 'production') {
      posthog.capture('feature_used', {
        feature_name: feature,
        ...context
      })
    }
  }
}

export default analytics