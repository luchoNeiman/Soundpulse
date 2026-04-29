<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useMusicStore } from '../stores/musicStores';
import MusicalCard from '../components/MusicalCard.vue';

const musicStore = useMusicStore(); // Accedo al store de música
const previewPlayer = ref<HTMLAudioElement | null>(null); // Referencia al elemento de audio para reproducir previews
const activePreviewPath = ref('');
const isPreviewPlaying = ref(false);
const selectedGenre = ref('all');
const selectedArtist = ref('all');
const albumQuery = ref('');
const visibleCardsCount = ref(21);
const apiGenreOptions = ref<string[]>([]);

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

const artistOptions = computed(() => {
    const allArtists = musicStore.musicList
        .map(item => item.artist)
        .filter((artist, index, arr) => !!artist && arr.indexOf(artist) === index)
        .sort((a, b) => a.localeCompare(b));

    return ['all', ...allArtists];
});

const filteredMusicList = computed(() => {
    const normalizedAlbumQuery = albumQuery.value.trim().toLowerCase();

    return musicStore.musicList.filter((item) => {
        const genreMatch = selectedGenre.value === 'all' || item.genre === selectedGenre.value;
        const artistMatch = selectedArtist.value === 'all' || item.artist === selectedArtist.value;
        const albumMatch = !normalizedAlbumQuery
            || item.title.toLowerCase().includes(normalizedAlbumQuery);

        return genreMatch && artistMatch && albumMatch;
    });
});

const visibleMusicList = computed(() => filteredMusicList.value.slice(0, visibleCardsCount.value));

const canLoadMore = computed(() => visibleCardsCount.value < filteredMusicList.value.length);

const loadGenreOptionsFromAPI = async () => {
    try {
        // Consulto un set amplio para construir el catalogo real de generos devueltos por la API.
        const response = await fetch('https://itunes.apple.com/search?term=music&entity=song&limit=200');
        const data = await response.json();

        const uniqueGenres = data.results
            .map((apiItem: any) => apiItem.primaryGenreName)
            .filter((genre: string, index: number, arr: string[]) => !!genre && arr.indexOf(genre) === index)
            .sort((a: string, b: string) => a.localeCompare(b));

        apiGenreOptions.value = uniqueGenres;
    } catch (error) {
        console.error('Error cargando listado de generos desde API:', error);
        apiGenreOptions.value = [];
    }
};

const clearFilters = () => {
    selectedGenre.value = 'all';
    selectedArtist.value = 'all';
    albumQuery.value = '';
    visibleCardsCount.value = 21;
};

const loadMoreCards = () => {
    visibleCardsCount.value += 3;
};

onMounted(() => {
    loadGenreOptionsFromAPI();
    musicStore.fetchMusicFromAPI('music');
});

watch(selectedGenre, async (newGenre) => {
    // Actualizo la URL dinamica de la API segun genero elegido por usuario.
    const searchTerm = newGenre === 'all' ? 'music' : newGenre;
    await musicStore.fetchMusicFromAPI(searchTerm);
    selectedArtist.value = 'all';
    albumQuery.value = '';
    visibleCardsCount.value = 21;

    if (previewPlayer.value) {
        previewPlayer.value.pause();
    }
    activePreviewPath.value = '';
    isPreviewPlaying.value = false;
    emit('previewPlaybackChange', false);
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

        <section v-else class="filters-panel">
            <div class="filters-grid">
                <label class="filter-field">
                    <span>Genero</span>
                    <select v-model="selectedGenre">
                        <option value="all">Todos los generos</option>
                        <option v-for="genreOption in apiGenreOptions" :key="genreOption" :value="genreOption">
                            {{ genreOption }}
                        </option>
                    </select>
                </label>

                <label class="filter-field">
                    <span>Artista</span>
                    <select v-model="selectedArtist">
                        <option v-for="artist in artistOptions" :key="artist" :value="artist">
                            {{ artist === 'all' ? 'Todos los artistas' : artist }}
                        </option>
                    </select>
                </label>

                <label class="filter-field filter-search">
                    <span>Album / Cancion</span>
                    <input
                        v-model="albumQuery"
                        type="text"
                        placeholder="Buscar por titulo..."
                    >
                </label>

                <button type="button" class="btn-reset" @click="clearFilters">
                    Limpiar filtros
                </button>
            </div>

            <p class="results-caption">
                Mostrando {{ visibleMusicList.length }} de {{ filteredMusicList.length }} resultados
            </p>
        </section>

        <section v-if="!musicStore.isLoading" class="gallery">
            <MusicalCard v-for="music in visibleMusicList" :key="music.id" :music="music"
                :is-active-preview="activePreviewPath === music.audioPreview" :is-preview-playing="isPreviewPlaying"
                @play="handlePreviewToggle" />
        </section>

        <div v-if="!musicStore.isLoading && filteredMusicList.length === 0" class="empty-state">
            No encontramos coincidencias para esos filtros. Proba con otra combinacion.
        </div>

        <div v-if="!musicStore.isLoading && canLoadMore" class="load-more-wrapper">
            <button type="button" class="btn-load-more" @click="loadMoreCards">
                Cargar mas
            </button>
        </div>

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

.filters-panel {
    margin: 0 auto;
    width: min(1080px, 100%);
    padding: 1rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background:
        radial-gradient(circle at 12% -30%, rgba(0, 255, 136, 0.18), transparent 45%),
        rgba(22, 22, 22, 0.78);
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    align-items: end;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.filter-field span {
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #9ea6af;
}

.filter-field select,
.filter-field input {
    width: 100%;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(10, 10, 10, 0.65);
    color: #f2f5f7;
    padding: 0.72rem 0.78rem;
}

.filter-field select:focus,
.filter-field input:focus {
    outline: none;
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.15);
}

.filter-search {
    grid-column: span 1;
}

.btn-reset {
    width: 100%;
    border: 1px solid rgba(0, 255, 136, 0.4);
    background: rgba(0, 255, 136, 0.08);
    color: #8bfec5;
    padding: 0.72rem 0.9rem;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
}

.btn-reset:hover {
    background: rgba(0, 255, 136, 0.15);
    transform: translateY(-1px);
}

.results-caption {
    margin: 0.85rem 0 0;
    color: #aeb6be;
    font-size: 0.9rem;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    padding: 1.2rem 0.2rem 0;
}

.empty-state {
    margin-top: 1rem;
    padding: 1.2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(30, 30, 30, 0.75);
    color: #aeb4bb;
    text-align: center;
}

.load-more-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.btn-load-more {
    border: 1px solid rgba(0, 255, 136, 0.45);
    background: rgba(0, 255, 136, 0.12);
    color: #8bfec5;
    padding: 0.75rem 1.35rem;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-load-more:hover {
    transform: translateY(-2px);
    background: rgba(0, 255, 136, 0.2);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.2);
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
        padding-top: 1rem;
    }

    .filters-grid {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 560px) {
    .filters-grid {
        grid-template-columns: 1fr;
    }
}
</style>