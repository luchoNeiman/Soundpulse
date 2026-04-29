<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useMusicStore } from '../stores/musicStores';
import { MusicalItem } from '../models/MusicalItem';

const enteredEmail = ref('');
const enteredPassword = ref('');
const errorMessage = ref('');
const infoMessage = ref('');
const accessGranted = ref(false);

const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');

// Este objeto reactivo permite demostrar el two-way data binding del formulario.
const formData = reactive({
    id: 0,
    type: 'song',
    title: '',
    artist: '',
    genre: '',
    image: '',
    audioPreview: '',
});

const userStore = useUserStore();
const musicStore = useMusicStore();

const isSessionActive = computed(() => !!userStore.currentUser);
const modalTitle = computed(() =>
    modalMode.value === 'create' ? 'Agregar Contenido' : 'Editar Contenido'
);

const tryLogin = async () => {
    errorMessage.value = '';
    infoMessage.value = '';

    try {
        const response = await fetch('/data/users.json');
        const users = await response.json();
        const foundUser = users.find(
            (user: any) => user.email === enteredEmail.value && user.password === enteredPassword.value
        );

        if (!foundUser) {
            errorMessage.value = 'Credenciales incorrectas. Intentalo nuevamente.';
            return;
        }

        // Guardo la sesion en Pinia para cualquier usuario valido (admin o no admin).
        userStore.login(foundUser);
        enteredPassword.value = '';

        if (foundUser.isAdmin) {
            accessGranted.value = true;
            infoMessage.value = 'Sesion iniciada como administrador.';
            await musicStore.fetchMusicFromAPI();
            return;
        }

        accessGranted.value = false;
        infoMessage.value = 'Sesion iniciada. Podes volver al Discovery Area para guardar tus favoritos.';
    } catch (error) {
        errorMessage.value = 'Ocurrio un error del sistema. Proba nuevamente mas tarde.';
    }
};

const logoutSession = () => {
    userStore.logout();
    accessGranted.value = false;
    showModal.value = false;
    infoMessage.value = '';
    errorMessage.value = '';
};

const simulateRequest = (method: 'POST' | 'PUT' | 'DELETE', payload: unknown) => {
    const requestObject = {
        timestamp: new Date().toISOString(),
        method,
        url: '/api/content',
        body: payload,
        adminUser: userStore.currentUser?.email,
    };

    // Esta salida replica la estructura de un request real para fines de testing.
    console.log(`[REQUEST SIMULADO] ${method} /api/content`, requestObject);
};

const resetForm = () => {
    formData.id = 0;
    formData.type = 'song';
    formData.title = '';
    formData.artist = '';
    formData.genre = '';
    formData.image = '';
    formData.audioPreview = '';
};

const openCreateModal = () => {
    resetForm();
    modalMode.value = 'create';
    showModal.value = true;
};

const openEditModal = (item: MusicalItem) => {
    formData.id = item.id;
    formData.type = item.type;
    formData.title = item.title;
    formData.artist = item.artist;
    formData.genre = item.genre;
    formData.image = item.image;
    formData.audioPreview = item.audioPreview;
    modalMode.value = 'edit';
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveItem = () => {
    if (modalMode.value === 'create') {
        const nextId = musicStore.musicList.length
            ? Math.max(...musicStore.musicList.map(item => item.id)) + 1
            : 1;
        const newItem = new MusicalItem({ ...formData, id: nextId });

        simulateRequest('POST', newItem);
        musicStore.musicList.push(newItem);
    } else {
        const updatedItem = new MusicalItem({ ...formData });

        simulateRequest('PUT', updatedItem);
        musicStore.updateItem(updatedItem);
    }

    closeModal();
};

const deleteContent = (id: number) => {
    const confirmDelete = confirm('Estas seguro de que deseas eliminar este contenido?');
    if (!confirmDelete) return;

    simulateRequest('DELETE', { id });
    musicStore.deleteItem(id);
};
</script>

<template>
    <main class="admin-container">
        <section v-if="!isSessionActive" class="login-box">
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
                <p v-if="infoMessage" class="success-text">{{ infoMessage }}</p>
            </form>
        </section>

        <section v-else-if="!accessGranted" class="session-box">
            <h2>Sesion iniciada</h2>
            <p class="session-message">
                {{ infoMessage || 'Podes volver al Discovery Area para guardar tus favoritos.' }}
            </p>
            <p class="session-user">Usuario activo: {{ userStore.currentUser?.name }}</p>
            <button @click="logoutSession" class="btn-logout">Cerrar Sesion</button>
        </section>

        <section v-else class="dashboard">
            <header class="dashboard-header">
                <h2>Panel de Control - Soundpulse</h2>
                <div class="user-info">
                    <span>Admin: {{ userStore.currentUser?.name }}</span>
                    <button @click="logoutSession" class="btn-logout">Cerrar Sesion</button>
                </div>
            </header>

            <section class="admin-content">
                <div class="table-toolbar">
                    <h3>Gestión de Biblioteca Musical</h3>
                    <button @click="openCreateModal" class="btn-add">+ Agregar Contenido</button>
                </div>

                <div v-if="musicStore.isLoading" class="loading-state">
                    Cargando base de datos desde la API...
                </div>

                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Título / Canción</th>
                            <th>Artista</th>
                            <th>Género</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in musicStore.musicList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td><span class="badge">{{ item.type.toUpperCase() }}</span></td>
                            <td>{{ item.title }}</td>
                            <td>{{ item.artist }}</td>
                            <td>{{ item.genre }}</td>
                            <td class="acciones">
                                <button @click="openEditModal(item)" class="btn-edit">Editar</button>
                                <button @click="deleteContent(item.id)" class="btn-delete">Borrar</button>
                            </td>
                        </tr>
                        <tr v-if="musicStore.musicList.length === 0">
                            <td colspan="6" class="text-center">No hay contenido en la biblioteca.</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <Transition name="modal-fade">
                <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
                    <div class="modal-box" role="dialog" aria-modal="true" :aria-label="modalTitle">
                        <header class="modal-header">
                            <h3>{{ modalTitle }}</h3>
                            <button class="btn-close" @click="closeModal" aria-label="Cerrar modal">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </header>

                        <form class="modal-form" @submit.prevent="saveItem">
                            <label class="field">
                                <span>Tipo</span>
                                <select v-model="formData.type" required>
                                    <option value="song">Song</option>
                                    <option value="album">Album</option>
                                </select>
                            </label>

                            <label class="field">
                                <span>Titulo</span>
                                <input v-model="formData.title" type="text" required>
                            </label>

                            <label class="field">
                                <span>Artista</span>
                                <input v-model="formData.artist" type="text" required>
                            </label>

                            <label class="field">
                                <span>Genero</span>
                                <input v-model="formData.genre" type="text" required>
                            </label>

                            <label class="field">
                                <span>Imagen URL</span>
                                <input v-model="formData.image" type="url" required>
                            </label>

                            <label class="field">
                                <span>Audio Preview URL</span>
                                <input v-model="formData.audioPreview" type="url" required>
                            </label>

                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
                                <button type="submit" class="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </section>
    </main>
</template>

<style scoped>
.admin-container {
    min-height: calc(100vh - 80px);
    width: min(1220px, 100%);
    margin: 0 auto;
    padding: 2.2rem 1rem 3rem;
    color: white;
}

.login-box,
.session-box {
    width: min(460px, 100%);
    margin: 0 auto;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(30, 30, 30, 0.7);
    backdrop-filter: blur(12px);
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
}

.login-box h2,
.session-box h2 {
    margin-top: 0;
    margin-bottom: 0.4rem;
    color: #00ff88;
}

.login-box p {
    margin: 0;
    color: #bcc4cc;
}

.session-message {
    margin: 0.8rem 0;
    color: #d2d7dc;
}

.session-user {
    margin: 0 0 1.2rem;
    color: #98a1aa;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-size: 0.92rem;
    color: #b9c0c7;
}

.input-group input {
    padding: 0.75rem 0.85rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: rgba(17, 17, 17, 0.85);
    color: white;
}

.input-group input:focus {
    outline: none;
    border-color: rgba(0, 255, 136, 0.45);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.12);
}

.btn-login,
.btn-add,
.btn-primary {
    padding: 0.75rem 1rem;
    background-color: #00ff88;
    color: #02100a;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-login:hover,
.btn-add:hover,
.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 255, 136, 0.25);
}

.error-text {
    color: #ff6060;
    font-size: 0.9rem;
    margin: 0.2rem 0 0;
}

.success-text {
    color: #00ff88;
    font-size: 0.92rem;
    margin: 0.2rem 0 0;
}

.dashboard {
    width: 100%;
    align-self: flex-start;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 1rem;
    margin-bottom: 1.3rem;
}

.dashboard-header h2 {
    margin: 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #ced4da;
}

.btn-logout {
    background: transparent;
    border: 1px solid #ff5656;
    color: #ff6666;
    padding: 0.52rem 0.95rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-logout:hover {
    background: #ff5656;
    color: white;
}

.admin-content {
    width: 100%;
    padding: 1.2rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(180deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.table-toolbar h3 {
    margin: 0;
    color: #ebeff2;
}

.loading-state {
    margin: 0.7rem 0 1rem;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 136, 0.2);
    background: rgba(0, 255, 136, 0.08);
    color: #88f7c2;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.6rem;
    background: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-table th,
.admin-table td {
    padding: 0.9rem 0.8rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.admin-table th {
    background-color: #262626;
    color: #00ff88;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.admin-table tbody tr {
    transition: background-color 0.2s ease;
}

.admin-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.04);
}

.badge {
    background: rgba(255, 255, 255, 0.05);
    color: #00ff88;
    padding: 0.3rem 0.55rem;
    border-radius: 12px;
    font-size: 0.76rem;
    font-weight: 700;
    border: 1px solid rgba(0, 255, 136, 0.45);
}

.acciones {
    display: flex;
    gap: 0.45rem;
}

.btn-edit,
.btn-delete {
    padding: 0.45rem 0.72rem;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 700;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.btn-edit:hover,
.btn-delete:hover {
    transform: translateY(-1px);
    opacity: 0.92;
}

.btn-edit {
    background: #f3a500;
    color: #181100;
}

.btn-delete {
    background: #ff4747;
    color: white;
}

.text-center {
    text-align: center;
    color: #a9b0b7;
    padding: 2rem !important;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.modal-box {
    width: min(560px, 100%);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(30, 30, 30, 0.82);
    backdrop-filter: blur(14px);
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
    overflow: hidden;
}

.modal-header {
    padding: 1rem 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
    margin: 0;
    color: #e8ecef;
}

.btn-close {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: #d9dde1;
    cursor: pointer;
}

.modal-form {
    padding: 1rem 1.1rem 1.1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.38rem;
}

.field span {
    font-size: 0.84rem;
    color: #b7bec5;
}

.field input,
.field select {
    width: 100%;
    padding: 0.68rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(12, 12, 12, 0.7);
    color: white;
}

.field input:focus,
.field select:focus {
    outline: none;
    border-color: rgba(0, 255, 136, 0.45);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.14);
}

.modal-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.35rem;
}

.btn-secondary {
    padding: 0.7rem 0.95rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: transparent;
    color: #d4d8dc;
    cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
    transition: transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
    transform: translateY(8px) scale(0.98);
}

@media (max-width: 900px) {
    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .table-toolbar {
        flex-direction: column;
        align-items: flex-start;
    }

    .admin-table {
        font-size: 0.92rem;
    }

    .acciones {
        flex-direction: column;
    }
}

@media (max-width: 640px) {
    .admin-container {
        padding: 1rem 0.75rem 2rem;
    }

    .modal-form {
        grid-template-columns: 1fr;
    }

    .admin-table th,
    .admin-table td {
        padding: 0.72rem 0.55rem;
    }
}
</style>
