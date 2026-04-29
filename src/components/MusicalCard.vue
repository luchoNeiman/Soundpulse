<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import type { MusicalItem } from '../models/MusicalItem';
import { useUserStore } from '../stores/userStore';

// Recibo el objeto musical como propiedad desde la vista padre
const props = defineProps<{
    music: MusicalItem
    isPreviewPlaying: boolean
    isActivePreview: boolean
}>();

// Defino el evento que voy a emitir cuando el usuario le dé play
const emit = defineEmits(['play']);

// Instancio el store global
const userStore = useUserStore();

// Computed property: reacciona automáticamente si el ID está en el array del usuario
const meGusta = computed(() => userStore.isLiked(props.music.id));

const alternarMeGusta = () => {
    // Si no hay usuario logueado, le muestro una alerta al visitante
    if (!userStore.currentUser) {
        alert("Por favor, inicia sesión en el panel Admin para guardar tus favoritos.");
        return;
    }
    // Ejecuto la acción en el store
    userStore.toggleLike(props.music.id);
};

const requestPlay = () => {
    if (props.music.audioPreview) {
        emit('play', props.music.audioPreview);
    }
};

const previewIconClass = computed(() => {
    // Uso iconos de Bootstrap para reflejar el estado real del preview.
    if (props.isActivePreview && props.isPreviewPlaying) return 'bi bi-pause-fill';
    return 'bi bi-play-fill';
});

const previewButtonText = computed(() => {
    if (props.isActivePreview && props.isPreviewPlaying) return 'Pause';
    return 'Play';
});
</script>

<template>
    <article class="music-card">
        <div class="image-container">
            <img :src="music.image" :alt="music.title" />

            <div class="interactive-overlay">
                <button v-if="music.audioPreview" @click="requestPlay" class="btn-play">
                    <i :class="previewIconClass"></i>
                    <span>{{ previewButtonText }}</span>
                </button>
            </div>
        </div>

        <div class="info">
            <div class="text">
                <h3>{{ music.title }}</h3>
                <p>{{ music.summaryInfo }}</p>
            </div>

            <button @click="alternarMeGusta" class="btn-like" :class="{ activo: meGusta }"
                :aria-label="meGusta ? 'Remove from favorites' : 'Add to favorites'">
                <i :class="meGusta ? 'bi-heart-fill' : 'bi-heart'"></i>
            </button>
        </div>
    </article>
</template>

<style scoped>
.music-card {
    background: linear-gradient(180deg, rgba(39, 39, 39, 0.95) 0%, rgba(28, 28, 28, 0.95) 100%);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    display: flex;
    flex-direction: column;
}

.music-card:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 255, 136, 0.4);
    box-shadow: 0 18px 28px rgba(0, 0, 0, 0.32);
}

.image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.interactive-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 15%, rgba(0, 0, 0, 0.8) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-container:hover .interactive-overlay {
    opacity: 1;
}

.btn-play {
    background: #00ff88;
    color: black;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transform: scale(0.9);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-play i {
    font-size: 1rem;
}

.btn-play:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 24px rgba(0, 255, 136, 0.35);
}

.info {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.8rem;
    color: white;
}

.text {
    flex: 1 1 auto;
    min-width: 0;
}

.text h3 {
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
    overflow-wrap: anywhere;
}

.text p {
    margin: 0;
    font-size: 0.85rem;
    color: #aaa;
    overflow-wrap: anywhere;
}

.btn-like {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    width: 42px;
    height: 42px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.25s ease, background 0.25s ease;
}

.btn-like i {
    font-size: 1.25rem;
    color: #f0f0f0;
    transition: color 0.2s ease;
}

.btn-like:hover {
    transform: scale(1.12);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
}

.btn-like.activo {
    border-color: rgba(255, 68, 68, 0.45);
    background: rgba(255, 68, 68, 0.08);
}

.btn-like.activo i {
    color: #ff4444;
}
</style>