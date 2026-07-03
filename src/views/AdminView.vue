<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useUserStore, type AppUser } from '../stores/userStore';
import { useMusicStore } from '../stores/musicStores';
import { MusicalItem } from '../models/MusicalItem';

const enteredEmail = ref('');
const enteredPassword = ref('');
const errorMessage = ref('');
const infoMessage = ref('');

const activeTab = ref<'music' | 'users'>('music');
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const modalContentType = ref<'music' | 'user'>('music');
const selectedGenre = ref('all');
const selectedArtist = ref('all');
const albumQuery = ref('');
const apiGenreOptions = ref<string[]>([]);

const formData = reactive({
    id: 0,
    type: 'song',
    title: '',
    artist: '',
    genre: '',
    image: '',
    audioPreview: '',
});

const userFormData = reactive({
    id: 0,
    name: '',
    email: '',
    password: '',
    isSubscribed: false,
    isAdmin: false,
    registerDate: '',
    likedPostIDs: [] as number[],
});

const userStore = useUserStore();
const musicStore = useMusicStore();

const isSessionActive = computed(() => !!userStore.currentUser);
const accessGranted = computed(() => userStore.currentUser?.isAdmin === true);
const modalTitle = computed(() => {
    if (modalContentType.value === 'music') {
        return modalMode.value === 'create' ? 'Agregar Contenido' : 'Editar Contenido';
    }
    return modalMode.value === 'create' ? 'Agregar Usuario' : 'Editar Usuario';
});

const artistOptions = computed(() => {
    const allArtists = musicStore.musicList
        .map(item => item.artist)
        .filter((artist, index, arr) => !!artist && arr.indexOf(artist) === index)
        .sort((a, b) => a.localeCompare(b));

    return ['all', ...allArtists];
});

const filteredMusicList = computed(() => {
    const normalizedAlbumQuery = albumQuery.value.trim().toLowerCase();

    return musicStore.musicList.filter((item) => {
        const genreMatch = selectedGenre.value === 'all' || item.genre === selectedGenre.value;
        const artistMatch = selectedArtist.value === 'all' || item.artist === selectedArtist.value;
        const albumMatch = !normalizedAlbumQuery || item.title.toLowerCase().includes(normalizedAlbumQuery);

        return genreMatch && artistMatch && albumMatch;
    });
});

const loadGenreOptionsFromAPI = async () => {
    try {
        const response = await fetch('https://itunes.apple.com/search?term=music&entity=song&limit=200');
        const data = await response.json();

        const uniqueGenres = data.results
            .map((apiItem: any) => apiItem.primaryGenreName)
            .filter((genre: string, index: number, arr: string[]) => !!genre && arr.indexOf(genre) === index)
            .sort((a: string, b: string) => a.localeCompare(b));

        apiGenreOptions.value = uniqueGenres;
    } catch (error) {
        console.error('Error cargando listado de generos desde API:', error);
        apiGenreOptions.value = [];
    }
};

const clearFilters = () => {
    selectedGenre.value = 'all';
    selectedArtist.value = 'all';
    albumQuery.value = '';
};

const simulateRequest = (
    method: 'POST' | 'PUT' | 'DELETE',
    payload: unknown,
    url: '/api/content' | '/api/users' = '/api/content',
) => {
    const requestObject = {
        timestamp: new Date().toISOString(),
        method,
        url,
        body: payload,
        adminUser: userStore.currentUser?.email,
    };

    console.log(`[REQUEST SIMULADO] ${method} ${url}`, requestObject);
};

const resetMusicForm = () => {
    formData.id = 0;
    formData.type = 'song';
    formData.title = '';
    formData.artist = '';
    formData.genre = '';
    formData.image = '';
    formData.audioPreview = '';
};

const resetUserForm = () => {
    userFormData.id = 0;
    userFormData.name = '';
    userFormData.email = '';
    userFormData.password = '';
    userFormData.isSubscribed = false;
    userFormData.isAdmin = false;
    userFormData.registerDate = new Date().toISOString().slice(0, 10);
    userFormData.likedPostIDs = [];
};

const openCreateModal = (contentType: 'music' | 'user') => {
    modalContentType.value = contentType;
    modalMode.value = 'create';

    if (contentType === 'music') {
        resetMusicForm();
    } else {
        resetUserForm();
    }

    showModal.value = true;
};

const openEditMusicModal = (item: MusicalItem) => {
    modalContentType.value = 'music';
    modalMode.value = 'edit';

    formData.id = item.id;
    formData.type = item.type;
    formData.title = item.title;
    formData.artist = item.artist;
    formData.genre = item.genre;
    formData.image = item.image;
    formData.audioPreview = item.audioPreview;

    showModal.value = true;
};

const openEditUserModal = (user: AppUser) => {
    modalContentType.value = 'user';
    modalMode.value = 'edit';

    userFormData.id = user.id;
    userFormData.name = user.name;
    userFormData.email = user.email;
    userFormData.password = user.password;
    userFormData.isSubscribed = user.isSubscribed;
    userFormData.isAdmin = user.isAdmin;
    userFormData.registerDate = user.registerDate;
    userFormData.likedPostIDs = Array.isArray(user.likedPostIDs) ? [...user.likedPostIDs] : [];

    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveItem = () => {
    if (modalContentType.value === 'music') {
        if (modalMode.value === 'create') {
            const nextId = musicStore.musicList.length
                ? Math.max(...musicStore.musicList.map(item => item.id)) + 1
                : 1;
            const newItem = new MusicalItem({ ...formData, id: nextId });

            simulateRequest('POST', newItem, '/api/content');
            musicStore.musicList.push(newItem);
        } else {
            const updatedItem = new MusicalItem({ ...formData });

            simulateRequest('PUT', updatedItem, '/api/content');
            musicStore.updateItem(updatedItem);
        }

        closeModal();
        return;
    }

    if (modalMode.value === 'create') {
        const nextId = userStore.userList.length
            ? Math.max(...userStore.userList.map(user => user.id)) + 1
            : 1;
        const newUser: AppUser = {
            ...userFormData,
            id: nextId,
            likedPostIDs: Array.isArray(userFormData.likedPostIDs) ? userFormData.likedPostIDs : [],
        };

        simulateRequest('POST', newUser, '/api/users');
        userStore.addUser(newUser);
    } else {
        const updatedUser: AppUser = {
            ...userFormData,
            likedPostIDs: Array.isArray(userFormData.likedPostIDs) ? userFormData.likedPostIDs : [],
        };

        simulateRequest('PUT', updatedUser, '/api/users');
        userStore.updateUser(updatedUser);
    }

    closeModal();
};

const deleteContent = (id: number) => {
    const confirmDelete = confirm('Estas seguro de que deseas eliminar este contenido?');
    if (!confirmDelete) return;

    simulateRequest('DELETE', { id }, '/api/content');
    musicStore.deleteItem(id);
};

const deleteUserAccount = (id: number) => {
    if (userStore.currentUser && id === userStore.currentUser.id) {
        alert('No podes borrar tu propio usuario administrador.');
        return;
    }

    const confirmDelete = confirm('Estas seguro de que deseas eliminar este usuario?');
    if (!confirmDelete) return;

    simulateRequest('DELETE', { id }, '/api/users');
    userStore.deleteUser(id);
};

const tryLogin = async () => {
    errorMessage.value = '';
    infoMessage.value = '';

    try {
        await userStore.fetchUsers();
        const foundUser = userStore.userList.find(
            (user) => user.email === enteredEmail.value && user.password === enteredPassword.value,
        );

        if (!foundUser) {
            errorMessage.value = 'Credenciales incorrectas. Intentalo nuevamente.';
            return;
        }

        userStore.login(foundUser);
        infoMessage.value = foundUser.isAdmin
            ? 'Sesion iniciada como administrador.'
            : 'Sesion iniciada. Podes volver al Discovery Area para guardar tus favoritos.';

        if (foundUser.isAdmin) {
            activeTab.value = 'music';
            clearFilters();
            await Promise.all([
                musicStore.fetchMusicFromAPI('music'),
                userStore.fetchUsers(),
            ]);
        }
    } catch (error) {
        errorMessage.value = 'Ocurrio un error del sistema. Proba nuevamente mas tarde.';
    }
};

const logoutSession = () => {
    userStore.logout();
    showModal.value = false;
    activeTab.value = 'music';
    infoMessage.value = '';
    errorMessage.value = '';
    clearFilters();
};

onMounted(() => {
    loadGenreOptionsFromAPI();
});

watch(selectedGenre, async (newGenre) => {
    if (!accessGranted.value || activeTab.value !== 'music') return;

    const searchTerm = newGenre === 'all' ? 'music' : newGenre;
    await musicStore.fetchMusicFromAPI(searchTerm);
    selectedArtist.value = 'all';
    albumQuery.value = '';
});

watch(activeTab, async (newTab) => {
    if (newTab === 'users' && userStore.userList.length === 0 && !userStore.isUsersLoading) {
        await userStore.fetchUsers();
    }
});
</script>

<template>
    <main class="admin-container">
        <section v-if="!isSessionActive" class="login-box">
            <h2>Acceso Restringido</h2>
            <p>Ingrese sus credenciales de administrador para continuar.</p>

            <form @submit.prevent="tryLogin" class="form">
                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input id="email" v-model="enteredEmail" type="email" required>
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input id="password" v-model="enteredPassword" type="password" required>
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
            <button class="btn-logout" @click="logoutSession">Cerrar Sesion</button>
        </section>

        <section v-else class="dashboard">
            <header class="dashboard-header">
                <h2>Panel de Control - Soundpulse</h2>
                <div class="user-info">
                    <span>Admin: {{ userStore.currentUser?.name }}</span>
                    <button class="btn-logout" @click="logoutSession">Cerrar Sesion</button>
                </div>
            </header>

            <nav class="dashboard-tabs" aria-label="Panel tabs">
                <button type="button" class="tab-btn" :class="{ active: activeTab === 'music' }"
                    @click="activeTab = 'music'">
                    Music Library
                </button>
                <button type="button" class="tab-btn" :class="{ active: activeTab === 'users' }"
                    @click="activeTab = 'users'">
                    User Management
                </button>
            </nav>

            <section v-if="activeTab === 'music'" class="admin-content">
                <div class="table-toolbar">
                    <h3>Gestión de Biblioteca Musical</h3>
                    <button class="btn-add" @click="openCreateModal('music')">+ Agregar Contenido</button>
                </div>

                <section class="filters-panel">
                    <div class="filters-grid">
                        <label class="filter-field">
                            <span>Genero</span>
                            <select v-model="selectedGenre">
                                <option value="all">Todos los generos</option>
                                <option v-for="genreOption in apiGenreOptions" :key="genreOption" :value="genreOption">
                                    {{ genreOption }}
                                </option>
                            </select>
                        </label>

                        <label class="filter-field">
                            <span>Artista</span>
                            <select v-model="selectedArtist">
                                <option v-for="artist in artistOptions" :key="artist" :value="artist">
                                    {{ artist === 'all' ? 'Todos los artistas' : artist }}
                                </option>
                            </select>
                        </label>

                        <label class="filter-field filter-search">
                            <span>Album / Cancion</span>
                            <input v-model="albumQuery" type="text" placeholder="Buscar por titulo...">
                        </label>

                        <button type="button" class="btn-reset" @click="clearFilters">
                            Limpiar filtros
                        </button>
                    </div>

                    <p class="results-caption">
                        Mostrando {{ filteredMusicList.length }} de {{ musicStore.musicList.length }} resultados
                    </p>
                </section>

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
                        <tr v-for="item in filteredMusicList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td><span class="badge">{{ item.type.toUpperCase() }}</span></td>
                            <td>{{ item.title }}</td>
                            <td>{{ item.artist }}</td>
                            <td>{{ item.genre }}</td>
                            <td class="acciones">
                                <button class="btn-edit" @click="openEditMusicModal(item)">Editar</button>
                                <button class="btn-delete" @click="deleteContent(item.id)">Borrar</button>
                            </td>
                        </tr>
                        <tr v-if="filteredMusicList.length === 0">
                            <td colspan="6" class="text-center">No hay contenido en la biblioteca.</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section v-else class="admin-content">
                <div class="table-toolbar">
                    <h3>Gestión de Usuarios</h3>
                    <button class="btn-add" @click="openCreateModal('user')">+ Agregar Usuario</button>
                </div>

                <div v-if="userStore.isUsersLoading" class="loading-state">
                    Cargando usuarios...
                </div>

                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in userStore.userList" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span class="badge" :class="user.isAdmin ? 'role-admin' : 'role-user'">
                                    {{ user.isAdmin ? 'Admin' : 'User' }}
                                </span>
                            </td>
                            <td class="acciones">
                                <button class="btn-edit" @click="openEditUserModal(user)">Editar</button>
                                <button class="btn-delete" :disabled="userStore.currentUser?.id === user.id"
                                    @click="deleteUserAccount(user.id)">
                                    Borrar
                                </button>
                            </td>
                        </tr>
                        <tr v-if="userStore.userList.length === 0">
                            <td colspan="5" class="text-center">No hay usuarios cargados.</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <Transition name="modal-fade">
                <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
                    <div class="modal-box" role="dialog" aria-modal="true" :aria-label="modalTitle">
                        <header class="modal-header">
                            <h3>{{ modalTitle }}</h3>
                            <button class="btn-close" aria-label="Cerrar modal" @click="closeModal">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </header>

                        <form class="modal-form" @submit.prevent="saveItem">
                            <template v-if="modalContentType === 'music'">
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
                            </template>

                            <template v-else-if="modalContentType === 'user'">
                                <label class="field">
                                    <span>Name</span>
                                    <input v-model="userFormData.name" type="text" required>
                                </label>

                                <label class="field">
                                    <span>Email</span>
                                    <input v-model="userFormData.email" type="email" required>
                                </label>

                                <label class="field">
                                    <span>Password</span>
                                    <input v-model="userFormData.password" type="text" required>
                                </label>

                                <label class="field">
                                    <span>Register Date</span>
                                    <input v-model="userFormData.registerDate" type="date" required>
                                </label>

                                <label class="field checkbox-field">
                                    <span>Is Subscribed</span>
                                    <input v-model="userFormData.isSubscribed" type="checkbox">
                                </label>

                                <label class="field checkbox-field">
                                    <span>Is Admin</span>
                                    <input v-model="userFormData.isAdmin" type="checkbox">
                                </label>
                            </template>

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
    margin-bottom: 1rem;
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

.dashboard-tabs {
    display: inline-flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.35rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(10px);
}

.tab-btn {
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    background: transparent;
    color: #b9c0c7;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn:hover {
    color: #f4f8fb;
    background: rgba(255, 255, 255, 0.06);
}

.tab-btn.active {
    color: #00180d;
    background: #00ff88;
    box-shadow: 0 6px 16px rgba(0, 255, 136, 0.26);
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

.filters-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 10, 10, 0.45);
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
    align-items: end;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.36rem;
}

.filter-field span {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ba3ab;
}

.filter-field select,
.filter-field input {
    width: 100%;
    min-height: 42px;
    padding: 0.6rem 0.72rem;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.58);
    color: #f3f6f9;
}

.filter-field select:focus,
.filter-field input:focus {
    outline: none;
    border-color: rgba(0, 255, 136, 0.45);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.12);
}

.btn-reset {
    min-height: 42px;
    padding: 0.62rem 0.95rem;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.02);
    color: #e6ebef;
    font-weight: 600;
    cursor: pointer;
}

.results-caption {
    margin: 0.8rem 0 0;
    color: #9ba3ab;
    font-size: 0.88rem;
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

.role-admin {
    color: #00ff88;
    border-color: rgba(0, 255, 136, 0.45);
}

.role-user {
    color: #8fc9ff;
    border-color: rgba(143, 201, 255, 0.45);
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

.btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.checkbox-field {
    justify-content: space-between;
    gap: 0.6rem;
}

.checkbox-field input {
    width: 22px;
    height: 22px;
    accent-color: #00ff88;
    align-self: flex-start;
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

    .filters-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
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

    .dashboard-tabs {
        display: flex;
        width: 100%;
    }

    .tab-btn {
        flex: 1 1 0;
        text-align: center;
    }

    .filters-grid {
        grid-template-columns: 1fr;
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
