<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import { MusicalItem } from '../models/MusicalItem';

// Estado de sesión / login
const enteredEmail = ref('');
const enteredPassword = ref('');
const errorMessage = ref('');
const accessGranted = ref(false);

const userStore = useUserStore();

// Lista reactiva de contenido
const adminMusicList = ref<MusicalItem[]>([]); // es la lista de contenido que se muestra en el panel de control
const isContentLoading = ref(false); // indicador de carga para la sección de contenido

// Estado del modal Create / Edit
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create'); // ref<'create' | 'edit'>('create'); significa que modalMode solo puede ser 'create' o 'edit', y su valor inicial es 'create'

// Objeto reactivo que actúa como formulario (two-way binding con v-model)
const formData = reactive({
    id: 0,
    type: 'album',
    title: '',
    artist: '',
    genre: '',
    image: '',
    audioPreview: '',
});

// Título dinámico del modal según el modo
const modalTitle = computed(() =>
    modalMode.value === 'create' ? 'Agregar nuevo contenido' : 'Editar contenido'
);

// Login
const tryLogin = async () => {
    errorMessage.value = '';
    try {
        const response = await fetch('/data/users.json');
        const users = await response.json();
        const foundUser = users.find(
            (user: any) => user.email === enteredEmail.value && user.password === enteredPassword.value
        );
        if (foundUser) {
            if (foundUser.isAdmin) {
                accessGranted.value = true;
                userStore.login(foundUser);
                loadAdminContent();
            } else {
                errorMessage.value = 'Acceso denegado. No tienes permisos de administrador.';
            }
        } else {
            errorMessage.value = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        }
    } catch (error) {
        console.error('Error al consultar la base de usuarios:', error);
        errorMessage.value = 'Ocurrió un error en el sistema. Por favor, inténtalo de nuevo más tarde.';
    }
};

// Carga de contenido cuando ya estás logueado
const loadAdminContent = async () => {
    isContentLoading.value = true;
    try {
        const response = await fetch('/data/content.json');
        const data = await response.json();
        adminMusicList.value = data.map((item: any) => new MusicalItem(item));
    } catch (error) {
        console.error('Error cargando el contenido para el panel:', error);
    } finally {
        isContentLoading.value = false;
    }
};

// Simulador de requests a la API
const simulateRequest = (method: string, endpoint: string, payload: any) => {
    const requestObject = {
        timestamp: new Date().toISOString(),
        method,
        url: `/api/${endpoint}`,
        body: payload,
        adminUser: userStore.currentUser?.email,
    };
    console.log(
        `%c[SIMULATED REQUEST] ${method} /api/${endpoint}`,
        'color:#00ff88;font-weight:bold',
        requestObject
    );
};

// Helpers del modal
const resetForm = () => {
    formData.id = 0;
    formData.type = 'album';
    formData.title = '';
    formData.artist = '';
    formData.genre = '';
    formData.image = '';
    formData.audioPreview = '';
};

// Funciones para abrir el modal en modo Create o Edit, y para cerrarlo
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

const closeModal = () => { showModal.value = false; };

// CRUD: Create y Edit
const saveItem = () => {
    if (modalMode.value === 'create') {
        const newId = adminMusicList.value.length
            ? Math.max(...adminMusicList.value.map(i => i.id)) + 1
            : 1;
        const newItem = new MusicalItem({ ...formData, id: newId });
        simulateRequest('POST', 'content', newItem);
        adminMusicList.value.push(newItem);
    } else {
        const index = adminMusicList.value.findIndex(i => i.id === formData.id);
        if (index !== -1) {
            const updatedItem = new MusicalItem({ ...formData });
            simulateRequest('PUT', `content/${formData.id}`, updatedItem);
            adminMusicList.value.splice(index, 1, updatedItem);
        }
    }
    closeModal();
};

// CRUD: Delete
const deleteContent = (id: number) => {
    simulateRequest('DELETE', `content/${id}`, null);
    adminMusicList.value = adminMusicList.value.filter(item => item.id !== id);
};
</script>

<template>
    <main class="admin-container">

        <!-- LOGIN -->
        <section v-if="!accessGranted" class="login-box">
            <h2>Acceso Restringido</h2>
            <p>Ingrese sus credenciales de administrador para continuar.</p>

            <form @submit.prevent="tryLogin" class="login-form">
                <div class="field-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" v-model="enteredEmail" required />
                </div>

                <div class="field-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" v-model="enteredPassword" required />
                </div>

                <button type="submit" class="btn-login">Ingresar al Backstage</button>

                <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            </form>
        </section>

        <!-- DASHBOARD -->
        <section v-else class="dashboard">

            <div class="dashboard-header">
                <div class="header-left">
                    <i class="bi bi-sliders2 header-icon"></i>
                    <h2>Panel de Control</h2>
                </div>
                <div class="user-info">
                    <span>Admin: {{ userStore.currentUser?.name }}</span>
                    <button @click="userStore.logout(); accessGranted = false" class="btn-logout">
                        <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div class="admin-content">

                <div class="content-toolbar">
                    <h3><i class="bi bi-music-note-list"></i> Biblioteca Musical</h3>
                    <button @click="openCreateModal" class="btn-add">
                        <i class="bi bi-plus-lg"></i> Agregar contenido
                    </button>
                </div>

                <div v-if="isContentLoading" class="loading-state">
                    <i class="bi bi-vinyl-fill spin"></i>
                    <span>Cargando base de datos...</span>
                </div>

                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Título</th>
                            <th>Artista</th>
                            <th>Género</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <TransitionGroup tag="tbody" name="list">
                        <tr v-for="item in adminMusicList" :key="item.id" class="table-row">
                            <td>{{ item.id }}</td>
                            <td><span class="badge">{{ item.type.toUpperCase() }}</span></td>
                            <td>{{ item.title }}</td>
                            <td class="muted">{{ item.artist }}</td>
                            <td class="muted">{{ item.genre }}</td>
                            <td class="acciones">
                                <button @click="openEditModal(item)" class="btn-edit">
                                    <i class="bi bi-pencil-square"></i> Editar
                                </button>
                                <button @click="deleteContent(item.id)" class="btn-delete">
                                    <i class="bi bi-trash3"></i> Borrar
                                </button>
                            </td>
                        </tr>
                    </TransitionGroup>
                </table>

            </div>
        </section>

        <!-- MODAL Create / Edit -->
        <Transition name="modal">
            <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
                <div class="modal-box" role="dialog" aria-modal="true" :aria-label="modalTitle">

                    <div class="modal-header">
                        <h3>
                            <i :class="modalMode === 'create' ? 'bi bi-plus-circle' : 'bi bi-pencil-square'"></i>
                            {{ modalTitle }}
                        </h3>
                        <button class="btn-close-modal" @click="closeModal" aria-label="Cerrar">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <form @submit.prevent="saveItem" class="modal-form">

                        <!-- Vista previa en tiempo real (two-way data binding) -->
                        <div class="live-preview">
                            <img v-if="formData.image" :src="formData.image" :alt="formData.title"
                                class="preview-img" />
                            <div class="preview-placeholder" v-else>
                                <i class="bi bi-card-image"></i>
                            </div>
                            <div class="preview-text">
                                <strong>{{ formData.title || 'Título del contenido' }}</strong>
                                <span>{{ formData.artist || 'Artista' }} · {{ formData.genre || 'Género' }}</span>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="field-group">
                                <label for="f-type">Tipo</label>
                                <select id="f-type" v-model="formData.type">
                                    <option value="album">Album</option>
                                    <option value="artista">Artista</option>
                                    <option value="single">Single</option>
                                </select>
                            </div>

                            <div class="field-group">
                                <label for="f-title">Título / Nombre</label>
                                <input id="f-title" type="text" v-model="formData.title" required
                                    placeholder="Ej: Random Access Memories" />
                            </div>

                            <div class="field-group">
                                <label for="f-artist">Artista</label>
                                <input id="f-artist" type="text" v-model="formData.artist"
                                    placeholder="Ej: Daft Punk" />
                            </div>

                            <div class="field-group">
                                <label for="f-genre">Género</label>
                                <input id="f-genre" type="text" v-model="formData.genre" placeholder="Ej: Electronic" />
                            </div>

                            <div class="field-group full-width">
                                <label for="f-image">URL de imagen</label>
                                <input id="f-image" type="text" v-model="formData.image"
                                    placeholder="/assets/img/cover.jpg" />
                            </div>

                            <div class="field-group full-width">
                                <label for="f-audio">URL de audio preview</label>
                                <input id="f-audio" type="text" v-model="formData.audioPreview"
                                    placeholder="/assets/audio/preview.mp3" />
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn-cancel" @click="closeModal">
                                <i class="bi bi-x-circle"></i> Cancelar
                            </button>
                            <button type="submit" class="btn-save">
                                <i :class="modalMode === 'create' ? 'bi bi-plus-lg' : 'bi bi-check-lg'"></i>
                                {{ modalMode === 'create' ? 'Crear' : 'Guardar cambios' }}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </Transition>

    </main>
</template>

<style scoped>
/* Layout base */
.admin-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem 1rem 3rem;
    min-height: 80vh;
    color: white;
}

/* Login */
.login-box {
    background: linear-gradient(180deg, rgba(34, 34, 34, 0.95) 0%, rgba(23, 23, 23, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 2.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
    margin-top: 3rem;
}

.login-box h2 {
    margin-top: 0;
}

.login-box p {
    color: #9ba1a8;
    margin-bottom: 0;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.btn-login {
    padding: 1rem;
    background: #00ff88;
    color: black;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-login:hover {
    background: #00cc6a;
    transform: translateY(-2px);
}

.error-text {
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin: 0;
}

/* Shared field-group (login + modal) */
.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.field-group label {
    font-size: 0.8rem;
    color: #9ba1a8;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.field-group input,
.field-group select {
    padding: 0.75rem 0.9rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #1e1e1e;
    color: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-group input:focus,
.field-group select:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.18);
}

/* Dashboard */
.dashboard {
    width: min(1200px, 100%);
    padding: 2rem;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 1.2rem;
    margin-bottom: 2rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.header-icon {
    font-size: 1.6rem;
    color: #00ff88;
}

.dashboard-header h2 {
    margin: 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: #9ba1a8;
}

.btn-logout {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    padding: 0.45rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-logout:hover {
    transform: translateY(-2px);
    background: rgba(255, 68, 68, 0.1);
}

/* Toolbar */
.content-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.content-toolbar h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-add {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.2rem;
    background: #00ff88;
    color: #000;
    font-weight: 700;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-add:hover {
    background: #00cc6a;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 255, 136, 0.25);
}

/* Loading state */
.loading-state {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: #9ba1a8;
    padding: 1.5rem 0;
}

.spin {
    animation: spin 1.2s linear infinite;
    display: inline-block;
    font-size: 1.4rem;
    color: #00ff88;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Table */
.admin-table {
    width: 100%;
    border-collapse: collapse;
    background: #1a1a1a;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-table th {
    padding: 0.85rem 1rem;
    text-align: left;
    background: #111;
    color: #9ba1a8;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-table td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #232323;
}

.table-row {
    transition: background 0.2s ease;
}

.table-row:hover {
    background: rgba(0, 255, 136, 0.06);
}

.table-row:last-child td {
    border-bottom: none;
}

.muted {
    color: #9ba1a8;
    font-size: 0.9rem;
}

.badge {
    background: rgba(0, 255, 136, 0.12);
    color: #00ff88;
    border: 1px solid rgba(0, 255, 136, 0.3);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.btn-edit,
.btn-delete {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: transform 0.18s ease, opacity 0.18s ease;
}

.btn-edit {
    background: rgba(255, 170, 0, 0.12);
    color: #ffaa00;
    border: 1px solid rgba(255, 170, 0, 0.28);
}

.btn-delete {
    background: rgba(255, 68, 68, 0.10);
    color: #ff4444;
    border: 1px solid rgba(255, 68, 68, 0.28);
}

.btn-edit:hover,
.btn-delete:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

/* TransitionGroup list animation */
.list-enter-active,
.list-leave-active {
    transition: all 0.38s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateX(-18px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(18px);
}

.list-move {
    transition: transform 0.38s ease;
}

/* Modal backdrop */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 1rem;
}

/* Modal box */
.modal-box {
    background: linear-gradient(180deg, #1e1e1e 0%, #161616 100%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 14px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.6);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.4rem 1.6rem 1rem;
    border-bottom: 1px solid #252525;
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    color: #00ff88;
}

.btn-close-modal {
    background: none;
    border: none;
    color: #9ba1a8;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
}

.btn-close-modal:hover {
    color: white;
    background: rgba(255, 255, 255, 0.08);
}

/* Modal form */
.modal-form {
    padding: 1.4rem 1.6rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.live-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1rem;
    background: rgba(0, 255, 136, 0.05);
    border: 1px solid rgba(0, 255, 136, 0.2);
    border-radius: 10px;
}

.preview-img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
}

.preview-placeholder {
    width: 56px;
    height: 56px;
    background: #2a2a2a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.4rem;
    color: #555;
}

.preview-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    overflow: hidden;
}

.preview-text strong {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preview-text span {
    font-size: 0.8rem;
    color: #9ba1a8;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.full-width {
    grid-column: 1 / -1;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    padding-top: 0.4rem;
}

.btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1.2rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #9ba1a8;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
}

.btn-cancel:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
}

.btn-save {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1.5rem;
    background: #00ff88;
    color: #000;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
}

.btn-save:hover {
    background: #00cc6a;
    transform: translateY(-2px);
}

/* Modal Transition */
.modal-enter-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.modal-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from {
    opacity: 0;
    transform: scale(0.95);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* Responsive */
@media (max-width: 900px) {
    .dashboard {
        padding: 1.2rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
    }

    .admin-table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
