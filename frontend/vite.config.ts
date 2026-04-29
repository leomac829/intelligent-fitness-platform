import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8888,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/covers': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/videos': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/exercises-gifs': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/exercises-images': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
