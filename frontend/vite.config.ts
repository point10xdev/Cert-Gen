import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // This rule already exists for the API
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // --- ADD THIS NEW RULE ---
      // This rule will proxy requests for the generated PDF files
      '/certificates': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})