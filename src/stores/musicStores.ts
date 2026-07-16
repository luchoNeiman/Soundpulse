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
    const toSafeString = (value: unknown, fallback = '') => {
        const normalized = String(value ?? '').trim();
        return normalized || fallback;
    };

    const fetchMusicFromAPI = async (searchTerm = 'pop', limit = 24) => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const normalizedLimit = Math.min(Math.max(Number(limit) || 24, 1), 200);

        // Acá corto la ejecución si ya cargué exactamente el mismo término.
        if (musicList.value.length > 0 && activeSearchTerm.value === normalizedSearchTerm) return;

        isLoading.value = true;
        try {
            // Acá uso el servicio de catalogo (proxy + fallback local).
            const data = await fetchItunesSongs(normalizedSearchTerm, normalizedLimit);

            if (!Array.isArray(data.results)) {
                throw new Error('Respuesta invalida de iTunes: falta results[]');
            }

            // Acá transformo la respuesta de iTunes al formato de mi clase MusicalItem.
            musicList.value = data.results.map((apiItem: any, index: number) => {
                const rawImage = toSafeString(apiItem.artworkUrl100, '/assets/img/default-image.jpg');
                const safeImage = rawImage.includes('100x100bb')
                    ? rawImage.replace('100x100bb', '600x600bb')
                    : rawImage;

                return new MusicalItem({
                    id: Number(apiItem.trackId ?? index + 1),
                    title: toSafeString(apiItem.trackName, 'Untitled Track'),
                    artist: toSafeString(apiItem.artistName, 'Unknown Artist'),
                    genre: toSafeString(apiItem.primaryGenreName, 'Unspecified Genre'),
                    // Acá mejoro la portada para pedir una versión más grande.
                    image: safeImage,
                    type: 'song',
                    audioPreview: toSafeString(apiItem.previewUrl)
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