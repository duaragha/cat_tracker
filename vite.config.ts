import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.PORT ? parseInt(env.PORT) : 4173
  
  return {
    plugins: [react()],
    preview: {
      port: port,
      host: '0.0.0.0'
    },
    server: {
      port: 5173,
      host: '0.0.0.0'
    }
  }
})
