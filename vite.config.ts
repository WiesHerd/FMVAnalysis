import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@ant-design/icons', 'antd', '@headlessui/react', '@heroicons/react'],
          charts: ['recharts']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
