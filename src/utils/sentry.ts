import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
const ENV = import.meta.env.VITE_ENV || 'development'

export const initSentry = () => {
  if (SENTRY_DSN && ENV === 'production') {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENV,
      tracesSampleRate: 0.1,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      beforeSend(event) {
        // Filter out non-critical errors in production
        if (ENV === 'production') {
          // Skip certain error types that are not actionable
          if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
            return null
          }
          if (event.message?.includes('Non-Error promise rejection captured')) {
            return null
          }
        }
        return event
      },
    })
  }
}

// Error boundary wrapper component
export const SentryErrorBoundary = Sentry.withErrorBoundary