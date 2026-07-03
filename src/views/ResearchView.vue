<script setup lang="ts">
import { computed, ref } from 'vue';

// Estado reactivo para el ejemplo de reactividad (slider de volumen).
const masterVolume = ref(72);

// Estado del switch para el ejemplo de renderizado condicional.
const isAmpOn = ref(false);
const conditionalMode = ref<'if' | 'show'>('if');

// Estados del formulario para demostrar el two-way data binding con v-model.
const passName = ref('');
const passRole = ref('Artist');

const visualScale = computed(() => Math.max(masterVolume.value / 100, 0.08));
const visualWidth = computed(() => `${Math.max(masterVolume.value, 8)}%`);
const visualGlow = computed(() => 0.1 + (masterVolume.value / 100) * 0.55);

const roleTagline = computed(() => {
    if (passRole.value === 'Artist') return 'Main stage performer access';
    if (passRole.value === 'VIP Guest') return 'Premium lounge and backstage access';
    return 'Operational and production access';
});
</script>

<template>
    <main class="research-container">
        <header class="intro">
            <h1>Vue.js Interactive Lab</h1>
            <p>
                A practical walkthrough of three core Vue concepts used in this project.
                Every panel below is fully interactive.
            </p>
        </header>

        <section class="lab-grid">
            <article class="lab-card">
                <h2>1) Reactivity and State</h2>
                <p>
                    In Vue, <strong>ref</strong> and <strong>reactive</strong> create reactive state.
                    When state changes, the DOM updates immediately without manual refresh logic.
                </p>

                <div class="control-group">
                    <label for="volume-range">Master Volume</label>
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
                <h2>2) Conditional Rendering</h2>
                <p>
                    <strong>v-if</strong> mounts/unmounts an element from the DOM.
                    <strong>v-show</strong> keeps it in the DOM and only toggles CSS display.
                </p>

                <div class="switch-row">
                    <button type="button" class="switch-btn" :class="{ active: isAmpOn }" @click="isAmpOn = !isAmpOn">
                        {{ isAmpOn ? 'Amplifier ON' : 'Amplifier OFF' }}
                    </button>

                    <label class="mode-select">
                        Render mode
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
                    Current demo mode: <strong>{{ conditionalMode === 'if' ? 'v-if' : 'v-show' }}</strong>
                </p>
            </article>

            <article class="lab-card">
                <h2>3) Two-Way Data Binding (v-model)</h2>
                <p>
                    <strong>v-model</strong> synchronizes input fields and component state in both directions,
                    making forms feel immediate and predictable.
                </p>

                <form class="pass-form" @submit.prevent>
                    <label>
                        Full Name
                        <input v-model="passName" type="text" placeholder="Type attendee name...">
                    </label>

                    <label>
                        Role
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
                        <span class="pass-type">VIP BACKSTAGE PASS</span>
                    </div>

                    <div class="pass-body">
                        <p class="pass-name">{{ passName || 'Your Name Here' }}</p>
                        <p class="pass-role">{{ passRole }}</p>
                        <p class="pass-tagline">{{ roleTagline }}</p>
                    </div>
                </div>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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