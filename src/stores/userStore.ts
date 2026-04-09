import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    // Estado: guardo todo el objeto del usuario logueado (incluyendo sus likedPostIDs)
    const currentUser = ref<any>(null);

    // Acción: Iniciar sesión
    const login = (userData: any) => {
        currentUser.value = userData;
    };

    // Acción: Cerrar sesión
    const logout = () => {
        currentUser.value = null;
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

    return { currentUser, login, logout, toggleLike, isLiked };
});