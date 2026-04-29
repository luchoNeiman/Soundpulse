<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMusicStore } from '../stores/musicStores';
import MusicalCard from '../components/MusicalCard.vue';

const musicStore = useMusicStore(); // Accedo al store de música
const previewPlayer = ref<HTMLAudioElement | null>(null); // Referencia al elemento de audio para reproducir previews
const activePreviewPath = ref('');
const isPreviewPlaying = ref(false);

const emit = defineEmits<{
    previewPlaybackChange: [isPlaying: boolean]
}>();

const handlePreviewToggle = (audioPath: string) => {
    if (previewPlayer.value) {
        const isSameTrack = activePreviewPath.value === audioPath;

        if (isSameTrack && isPreviewPlaying.value) {
            // Si es la misma pista y ya está sonando, pauso.
            previewPlayer.value.pause();
            isPreviewPlaying.value = false;
            emit('previewPlaybackChange', false);
            return;
        }

        // Si cambia la pista o estaba pausada, preparo y reproduzco.
        if (!isSameTrack) {
            previewPlayer.value.src = audioPath;
            activePreviewPath.value = audioPath;
        }
        previewPlayer.value.play();
        isPreviewPlaying.value = true;
        emit('previewPlaybackChange', true);

        console.log(`Preview activo: ${audioPath}`);
    }
};

onMounted(() => {
    musicStore.fetchMusicFromAPI(); // Al montar el componente, llamo a la función del store para cargar la música desde la API
});

</script>

<template>
    <main class="container">
        <header class="hero">
            <h1>Área de Descubrimiento</h1>
            <p>Explorá la biblioteca sonora y marcá tus favoritos.</p>
        </header>

        <div v-if="musicStore.isLoading" class="loading-state">
            <p>Cargando biblioteca musical...</p>
        </div>

        <section v-else class="gallery">
            <MusicalCard v-for="music in musicStore.musicList" :key="music.id" :music="music"
                :is-active-preview="activePreviewPath === music.audioPreview" :is-preview-playing="isPreviewPlaying"
                @play="handlePreviewToggle" />
        </section>

        <audio ref="previewPlayer" @ended="isPreviewPlaying = false; emit('previewPlaybackChange', false)"></audio>
    </main>
</template>

<style scoped>
.container {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 1.4rem 1rem 3rem;
}

.hero {
    text-align: center;
    padding: 2.5rem 1rem 2rem;
    color: white;
}

.hero h1 {
    margin: 0;
    font-size: clamp(2rem, 3.6vw, 3rem);
    color: #00ff88;
    text-shadow: 0 0 18px rgba(0, 255, 136, 0.22);
}

.hero p {
    margin: 0.8rem 0 0;
    color: #b0b5bb;
    font-size: 1.05rem;
}

.loading-state {
    text-align: center;
    padding: 3rem;
    color: #aaa;
    font-size: 1.2rem;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.6;
    }
}

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2.5rem;
    padding: 2rem 4rem;
}

@media (max-width: 768px) {
    .container {
        padding-top: 0.7rem;
    }

    .hero {
        padding-top: 1.8rem;
    }

    .gallery {
        gap: 1rem;
    }
}
</style>