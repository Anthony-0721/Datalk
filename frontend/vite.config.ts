import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

const proxyTarget = process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8000"

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": proxyTarget,
    },
  },
})
