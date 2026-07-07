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
  resolve: {
    alias: {
      // Acá defino "@" como alias para simplificar imports desde src.
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
