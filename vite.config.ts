import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // Acá activo los plugins principales que usa mi proyecto Vue.
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    // Proxy de desarrollo: evita CORS al delegar la llamada externa al dev server.
    proxy: {
      '/api/itunes': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/itunes/, ''),
      },
    },
  },
  resolve: {
    alias: {
      // Acá defino "@" como alias para simplificar imports desde src.
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
