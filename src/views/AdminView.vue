<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { MusicalItem } from '../models/MusicalItem';

// Variables reactivas para el formulario y el estado de la vista
const enteredEmail = ref('');
const enteredPassword = ref('');
const errorMessage = ref('');
const accessGranted = ref(false);

const userStore = useUserStore();

//  Variables para el CRUD
const adminMusicList = ref<MusicalItem[]>([]); // Acá se almacenará la lista de música que el admin podrá gestionar
const isContentLoading = ref(false); // Variable para controlar el estado de carga

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








// Cargar contenido para el admin
const loadAdminContent = async () => {
    isContentLoading.value = true;
    try {
        const response = await fetch('/data/content.json');
        const data = await response.json();
        adminMusicList.value = data.map((item: any) => new MusicalItem(item));
    } catch (error) {
        console.error("Error cargando el contenido para el panel:", error);
    } finally {
        isContentLoading.value = false;
    }
};

// Simulador de request y borrado
const simulateRequest = (method: string, endpoint: string, payload: any) => {
    const requestObject = {
        timestamp: new Date().toISOString(),
        method: method,
        url: `/api/${endpoint}`,
        body: payload,
        adminUser: userStore.currentUser?.email
    };
    console.log(`[REQUEST ENVIADO] ${method} /api/${endpoint}`, requestObject);
};

const deleteContent = (id: number) => {
    // Logueo el objeto request en la consola
    simulateRequest('DELETE', `content/${id}`, null);

    // Reflejo el cambio visualmente en el front-end filtrando el array
    adminMusicList.value = adminMusicList.value.filter(item => item.id !== id);

    alert("Contenido eliminado. Revisa la consola para ver el objeto request simulado.");
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
            <div class="dashboard-header">
                <h2>Panel de Control - Soundpulse</h2>
                <div class="user-info">
                    <span>Admin: {{ userStore.currentUser?.name }}</span>
                    <button @click="userStore.logout(); accessGranted = false" class="btn-logout">Cerrar Sesión</button>
                </div>
            </div>

            <div class="admin-content">
                <h3>Gestión de Biblioteca Musical</h3>

                <p v-if="isContentLoading">Cargando base de datos...</p>

                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Título / Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in adminMusicList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td><span class="badge">{{ item.type.toUpperCase() }}</span></td>
                            <td>{{ item.title }}</td>
                            <td class="acciones">
                                <button class="btn-edit">✏️ Editar</button>
                                <button @click="deleteContent(item.id)" class="btn-delete">🗑️ Borrar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</template>

<style scoped>
.admin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    min-height: 80vh;
    color: white;
}

.login-box {
    background: linear-gradient(180deg, rgba(34, 34, 34, 0.95) 0%, rgba(23, 23, 23, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 2.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
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
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: #2a2a2a;
    color: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
}

.btn-login {
    padding: 1rem;
    background-color: #00ff88;
    color: black;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-login:hover {
    background-color: #00cc6a;
    transform: translateY(-2px);
}

.error-text {
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 1rem;
}

.dashboard {
    width: min(1200px, 100%);
    padding: 2rem;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
}

.btn-logout {
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-logout:hover {
    transform: translateY(-2px);
    background-color: rgba(255, 68, 68, 0.12);
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-table th,
.admin-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #333;
}

.admin-table tbody tr {
    transition: background-color 0.2s ease;
}

.admin-table tbody tr:hover {
    background-color: rgba(0, 255, 136, 0.08);
}

.badge {
    background: #00ff88;
    color: black;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
}

.acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.btn-edit,
.btn-delete {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.btn-edit:hover,
.btn-delete:hover {
    transform: translateY(-2px);
    opacity: 0.92;
}

.btn-edit {
    background: #ffaa00;
    color: black;
}

.btn-delete {
    background: #ff4444;
    color: white;
}

@media (max-width: 900px) {
    .dashboard {
        padding: 1rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .admin-table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
}
</style>