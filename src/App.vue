<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import LandingOverlay from './components/LandingOverlay.vue';
import { useUserStore } from './stores/userStore';

const audioPlayer = ref<HTMLAudioElement | null>(null);
const wasBackgroundPlayingBeforePreview = ref(false);
const userStore = useUserStore();

const reproducirMusica = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.2;
    audioPlayer.value.play();
  }
};

const handlePreviewPlaybackChange = (isPreviewPlaying: boolean) => {
  if (!audioPlayer.value) return;

  if (isPreviewPlaying) {
    // Guardo si la musica de fondo estaba sonando para reanudarla al finalizar el preview.
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
      <RouterLink to="/">Discovery</RouterLink>
      <RouterLink to="/admin">Backstage</RouterLink>
      <RouterLink to="/research">Vue.js Lab</RouterLink>

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
  justify-content: flex-start;
  gap: 0.8rem;
  flex-wrap: wrap;
  align-items: center;
}

.navegacion-principal a {
  text-decoration: none;
  color: #d8d8d8;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(42, 42, 42, 0.5);
  transition: transform 0.22s ease, border-color 0.22s ease, color 0.22s ease, background 0.22s ease;
}

.navegacion-principal a:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 255, 136, 0.55);
  color: #00ff88;
}

.navegacion-principal a.router-link-active {
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

@media (max-width: 640px) {
  .site-header {
    padding: 0.8rem;
  }

  .navegacion-principal {
    gap: 0.6rem;
  }

  .navegacion-principal a {
    padding: 0.55rem 0.95rem;
    font-size: 0.9rem;
  }

  .nav-user-status {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>