<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import type { MusicalItem } from '../models/MusicalItem';
import { useUserStore } from '../stores/userStore';

// Recibo el objeto musical como propiedad desde la vista padre
const props = defineProps<{
    music: MusicalItem
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
</script>

<template>
    <article class="music-card">
        <div class="image-container">
            <img :src="music.image" :alt="music.title" />

            <div class="interactive-overlay">
                <button v-if="music.audioPreview" @click="requestPlay" class="btn-play">
                    ▶ Play
                </button>
            </div>
        </div>

        <div class="info">
            <div class="text">
                <h3>{{ music.title }}</h3>
                <p>{{ music.summaryInfo }}</p>
            </div>

            <button @click="alternarMeGusta" class="btn-like" :class="{ activo: meGusta }">
                {{ meGusta ? '♥' : '♡' }}
            </button>
        </div>
    </article>
</template>

<style scoped>
.music-card {
    background: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
}

.music-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.2);
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
    background: rgba(0, 0, 0, 0.6);
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
    transform: scale(0.9);
    transition: transform 0.2s ease;
}

.btn-play:hover {
    transform: scale(1.1);
}

.info {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

.text h3 {
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
}

.text p {
    margin: 0;
    font-size: 0.85rem;
    color: #aaa;
}

.btn-like {
    background: none;
    border: none;
    color: #fff;
    font-size: 1.8rem;
    cursor: pointer;
    transition: color 0.3s ease, transform 0.2s ease;
}

.btn-like:hover {
    transform: scale(1.2);
}

.btn-like.activo {
    color: #ff0055;
    /* Color rojo/fucsia cuando está likeado */
}
</style>