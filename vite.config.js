import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 5101 is fixed for both `npm run dev` and `npm run preview`
// so the app is always at the same address.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { port: 5101, strictPort: true },
  preview: { port: 5101, strictPort: true },
})
