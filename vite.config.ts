import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    assetsDir: "assets",
    emptyOutDir: true
  },
  server: {
    port: 3000,
    host: true
  }
})
