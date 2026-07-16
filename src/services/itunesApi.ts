type ItunesLikeSong = {
    trackId: number;
    trackName: string;
    artistName: string;
    primaryGenreName: string;
    artworkUrl100: string;
    previewUrl: string;
};

type ItunesSearchResponse = {
    results: ItunesLikeSong[];
};

const DEFAULT_TERM = 'music';
const LOCAL_DATA_URL = '/data/content.json';

const normalizeTerm = (term: string) => term.trim().toLowerCase() || DEFAULT_TERM;

const buildInternalSearchUrl = (term: string, limit: number) =>
    `/api/itunes/search?term=${encodeURIComponent(term)}&limit=${limit}`;

const mapLocalItemToItunesLike = (item: any): ItunesLikeSong => ({
    trackId: item.id,
    trackName: item.title || item.name,
    artistName: item.artist || 'Independent Artist',
    primaryGenreName: item.genre || 'Unspecified Genre',
    artworkUrl100: item.image || '/assets/img/default-image.jpg',
    previewUrl: item.audioPreview || '',
});

// Fallback local: mantiene la app funcional aunque falle iTunes/proxy.
const fetchLocalSongs = async (term: string, limit: number): Promise<ItunesSearchResponse> => {
    const response = await fetch(LOCAL_DATA_URL);
    if (!response.ok) {
        throw new Error(`Fallback local respondio HTTP ${response.status}`);
    }

    const rawItems = await response.json();
    const sourceItems = Array.isArray(rawItems) ? rawItems : [];

    const filteredItems = sourceItems
        .filter((item: any) => item?.type !== 'artista')
        .filter((item: any) => {
            if (term === DEFAULT_TERM) return true;

            const haystack = `${item?.title || ''} ${item?.name || ''} ${item?.artist || ''} ${item?.genre || ''}`
                .toLowerCase();
            return haystack.includes(term);
        })
        .slice(0, limit)
        .map(mapLocalItemToItunesLike);

    return { results: filteredItems };
};

const parseItunesPayload = async (response: Response): Promise<ItunesSearchResponse> => {
    if (!response.ok) {
        throw new Error(`itunes proxy respondio HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.results)) {
        throw new Error('Respuesta invalida desde itunes proxy');
    }

    return payload;
};

// Flujo principal: proxy interno /api/itunes/search; si falla, usamos datos locales.
export const fetchItunesSongs = async (term: string, limit: number): Promise<ItunesSearchResponse> => {
    const normalizedTerm = normalizeTerm(term);

    try {
        const proxyUrl = buildInternalSearchUrl(normalizedTerm, limit);
        return await parseItunesPayload(await fetch(proxyUrl));
    } catch (error) {
        console.warn(`No se pudo consultar iTunes por proxy. Uso fallback local. Detalle: ${String(error)}`);
        return fetchLocalSongs(normalizedTerm, limit);
    }
};
