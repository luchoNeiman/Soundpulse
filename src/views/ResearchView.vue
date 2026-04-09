<script setup lang="ts">
// Lógica de la vista de investigación aquí
</script>

<template>
    <main class="research-container">
        <h1>Área de Investigación</h1>
        <p>Bienvenido a la sección de investigación.</p>
    </main>
</template>

<style scoped>
.research-container {
    text-align: center;
    width: min(1000px, 100%);
    margin: 0 auto;
    padding: 3rem 1rem;
    color: white;
    background: linear-gradient(180deg, rgba(30, 30, 30, 0.65) 0%, rgba(15, 15, 15, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.35);
}

.research-container h1 {
    margin-top: 0;
    color: #00ff88;
    text-shadow: 0 0 16px rgba(0, 255, 136, 0.2);
}

.research-container p {
    color: #bcc1c7;
}
</style>