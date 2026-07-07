import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface AppUser {
    id: number;
    name: string;
    password: string;
    email: string;
    isSubscribed: boolean;
    isAdmin: boolean;
    registerDate: string;
    likedPostIDs: number[];
}

export const useUserStore = defineStore('user', () => {
    // Acá guardo el usuario con sesión activa.
    const currentUser = ref<AppUser | null>(null);
    // Acá mantengo la lista completa de usuarios para el panel admin.
    const userList = ref<AppUser[]>([]);
    // Acá expongo un estado de carga para mejorar la experiencia visual.
    const isUsersLoading = ref(false);

    // Acá inicio sesión guardando el usuario en memoria global.
    const login = (userData: AppUser) => {
        currentUser.value = userData;
    };

    // Acá cierro sesión limpiando el usuario actual.
    const logout = () => {
        currentUser.value = null;
    };

    // Acá traigo usuarios desde el JSON para poblar el estado del admin.
    const fetchUsers = async () => {
        isUsersLoading.value = true;
        try {
            const response = await fetch('/data/users.json');
            const users = await response.json();

            // Acá normalizo likedPostIDs para que nunca falle la lógica de favoritos.
            userList.value = users.map((user: Partial<AppUser>) => ({
                id: Number(user.id ?? 0),
                name: user.name ?? '',
                password: user.password ?? '',
                email: user.email ?? '',
                isSubscribed: Boolean(user.isSubscribed),
                isAdmin: Boolean(user.isAdmin),
                registerDate: user.registerDate ?? '',
                likedPostIDs: Array.isArray(user.likedPostIDs) ? user.likedPostIDs : [],
            }));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            userList.value = [];
        } finally {
            isUsersLoading.value = false;
        }
    };

    // Acá agrego un nuevo usuario a la lista en memoria.
    const addUser = (user: AppUser) => {
        userList.value.push({
            ...user,
            likedPostIDs: Array.isArray(user.likedPostIDs) ? user.likedPostIDs : [],
        });
    };

    // Acá actualizo un usuario y sincronizo sesión si edito al actual.
    const updateUser = (updatedUser: AppUser) => {
        const index = userList.value.findIndex(user => user.id === updatedUser.id);
        if (index === -1) return;

        userList.value[index] = {
            ...updatedUser,
            likedPostIDs: Array.isArray(updatedUser.likedPostIDs) ? updatedUser.likedPostIDs : [],
        };

        // Acá sincronizo sesión cuando estoy editando al mismo usuario activo.
        if (currentUser.value?.id === updatedUser.id) {
            currentUser.value = userList.value[index];
        }
    };

    // Acá elimino un usuario por id.
    const deleteUser = (id: number) => {
        userList.value = userList.value.filter(user => user.id !== id);
    };

    // Acá alterno un "me gusta" sobre una canción para el usuario activo.
    const toggleLike = (postId: number) => {
        if (!currentUser.value) {
            console.warn("Debes iniciar sesión (ej: Admin) para dar me gusta.");
            return;
        }

        const index = currentUser.value.likedPostIDs.indexOf(postId);

        if (index === -1) {
            // Acá agrego el like porque todavía no existía.
            currentUser.value.likedPostIDs.push(postId);
            // Acá simulo un request para dejar trazabilidad de la acción.
            console.log("REQUEST SIMULADO:", { action: 'ADD_LIKE', userId: currentUser.value.id, postId });
        } else {
            // Acá quito el like porque ya estaba marcado.
            currentUser.value.likedPostIDs.splice(index, 1);
            console.log("REQUEST SIMULADO:", { action: 'REMOVE_LIKE', userId: currentUser.value.id, postId });
        }
    };

    // Acá verifico si un tema está marcado como favorito por el usuario actual.
    const isLiked = (postId: number) => {
        if (!currentUser.value) return false;
        return currentUser.value.likedPostIDs.includes(postId);
    };

    return {
        currentUser,
        userList,
        isUsersLoading,
        login,
        logout,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        toggleLike,
        isLiked,
    };
});