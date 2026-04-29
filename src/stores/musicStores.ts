import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MusicalItem } from '../models/MusicalItem';

export const useMusicStore = defineStore('music', () => {
    const musicList = ref<MusicalItem[]>([]);
    const isLoading = ref(false);
    const activeSearchTerm = ref('');

    const fetchMusicFromAPI = async (searchTerm = 'pop') => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        // Evito llamados redundantes si ya tengo cargado ese mismo genero.
        if (musicList.value.length > 0 && activeSearchTerm.value === normalizedSearchTerm) return;

        isLoading.value = true;
        try {
            const response = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(normalizedSearchTerm)}&entity=song&limit=30`
            );
            const data = await response.json();

            // Mapeo la respuesta de iTunes a nuestra clase
            musicList.value = data.results.map((apiItem: any) => {
                return new MusicalItem({
                    id: apiItem.trackId,
                    title: apiItem.trackName,
                    artist: apiItem.artistName,
                    genre: apiItem.primaryGenreName,
                    // Truco que vi en internet: reemplazo 100x100 por 600x600 para tener la imagen en HD
                    image: apiItem.artworkUrl100.replace('100x100bb', '600x600bb'),
                    type: 'song',
                    audioPreview: apiItem.previewUrl
                });
            });
            activeSearchTerm.value = normalizedSearchTerm;
            console.log(`Datos cargados desde iTunes API (${normalizedSearchTerm}):`, musicList.value);
        } catch (error) {
            console.error("Error al conectar con la API musical:", error);
        } finally {
            isLoading.value = false;
        }
    };

    // Funciones para el CRUD en memoria que usará el AdminView
    const updateItem = (updatedItem: MusicalItem) => {
        const index = musicList.value.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) musicList.value[index] = updatedItem;
    };

    const deleteItem = (id: number) => {
        musicList.value = musicList.value.filter(item => item.id !== id);
    };

    return { musicList, isLoading, activeSearchTerm, fetchMusicFromAPI, updateItem, deleteItem };
});