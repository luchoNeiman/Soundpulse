<script setup lang="ts">
// Recibo desde el padre el nombre de la pista que se mostrará en el mini reproductor.
const props = defineProps<{
    trackTitle: string
}>();

// Acá emito al componente padre el evento para simular reproducción.
const emit = defineEmits<{
    playTrack: [trackName: string]
}>();

const emitPlayTrack = () => {
    emit('playTrack', props.trackTitle);
};
</script>

<template>
    <div class="lab-player">
        <p class="track-label">Pista recibida desde el padre</p>
        <h4>{{ trackTitle }}</h4>

        <button type="button" class="play-btn" @click="emitPlayTrack">
            Reproducir pista desde el hijo
        </button>
    </div>
</template>

<style scoped>
.lab-player {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.34);
    padding: 0.85rem;
}

.track-label {
    margin: 0;
    color: #9aa4ad;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

h4 {
    margin: 0.4rem 0 0.8rem;
    color: #eaf0f4;
    font-size: 1rem;
}

.play-btn {
    width: 100%;
    border: none;
    border-radius: 10px;
    padding: 0.6rem 0.8rem;
    background: #00ff88;
    color: #02120a;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.play-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.22);
}
</style>
