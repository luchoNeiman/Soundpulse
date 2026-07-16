# Soundpulse

Plataforma web musical desarrollada con Vue 3 + TypeScript + Vite.
El proyecto combina tres áreas principales:

- Discovery Area: exploración musical con filtros y previews.
- Backstage (Admin): panel de administración de contenido y usuarios.
- Vue.js Lab: laboratorio interactivo para demostrar conceptos clave de Vue.

## Stack técnico

- Framework: Vue 3 (Composition API).
- Lenguaje: TypeScript.
- Bundler/dev server: Vite.
- Estado global: Pinia.
- Enrutado: Vue Router.
- Deploy: Vercel.

## Estructura funcional del proyecto

- src/App.vue: layout principal, navegación, música global y coordinación con previews.
- src/router/index.ts: definición de rutas públicas (home, admin, research).
- src/stores/musicStores.ts: store de catálogo musical y transformación de respuesta API a modelo interno.
- src/stores/userStore.ts: store de sesión/usuarios y gestión de favoritos.
- src/services/itunesApi.ts: servicio central para consultar música vía proxy interno y fallback local.
- src/views/HomeView.vue: experiencia de descubrimiento musical.
- src/views/AdminView.vue: autenticación, CRUD de contenido y CRUD de usuarios.
- src/views/ResearchView.vue: demostraciones de reactividad y patrones de Vue.
- api/itunes/search.ts: función serverless que consulta iTunes del lado servidor.

## Flujo general de la web

## 1) Inicio y shell global

1. La app monta el layout global en App.vue.
2. Se muestra un overlay inicial y luego se habilita música de fondo global.
3. El header ofrece navegación entre Discovery, Backstage y Vue.js Lab.
4. Si hay sesión activa, el header también muestra usuario y contador de favoritos.

## 2) Discovery Area (Home)

1. Al montar HomeView, se cargan:
  - Catálogo inicial de canciones.
  - Catálogo de géneros para filtros.
2. El listado musical se obtiene desde el store de música.
3. Cada tarjeta permite reproducir preview de la canción.
4. Si se reproduce un preview, App.vue pausa la música de fondo para evitar solapamientos.
5. Filtros disponibles:
  - Género.
  - Artista.
  - Búsqueda por texto (álbum/canción).
6. La vista calcula resultados filtrados en tiempo real con propiedades computadas.
7. El botón Cargar más expande paginación local sin volver a consultar API.

## 3) Backstage (Admin)

1. El acceso inicia con formulario de credenciales.
2. Se validan usuarios contra data local de usuarios (users.json).
3. Si el usuario no es admin, solo se informa sesión iniciada.
4. Si el usuario es admin:
  - Se habilita panel con tabs de Música y Usuarios.
  - Se cargan datos para administración.
5. Operaciones de música:
  - Alta de contenido.
  - Edición de contenido.
  - Eliminación con confirmación.
6. Operaciones de usuarios:
  - Alta, edición y eliminación.
  - Se evita eliminar la cuenta admin activa.
7. Todas las operaciones registran request simulado en consola para trazabilidad.

## 4) Favoritos y sesión

1. El estado de sesión se mantiene en userStore.
2. Los likes por canción se guardan en likedPostIDs del usuario activo.
3. Al dar/quitar like, el store actualiza estado reactivo y emite logs simulados.
4. El contador del header se actualiza automáticamente por reactividad.

## 5) Vue.js Lab

La vista Research muestra casos prácticos de:

1. Reactividad con ref/computed.
2. Renderizado condicional con v-if y v-show.
3. Two-way data binding con v-model.
4. Watchers con comportamiento asincrónico.
5. Comunicación padre-hijo con props/emit.
6. Listas dinámicas y transiciones.

## Flujo de datos musicales (API + fallback)

## Arquitectura de acceso

1. Frontend consulta siempre endpoint interno: /api/itunes/search.
2. En desarrollo, Vite proxy reenvía /api/itunes a https://itunes.apple.com.
3. En producción, Vercel resuelve /api/itunes/search con función serverless.

## Resiliencia ante fallos

1. Si falla la consulta remota, el servicio activa fallback local con data/content.json.
2. Esto asegura continuidad funcional de filtros, listado y vista admin aun con incidentes externos.

## Géneros disponibles y estrategia de expansión

La lista de géneros no depende de una sola búsqueda genérica.
Ahora se construye combinando:

1. Un conjunto base de géneros curados (ej: Pop, Rock, Alternative Rock, Indie, Hip-Hop/Rap, R&B/Soul, Reggaeton, entre otros).
2. Géneros descubiertos dinámicamente desde múltiples búsquedas semilla en iTunes.

De esta forma, la UI recupera un catálogo de géneros más amplio y consistente en Home y Admin.

## Scripts

Instalar dependencias:

```sh
npm install
```

Ejecutar en desarrollo:

```sh
npm run dev
```

Compilar para producción:

```sh
npm run build
```

Vista previa de build:

```sh
npm run preview
```

## Notas de mantenimiento

1. Si se modifica el endpoint interno, mantener sincronizados:
  - src/services/itunesApi.ts
  - vite.config.ts
  - api/itunes/search.ts
2. Si se agregan nuevas vistas, registrar la ruta en src/router/index.ts.
3. Si se agregan nuevos campos de usuario o música, actualizar modelos, stores y formularios admin.
