import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Serve files from ../front-end as static public assets (so `/img/*.jpg` works)
export default defineConfig({
  plugins: [react()],
  publicDir: '../front-end'
})
