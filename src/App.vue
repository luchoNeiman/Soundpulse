<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import LandingOverlay from './components/LandingOverlay.vue';

const audioPlayer = ref<HTMLAudioElement | null>(null);

const reproducirMusica = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.2;
    audioPlayer.value.play();
  }
};
</script>

<template>
  <LandingOverlay @iniciar="reproducirMusica" />

  <header>
    <nav class="navegacion-principal">
      <RouterLink to="/">Discovery</RouterLink>
      <RouterLink to="/admin">Backstage</RouterLink>
      <RouterLink to="/investigacion">Vue.js Lab</RouterLink>
    </nav>
  </header>

  <RouterView />

  <audio ref="audioPlayer" loop>
    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
  </audio>
</template>