import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost'
    },
    cors: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    },
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  }
})
