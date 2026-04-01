<script setup lang="ts">
import { ref } from 'vue';

// Variables reactivas para el formulario y el estado de la vista
const emailIngresado = ref('');
const passwordIngresado = ref('');
const errorMensaje = ref('');
const accesoConcedido = ref(false);

// Función asincrónica para validar el login
const intentarLogin = async () => {
    // Limpio mensajes de error previos
    errorMensaje.value = '';

    try {
        // Consumo el JSON simulando una petición a un servidor
        const respuesta = await fetch('/data/usuarios.json');
        const usuarios = await respuesta.json();

        // Busco si existe un usuario con esas credenciales exactas
        const usuarioEncontrado = usuarios.find(
            (user: any) => user.email === emailIngresado.value && user.password === passwordIngresado.value
        );

        if (usuarioEncontrado) {
            // Verifico si tiene los permisos necesarios
            if (usuarioEncontrado.isAdmin) {
                accesoConcedido.value = true;
            } else {
                errorMensaje.value = 'Acceso denegado: Esta pantalla es de acceso restringido a administradores.';
            }
        } else {
            errorMensaje.value = 'Credenciales incorrectas. Por favor, intente nuevamente.';
        }
    } catch (error) {
        console.error("Error al consultar la base de usuarios:", error);
        errorMensaje.value = 'Ocurrió un error en el sistema. Intente más tarde.';
    }
};
</script>

<template>
    <main class="admin-container">
        <section v-if="!accesoConcedido" class="login-box">
            <h2>Acceso Restringido</h2>
            <p>Ingrese sus credenciales de administrador para continuar.</p>

            <form @submit.prevent="intentarLogin" class="formulario">
                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" v-model="emailIngresado" required>
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="passwordIngresado" required>
                </div>

                <button type="submit" class="btn-login">Ingresar al Backstage</button>

                <p v-if="errorMensaje" class="error-text">{{ errorMensaje }}</p>
            </form>
        </section>

        <section v-else class="dashboard">
            <h2>Panel de Control - Soundpulse</h2>
            <p>Bienvenido. Aquí próximamente implementaremos el ABM (Alta, Baja y Modificación) del contenido musical.
            </p>
        </section>
    </main>
</template>

<style scoped>
.admin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    color: white;
}

.login-box {
    background-color: #1e1e1e;
    padding: 2.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group input {
    padding: 0.8rem;
    border-radius: 6px;
    border: none;
    background-color: #2a2a2a;
    color: white;
}

.btn-login {
    padding: 1rem;
    background-color: #00ff88;
    color: black;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-login:hover {
    background-color: #00cc6a;
}

.error-text {
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 1rem;
}

.dashboard {
    width: 100%;
    padding: 2rem;
}
</style>