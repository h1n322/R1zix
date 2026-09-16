/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.PROXY_API_URL || 'http://localhost:5266',
        changeOrigin: true,
        secure: false,
      },
      '/ai': {
        target: process.env.PROXY_AI_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ai/, '/api'),
      },
    },
  },
})
