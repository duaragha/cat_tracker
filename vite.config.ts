import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: parseInt(process.env.PORT || '4173'),
    host: '0.0.0.0'
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: '0.0.0.0'
  }
})
