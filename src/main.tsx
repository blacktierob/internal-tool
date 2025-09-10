import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { theme } from './theme'
import App from './App.tsx'
import { initSentry } from './utils/sentry'
import { initAnalytics } from './utils/analytics'

// Import Mantine styles
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

// Initialize monitoring and analytics
initSentry()
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>,
)
