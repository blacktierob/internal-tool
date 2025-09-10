import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
