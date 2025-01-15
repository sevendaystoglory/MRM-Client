import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { plugin as markdown } from 'vite-plugin-markdown'

export default defineConfig({
  plugins: [
    react(),
    markdown()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
