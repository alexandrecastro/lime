/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Type errors here are due to vite/vitest type conflicts but don't affect runtime
export default defineConfig({
  // @ts-expect-error - vite/vitest type conflict, works at runtime
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // In Docker, use 'backend:3000' (Docker service name)
        // For local dev outside Docker, use 'localhost:3000'
        // Can be overridden with VITE_BACKEND_URL environment variable
        target: process.env.VITE_BACKEND_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
})
