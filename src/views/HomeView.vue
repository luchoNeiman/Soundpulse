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

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.4rem;
    padding: 0.8rem 0.2rem 1rem;
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