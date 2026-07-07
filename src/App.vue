<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import LandingOverlay from './components/LandingOverlay.vue';
import { useUserStore } from './stores/userStore';

// Acá controlo el audio de fondo global de toda la app.
const audioPlayer = ref<HTMLAudioElement | null>(null);
// Acá guardo si el audio de fondo estaba activo antes de abrir un preview.
const wasBackgroundPlayingBeforePreview = ref(false);
// Acá manejo la apertura/cierre del menú hamburguesa.
const isMenuOpen = ref(false);
const userStore = useUserStore();

// Acá alterno el estado del menú móvil.
const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Acá cierro el menú móvil cuando elijo una sección.
const closeMobileMenu = () => {
  isMenuOpen.value = false;
};

// Acá arranco la música de fondo luego del overlay inicial.
const reproducirMusica = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.2;
    audioPlayer.value.play();
  }
};

// Acá pauso/reanudo el audio global según el estado de los previews de canciones.
const handlePreviewPlaybackChange = (isPreviewPlaying: boolean) => {
  if (!audioPlayer.value) return;

  if (isPreviewPlaying) {
    // Acá guardo si la música de fondo estaba sonando para reanudarla al finalizar el preview.
    wasBackgroundPlayingBeforePreview.value = !audioPlayer.value.paused;
    if (wasBackgroundPlayingBeforePreview.value) {
      audioPlayer.value.pause();
    }
    return;
  }

  if (wasBackgroundPlayingBeforePreview.value) {
    audioPlayer.value.play();
    wasBackgroundPlayingBeforePreview.value = false;
  }
};
</script>

<template>
  <LandingOverlay @iniciar="reproducirMusica" />

  <header class="site-header">
    <nav class="navegacion-principal">
      <button type="button" class="menu-toggle" :aria-expanded="isMenuOpen" aria-label="Toggle navigation menu"
        @click="toggleMobileMenu">
        <i :class="isMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
      </button>

      <div class="nav-links" :class="{ open: isMenuOpen }">
        <RouterLink to="/" @click="closeMobileMenu">Discovery</RouterLink>
        <RouterLink to="/admin" @click="closeMobileMenu">Backstage</RouterLink>
        <RouterLink to="/research" @click="closeMobileMenu">Vue.js Lab</RouterLink>

        <div v-if="userStore.currentUser" class="nav-user-status">
          <div class="profile-chip">
            <i class="bi bi-person-circle"></i>
            <span>{{ userStore.currentUser.name }}</span>
          </div>

          <div class="likes-indicator" aria-label="Favorite songs">
            <i class="bi bi-heart-fill"></i>
            <span class="likes-badge">{{ userStore.currentUser.likedPostIDs.length }}</span>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <RouterView v-slot="{ Component }">
    <component :is="Component" class="view-shell" @preview-playback-change="handlePreviewPlaybackChange" />
  </RouterView>

  <audio ref="audioPlayer" loop>
    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
  </audio>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 1rem;
  backdrop-filter: blur(10px);
  background: rgba(10, 10, 10, 0.65);
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.navegacion-principal {
  width: min(980px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(42, 42, 42, 0.55);
  color: #e9edf0;
  cursor: pointer;
}

.menu-toggle i {
  font-size: 1.2rem;
}

.nav-links {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.nav-links a {
  text-decoration: none;
  color: #d8d8d8;
  padding: 0.65rem 1.1rem;
  white-space: nowrap;
  text-align: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(42, 42, 42, 0.5);
  transition: transform 0.22s ease, border-color 0.22s ease, color 0.22s ease, background 0.22s ease;
}

.nav-links a:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 255, 136, 0.55);
  color: #00ff88;
}

.nav-links a.router-link-active {
  color: #03150c;
  background: #00ff88;
  border-color: #00ff88;
  box-shadow: 0 8px 22px rgba(0, 255, 136, 0.26);
}

.nav-user-status {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  color: #e6ebef;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.profile-chip i {
  font-size: 1.1rem;
  color: #00ff88;
}

.likes-indicator {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ff5568;
}

.likes-indicator i {
  font-size: 1rem;
}

.likes-badge {
  position: absolute;
  top: -6px;
  right: -7px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #00ff88;
  color: #00130a;
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  padding: 0 4px;
  box-shadow: 0 0 0 2px rgba(10, 10, 10, 0.9);
}

.view-shell {
  display: block;
}

@media (max-width: 1024px) {
  .site-header {
    padding: 0.8rem;
  }

  .navegacion-principal {
    justify-content: space-between;
  }

  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 0.7rem);
    left: 0;
    right: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0.55rem;
    padding: 0.8rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(16, 16, 16, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.34);
    z-index: 30;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    width: 100%;
    transform: none;
  }

  .nav-links a:hover {
    transform: none;
  }

  .nav-user-status {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
    padding-top: 0.3rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
}

@media (max-width: 420px) {
  .profile-chip {
    max-width: 80%;
    overflow: hidden;
  }

  .profile-chip span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>