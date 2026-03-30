import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size limit — questionDB.json is ~1.6MB
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('questionDB')) return 'question-db'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    }
  },
  server: {
    // Proxy API calls to local AI server in dev
    proxy: {
      '/api/tutor': 'http://localhost:5001',
      '/api/progress': 'http://localhost:5002',
      '/api/tests': 'http://localhost:5002',
    }
  }
})
