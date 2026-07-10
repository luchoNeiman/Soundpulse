import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MusicalItem } from '../models/MusicalItem';
import { fetchItunesSongs } from '../services/itunesApi';

export const useMusicStore = defineStore('music', () => {
    // Acá guardo la lista musical que uso en Home y Admin.
    const musicList = ref<MusicalItem[]>([]);
    // Acá controlo el estado de carga para mostrar feedback en la UI.
    const isLoading = ref(false);
    // Acá recuerdo el último término buscado para evitar llamadas repetidas.
    const activeSearchTerm = ref('');

    const fetchMusicFromAPI = async (searchTerm = 'pop') => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        // Acá corto la ejecución si ya cargué exactamente el mismo término.
        if (musicList.value.length > 0 && activeSearchTerm.value === normalizedSearchTerm) return;

        isLoading.value = true;
        try {
            // Acá uso el servicio de catalogo (proxy + fallback local).
            const data = await fetchItunesSongs(normalizedSearchTerm, 24);

            if (!Array.isArray(data.results)) {
                throw new Error('Respuesta invalida de iTunes: falta results[]');
            }

            // Acá transformo la respuesta de iTunes al formato de mi clase MusicalItem.
            musicList.value = data.results.map((apiItem: any) => {
                return new MusicalItem({
                    id: apiItem.trackId,
                    title: apiItem.trackName,
                    artist: apiItem.artistName,
                    genre: apiItem.primaryGenreName,
                    // Acá mejoro la portada para pedir una versión más grande.
                    image: apiItem.artworkUrl100.replace('100x100bb', '600x600bb'),
                    type: 'song',
                    audioPreview: apiItem.previewUrl
                });
            });
            activeSearchTerm.value = normalizedSearchTerm;
            console.log(`Datos cargados para termino (${normalizedSearchTerm}):`, musicList.value);
        } catch (error) {
            console.error("Error al conectar con la API musical:", error);
        } finally {
            isLoading.value = false;
        }
    };

    // Acá actualizo un item puntual dentro de la lista en memoria.
    const updateItem = (updatedItem: MusicalItem) => {
        const index = musicList.value.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) musicList.value[index] = updatedItem;
    };

    // Acá elimino un item de la lista en memoria por su id.
    const deleteItem = (id: number) => {
        musicList.value = musicList.value.filter(item => item.id !== id);
    };

    return { musicList, isLoading, activeSearchTerm, fetchMusicFromAPI, updateItem, deleteItem };
});