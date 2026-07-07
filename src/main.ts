import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './styles.css'

// Acá creo la app principal de Vue usando mi componente raiz.
const app = createApp(App)

// Acá registro Pinia y el router para que estén disponibles en toda la app.
app.use(createPinia())
app.use(router)

// Finalmente monto la app en el contenedor #app del index.html.
app.mount('#app')
