import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Acá defino mis rutas para que cada URL cargue una vista concreta.
const router = createRouter({
  // Uso history del navegador para tener URLs limpias sin hash (#).
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/admin',
      name: 'admin',
      // Importo esta vista de forma diferida para optimizar carga inicial.
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/research',
      name: 'research',
      // Importo esta vista de forma diferida para optimizar carga inicial.
      component: () => import('../views/ResearchView.vue')
    }
  ],
})

export default router
