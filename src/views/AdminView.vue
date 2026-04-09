<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';

// Variables reactivas para el formulario y el estado de la vista
const enteredEmail = ref('');
const enteredPassword = ref('');
const errorMessage = ref('');
const accessGranted = ref(false);

const userStore = useUserStore();

//Función asíncrona para validar el login
const tryLogin = async () => {
    // Limpio los mensajes de error anteriores
    errorMessage.value = '';

    try {
        // Consumo el JSON simulando una consulta al servidor
        const response = await fetch('/data/users.json');
        const users = await response.json();

        // Busco un usuario que coincida exactamente con el email y la contraseña ingresados
        const foundUser = users.find(
            (user: any) => user.email === enteredEmail.value && user.password === enteredPassword.value
        );

        if (foundUser) {
            // Verifico si el usuario encontrado tiene el rol de administrador
            if (foundUser.isAdmin) {
                accessGranted.value = true;
                userStore.login(foundUser); // Guardo la sesión globalmente
            } else {
                errorMessage.value = 'Acceso denegado. No tienes permisos de administrador.';
            }
        } else {
            errorMessage.value = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        }
    } catch (error) {
        console.error("Error al consultar la base de usuarios:", error);
        errorMessage.value = 'Ocurrió un error en el sistema. Por favor, inténtalo de nuevo más tarde.';
    }
};
</script>

<template>
    <main class="admin-container">
        <section v-if="!accessGranted" class="login-box">
            <h2>Acceso Restringido</h2>
            <p>Ingrese sus credenciales de administrador para continuar.</p>

            <form @submit.prevent="tryLogin" class="form">
                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" v-model="enteredEmail" required>
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="enteredPassword" required>
                </div>

                <button type="submit" class="btn-login">Ingresar al Backstage</button>

                <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
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

.form {
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