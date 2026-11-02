// Vite config: Vue and Tailwind plugins, and the /api proxy to the backend.
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    // The browser calls /api/..., Vite forwards it to the backend. This avoids CORS problems.
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
