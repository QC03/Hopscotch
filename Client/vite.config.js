import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __VITE_SERVER_URL__: JSON.stringify(process.env.VITE_SERVER_URL || 'http://localhost:3000'),
  },
})
