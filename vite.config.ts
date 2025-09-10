import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin for production builds with source maps
    ...(process.env.NODE_ENV === 'production' && process.env.VITE_SENTRY_DSN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/**',
        }
      })
    ] : [])
  ],
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/notifications', '@mantine/modals'],
          supabase: ['@supabase/supabase-js'],
          icons: ['@tabler/icons-react']
        }
      }
    },
    // Enable gzip compression
    target: 'esnext',
    minify: 'esbuild',
    // Optimize for production
    sourcemap: false
  },
  // Optimize dev server
  server: {
    open: false,
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@mantine/core', '@supabase/supabase-js']
  }
})
