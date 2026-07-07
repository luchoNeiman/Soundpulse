<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import LabPlayer from '../components/LabPlayer.vue';

// Acá guardo el estado reactivo del slider de volumen.
const masterVolume = ref(72);

// Acá guardo el estado del switch para la demo de renderizado condicional.
const isAmpOn = ref(false);
const conditionalMode = ref<'if' | 'show'>('if');

// Acá guardo los campos del formulario para demostrar v-model.
const passName = ref('');
const passRole = ref('Artist');

// Acá guardo el estado de búsqueda para la demo de watch asincrónico.
const bandQuery = ref('');
const bandSearchStatus = ref<'idle' | 'loading' | 'done'>('idle');
const bandSearchResult = ref('');

// Acá guardo estado para la comunicación padre-hijo con props y emit.
const selectedTrack = ref('Neon Skyline');
const playbackMessage = ref('');

// Acá guardo la cola reactiva para el ejemplo de listas con animación.
const queueIdCounter = ref(4);
const queuedSongs = ref([
    { id: 1, title: 'Electric Avenue' },
    { id: 2, title: 'Midnight Runner' },
    { id: 3, title: 'Ocean Drive' },
]);

const randomSongPool = [
    'Silver Horizon',
    'Echo Pulse',
    'Crystal Night',
    'Velvet Synth',
    'Urban Starlight',
];

const demoBandCatalog = [
    'Daft Punk',
    'Arctic Monkeys',
    'Radiohead',
    'Muse',
    'Soda Stereo',
    'The Strokes',
    'Tame Impala',
    'Babasónicos',
    'Coldplay',
    'The Killers',
];

let bandSearchTimer: ReturnType<typeof setTimeout> | undefined;

// Acá calculo estilos dinámicos para que el visualizador responda al volumen.
const visualScale = computed(() => Math.max(masterVolume.value / 100, 0.08));
const visualWidth = computed(() => `${Math.max(masterVolume.value, 8)}%`);
const visualGlow = computed(() => 0.1 + (masterVolume.value / 100) * 0.55);

// Acá construyo la descripción del pase según el rol elegido.
const roleTagline = computed(() => {
    if (passRole.value === 'Artist') return 'Acceso principal al escenario';
    if (passRole.value === 'VIP Guest') return 'Acceso a lounge premium y backstage';
    return 'Acceso operativo y de producción';
});

const addRandomSong = () => {
    // Acá agrego una canción aleatoria a la cola para mostrar reactividad en listas.
    const randomIndex = Math.floor(Math.random() * randomSongPool.length);
    const randomTitle = randomSongPool[randomIndex] ?? 'Tema sorpresa';
    queuedSongs.value.push({
        id: queueIdCounter.value,
        title: randomTitle,
    });
    queueIdCounter.value += 1;
};

const removeQueuedSong = (songId: number) => {
    // Acá elimino una canción puntual por id.
    queuedSongs.value = queuedSongs.value.filter((song) => song.id !== songId);
};

const handlePlayTrack = (trackName: string) => {
    // Acá actualizo un mensaje reactivo cuando el hijo emite el evento de reproducción.
    playbackMessage.value = `Reproduciendo: ${trackName}`;
};

watch(bandQuery, (newQuery) => {
    // Acá limpio la búsqueda anterior para evitar resultados mezclados.
    if (bandSearchTimer) {
        clearTimeout(bandSearchTimer);
    }

    const normalizedQuery = newQuery.trim();
    if (!normalizedQuery) {
        bandSearchStatus.value = 'idle';
        bandSearchResult.value = '';
        return;
    }

    bandSearchStatus.value = 'loading';
    bandSearchResult.value = '';

    // Acá simulo una consulta asincrónica para mostrar efectos secundarios con watch.
    bandSearchTimer = setTimeout(() => {
        const lowerQuery = normalizedQuery.toLowerCase();
        const matchedBand = demoBandCatalog.find((band) =>
            band.toLowerCase().includes(lowerQuery),
        );

        bandSearchStatus.value = 'done';
        bandSearchResult.value = matchedBand
            ? `Resultado encontrado: ${matchedBand}`
            : `Sin resultados para "${normalizedQuery}"`;
    }, 950);
});

onBeforeUnmount(() => {
    // Acá libero el timer si salgo de la vista para evitar fugas de memoria.
    if (bandSearchTimer) {
        clearTimeout(bandSearchTimer);
    }
});
</script>

<template>
    <main class="research-container">
        <header class="intro">
            <h1>Laboratorio Interactivo de Vue.js</h1>
            <p>
                Recorrido práctico por seis conceptos fundamentales de Vue.
                Cada módulo incluye una demostración interactiva aplicada al contexto musical de Soundpulse.
            </p>
        </header>

        <section class="lab-grid">
            <article class="lab-card">
                <h2>1) Reactividad y Estado</h2>
                <p>
                    En Vue, <strong>ref</strong> y <strong>reactive</strong> crean estado reactivo.
                    Cuando el estado cambia, el DOM se actualiza al instante sin refrescos manuales.
                </p>

                <div class="control-group">
                    <label for="volume-range">Volumen maestro</label>
                    <input id="volume-range" v-model="masterVolume" type="range" min="0" max="100">
                </div>

                <div class="meter-output">{{ masterVolume }}%</div>

                <div class="wave-shell">
                    <div class="wave-bar" :style="{
                        width: visualWidth,
                        transform: `scaleY(${visualScale})`,
                        boxShadow: `0 0 20px rgba(0, 255, 136, ${visualGlow})`
                    }"></div>
                </div>
            </article>

            <article class="lab-card">
                <h2>2) Directivas y Renderizado Condicional</h2>
                <p>
                    <strong>v-if</strong> monta o destruye nodos del DOM.
                    <strong>v-show</strong> mantiene el nodo y solo alterna su visibilidad con CSS.
                </p>

                <div class="switch-row">
                    <button type="button" class="switch-btn" :class="{ active: isAmpOn }" @click="isAmpOn = !isAmpOn">
                        {{ isAmpOn ? 'Amplificador ENCENDIDO' : 'Amplificador APAGADO' }}
                    </button>

                    <label class="mode-select">
                        Modo de renderizado
                        <select v-model="conditionalMode">
                            <option value="if">v-if</option>
                            <option value="show">v-show</option>
                        </select>
                    </label>
                </div>

                <Transition name="amp-fade" mode="out-in">
                    <div v-if="conditionalMode === 'if'" key="if-mode" class="amp-stage">
                        <div v-if="isAmpOn" class="stage-light active-light"></div>
                    </div>
                    <div v-else key="show-mode" class="amp-stage">
                        <div v-show="isAmpOn" class="stage-light active-light"></div>
                    </div>
                </Transition>

                <p class="mode-caption">
                    Modo actual de demostración: <strong>{{ conditionalMode === 'if' ? 'v-if' : 'v-show' }}</strong>
                </p>
            </article>

            <article class="lab-card">
                <h2>3) Two-Way Data Binding (v-model)</h2>
                <p>
                    <strong>v-model</strong> sincroniza bidireccionalmente los inputs con el estado del componente,
                    permitiendo interfaces inmediatas y predecibles.
                </p>

                <form class="pass-form" @submit.prevent>
                    <label>
                        Nombre completo
                        <input v-model="passName" type="text" placeholder="Escribí el nombre del asistente...">
                    </label>

                    <label>
                        Rol
                        <select v-model="passRole">
                            <option>Artist</option>
                            <option>VIP Guest</option>
                            <option>Staff</option>
                        </select>
                    </label>
                </form>

                <div class="pass-preview">
                    <div class="pass-header">
                        <span class="pass-brand">SOUNDPULSE</span>
                        <span class="pass-type">PASE VIP BACKSTAGE</span>
                    </div>

                    <div class="pass-body">
                        <p class="pass-name">{{ passName || 'Tu nombre aquí' }}</p>
                        <p class="pass-role">{{ passRole }}</p>
                        <p class="pass-tagline">{{ roleTagline }}</p>
                    </div>
                </div>
            </article>

            <article class="lab-card">
                <h2>4) Watchers y Estado Asincrónico</h2>
                <p>
                    <strong>watch</strong> observa cambios en variables reactivas para ejecutar
                    efectos secundarios, por ejemplo disparar una búsqueda asincrónica.
                </p>

                <div class="control-group">
                    <label for="band-search">Buscar banda</label>
                    <input
                        id="band-search"
                        v-model="bandQuery"
                        type="text"
                        placeholder="Escribí una banda..."
                    >
                </div>

                <p v-if="bandSearchStatus === 'loading'" class="status-text">Buscando en la base de datos...</p>
                <p v-else-if="bandSearchStatus === 'done'" class="status-text success-text">{{ bandSearchResult }}</p>
                <p v-else class="status-text subtle-text">Esperando una consulta para iniciar la búsqueda.</p>
            </article>

            <article class="lab-card">
                <h2>5) Comunicación entre Componentes</h2>
                <p>
                    En Vue, los datos bajan con <strong>props</strong> y los eventos suben con
                    <strong>emit</strong>, respetando un flujo unidireccional de información.
                </p>

                <div class="control-group">
                    <label for="track-select">Pista para enviar al componente hijo</label>
                    <select id="track-select" v-model="selectedTrack" class="solid-select">
                        <option>Neon Skyline</option>
                        <option>Pulse of the Night</option>
                        <option>Afterglow Avenue</option>
                    </select>
                </div>

                <LabPlayer :track-title="selectedTrack" @play-track="handlePlayTrack" />

                <p v-if="playbackMessage" class="status-text success-text">{{ playbackMessage }}</p>
                <p v-else class="status-text subtle-text">Todavía no se reprodujo ninguna pista.</p>
            </article>

            <article class="lab-card">
                <h2>6) Renderizado de Listas (v-for y :key)</h2>
                <p>
                    <strong>v-for</strong> recorre arreglos para renderizar elementos.
                    El atributo <strong>:key</strong> ayuda al Virtual DOM a identificar cada nodo y actualizarlo de forma eficiente.
                </p>

                <div class="queue-actions">
                    <button type="button" class="switch-btn" @click="addRandomSong">
                        Agregar canción aleatoria
                    </button>
                </div>

                <TransitionGroup name="queue-list" tag="ul" class="queue-list">
                    <li v-for="song in queuedSongs" :key="song.id" class="queue-item">
                        <span>{{ song.title }}</span>
                        <button type="button" class="remove-btn" @click="removeQueuedSong(song.id)">
                            Quitar
                        </button>
                    </li>
                </TransitionGroup>
            </article>

        </section>
    </main>
</template>

<style scoped>
.research-container {
    width: min(1180px, 100%);
    margin: 0 auto;
    padding: 1.4rem 1rem 3rem;
    color: #f2f5f8;
}

.intro {
    text-align: center;
    margin-bottom: 1.3rem;
    padding: 2rem 1rem 1.4rem;
}

.intro h1 {
    margin: 0;
    color: #00ff88;
    font-size: clamp(1.9rem, 3.3vw, 2.8rem);
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.intro p {
    margin: 0.75rem auto 0;
    color: #b7bec6;
    max-width: 760px;
    line-height: 1.5;
}

.lab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.lab-card {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background:
        radial-gradient(circle at 20% -20%, rgba(0, 255, 136, 0.16), transparent 55%),
        rgba(18, 18, 18, 0.76);
    backdrop-filter: blur(10px);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24);
    padding: 1rem;
}

.lab-card h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #e9eef2;
}

.lab-card p {
    margin: 0.75rem 0;
    color: #b9c0c8;
    line-height: 1.45;
    font-size: 0.95rem;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.control-group label {
    font-size: 0.85rem;
    color: #99a3ac;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

input[type='range'] {
    accent-color: #00ff88;
}

.meter-output {
    margin: 0.75rem 0;
    font-size: clamp(1.9rem, 4.2vw, 2.7rem);
    font-weight: 800;
    color: #00ff88;
}

.wave-shell {
    height: 88px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    padding: 0.5rem;
}

.wave-bar {
    height: 22px;
    border-radius: 999px;
    background: linear-gradient(90deg, #00ff88, #8dffc6);
    transform-origin: left center;
    transition: width 0.12s linear, transform 0.12s linear, box-shadow 0.12s linear;
}

.switch-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    align-items: center;
}

.switch-btn {
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.03);
    color: #e8edf1;
    border-radius: 999px;
    padding: 0.55rem 1rem;
    cursor: pointer;
    font-weight: 700;
}

.switch-btn.active {
    background: rgba(0, 255, 136, 0.16);
    border-color: rgba(0, 255, 136, 0.46);
    color: #aaffd6;
}

.mode-select {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #9da7af;
    font-size: 0.88rem;
}

.mode-select select,
.solid-select,
.pass-form input,
.pass-form select {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.45);
    color: #eef2f6;
    padding: 0.5rem 0.65rem;
}

.amp-stage {
    margin-top: 0.8rem;
    min-height: 88px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.42);
    display: flex;
    justify-content: center;
    align-items: center;
}

.stage-light {
    width: 48px;
    height: 48px;
    border-radius: 999px;
}

.active-light {
    background: #00ff88;
    box-shadow: 0 0 16px rgba(0, 255, 136, 0.5), 0 0 44px rgba(0, 255, 136, 0.34);
}

.mode-caption {
    margin-top: 0.65rem;
    font-size: 0.9rem;
}

.amp-fade-enter-active,
.amp-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.amp-fade-enter-from,
.amp-fade-leave-to {
    opacity: 0;
    transform: scale(0.96);
}

.pass-form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.65rem;
}

.pass-form label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: #9fa8b1;
}

.pass-preview {
    margin-top: 0.9rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 255, 136, 0.34);
    background:
        linear-gradient(125deg, rgba(0, 255, 136, 0.11), rgba(255, 255, 255, 0.03)),
        rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.pass-header {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    background: rgba(0, 255, 136, 0.14);
    border-bottom: 1px solid rgba(0, 255, 136, 0.22);
}

.pass-brand {
    font-weight: 800;
    letter-spacing: 0.05em;
}

.pass-type {
    color: #09170f;
    background: #00ff88;
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    font-size: 0.68rem;
    font-weight: 800;
    white-space: nowrap;
}

.pass-body {
    padding: 0.75rem;
}

.pass-name {
    margin: 0;
    color: #eef2f5;
    font-size: 1.1rem;
    font-weight: 700;
    overflow-wrap: anywhere;
}

.pass-role {
    margin: 0.35rem 0 0;
    color: #9bffcb;
    font-size: 0.95rem;
}

.pass-tagline {
    margin: 0.45rem 0 0;
    font-size: 0.82rem;
    color: #9fa8b1;
}

.status-text {
    margin: 0.75rem 0 0;
    font-size: 0.9rem;
    color: #b9c2c9;
}

.success-text {
    color: #86ffc3;
}

.subtle-text {
    color: #98a2ac;
}

.queue-actions {
    margin-bottom: 0.6rem;
}

.queue-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.queue-item {
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.36);
    padding: 0.55rem 0.65rem;
    display: flex;
    justify-content: space-between;
    gap: 0.7rem;
    align-items: center;
}

.remove-btn {
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: rgba(255, 86, 86, 0.16);
    color: #ffd5d5;
    padding: 0.32rem 0.58rem;
    cursor: pointer;
}

.queue-list-enter-active,
.queue-list-leave-active {
    transition: all 0.24s ease;
}

.queue-list-enter-from,
.queue-list-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
}

.queue-list-move {
    transition: transform 0.24s ease;
}

@media (max-width: 1024px) {
    .lab-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .research-container {
        padding: 1rem 0.75rem 2.3rem;
    }

    .intro {
        padding: 1.4rem 0.5rem 1rem;
    }

    .pass-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>