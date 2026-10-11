/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const idNorm = id.replace(/\\/g, '/');
          if (idNorm.includes('/node_modules/')) {
            if (
              idNorm.includes('/firebase/') ||
              idNorm.includes('/@firebase/') ||
              idNorm.includes('/idb/')
            ) {
              return 'vendor-firebase';
            }
            if (
              idNorm.includes('/recharts/') ||
              idNorm.includes('/victory-vendor/') ||
              idNorm.includes('/d3-') ||
              idNorm.includes('/@reduxjs/') ||
              idNorm.includes('/redux/') ||
              idNorm.includes('/react-redux/') ||
              idNorm.includes('/reselect/') ||
              idNorm.includes('/immer/') ||
              idNorm.includes('/decimal.js-light/') ||
              idNorm.includes('/es-toolkit/') ||
              idNorm.includes('/internmap/') ||
              idNorm.includes('/eventemitter3/') ||
              idNorm.includes('/use-sync-external-store/') ||
              idNorm.includes('/react-is/') ||
              idNorm.includes('/tiny-invariant/') ||
              idNorm.includes('/clsx/')
            ) {
              return 'vendor-recharts';
            }
            if (
              idNorm.includes('/framer-motion/') ||
              idNorm.includes('/motion-dom/') ||
              idNorm.includes('/motion-utils/')
            ) {
              return 'vendor-framer-motion';
            }
            if (
              idNorm.includes('/lightweight-charts/') ||
              idNorm.includes('/fancy-canvas/')
            ) {
              return 'vendor-charts';
            }
            if (
              idNorm.includes('/react-icons/') ||
              idNorm.includes('/@iconify/')
            ) {
              return 'vendor-icons';
            }
            if (
              idNorm.includes('/react/') ||
              idNorm.includes('/react-dom/') ||
              idNorm.includes('/react-router/') ||
              idNorm.includes('/react-router-dom/') ||
              idNorm.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            return 'vendor-utils';
          }
        },
      },
    },
  },
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
