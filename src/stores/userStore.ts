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
    // Estado: guardo todo el objeto del usuario logueado (incluyendo sus likedPostIDs)
    const currentUser = ref<AppUser | null>(null);
    const userList = ref<AppUser[]>([]);
    const isUsersLoading = ref(false);

    // Acción: Iniciar sesión
    const login = (userData: AppUser) => {
        currentUser.value = userData;
    };

    // Acción: Cerrar sesión
    const logout = () => {
        currentUser.value = null;
    };

    const fetchUsers = async () => {
        isUsersLoading.value = true;
        try {
            const response = await fetch('/data/users.json');
            const users = await response.json();

            // Garantizo likedPostIDs para no romper la logica de favoritos.
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

    const addUser = (user: AppUser) => {
        userList.value.push({
            ...user,
            likedPostIDs: Array.isArray(user.likedPostIDs) ? user.likedPostIDs : [],
        });
    };

    const updateUser = (updatedUser: AppUser) => {
        const index = userList.value.findIndex(user => user.id === updatedUser.id);
        if (index === -1) return;

        userList.value[index] = {
            ...updatedUser,
            likedPostIDs: Array.isArray(updatedUser.likedPostIDs) ? updatedUser.likedPostIDs : [],
        };

        // Si se edita el mismo usuario logueado, sincronizo sesion actual.
        if (currentUser.value?.id === updatedUser.id) {
            currentUser.value = userList.value[index];
        }
    };

    const deleteUser = (id: number) => {
        userList.value = userList.value.filter(user => user.id !== id);
    };

    // Acción: Alternar el Me Gusta
    const toggleLike = (postId: number) => {
        if (!currentUser.value) {
            console.warn("Debes iniciar sesión (ej: Admin) para dar me gusta.");
            return;
        }

        const index = currentUser.value.likedPostIDs.indexOf(postId);

        if (index === -1) {
            // Si no está, lo agrego
            currentUser.value.likedPostIDs.push(postId);
            // Cumplo la consigna: "crear un objeto request y logearlo en la consola"
            console.log("REQUEST SIMULADO:", { action: 'ADD_LIKE', userId: currentUser.value.id, postId });
        } else {
            // Si ya está, lo quito
            currentUser.value.likedPostIDs.splice(index, 1);
            console.log("REQUEST SIMULADO:", { action: 'REMOVE_LIKE', userId: currentUser.value.id, postId });
        }
    };

    // Getter: Verifica si un disco está likeado por el usuario actual
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