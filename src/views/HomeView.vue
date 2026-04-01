<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MusicalItem } from '../models/MusicalItem';
import MusicalCard from '../components/MusicalCard.vue';

// Variable reactiva para almacenar los álbumes
const musicList = ref<MusicalItem[]>([]);

// Referencia al reproductor de audio para las previews
const previewPlayer = ref<HTMLAudioElement | null>(null);

// Función asíncrona para cargar datos desde el JSON
const loadData = async () => {
    try {
        const response = await fetch('/data/content.json');
        const data = await response.json();

        // Transformo el JSON en instancias de la clase MusicalItem
        musicList.value = data.map((item: any) =>
            new MusicalItem(item)
        );
    } catch (error) {
        console.error("Error cargando el archivo JSON:", error);
    }
};

// Esta función se ejecuta cuando una tarjeta emite el evento 'play'
const playPreview = (audioPath: string) => {
    if (previewPlayer.value) {
        // Pauso cualquier audio que estuviera sonando antes de cargar el nuevo
        previewPlayer.value.pause();

        // Asigno la nueva ruta local y reproduzco
        previewPlayer.value.src = audioPath;
        previewPlayer.value.play();

        console.log(`Reproduciendo vista previa desde: ${audioPath}`);
    }
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <main class="container">
        <header class="hero">
            <h1>Área de Descubrimiento</h1>
            <p>Explorá la biblioteca sonora y marcá tus favoritos.</p>
        </header>

        <section class="gallery">
            <MusicalCard v-for="music in musicList" :key="music.id" :music="music" @play="playPreview" />
        </section>

        <audio ref="previewPlayer"></audio>
    </main>
</template>

<style scoped>
.hero {
    text-align: center;
    padding: 3rem 1rem;
    color: white;
}

.hero h1 {
    font-size: 2.5rem;
    color: #00ff88;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2.5rem;
    padding: 2rem 4rem;
}
</style>