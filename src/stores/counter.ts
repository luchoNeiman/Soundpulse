import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // Acá guardo el valor base del contador.
  const count = ref(0)
  // Acá calculo automáticamente el doble cada vez que cambia count.
  const doubleCount = computed(() => count.value * 2)

  // Con esta función incremento el contador en 1.
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
