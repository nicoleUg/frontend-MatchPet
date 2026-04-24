import { auth } from '../firebase.js';

/**
 * Verifica si el usuario está autenticado.
 * Si no hay sesión, opcionalmente redirige y rechaza la promesa.
 * @param {string} [redirectTo] - URL a la que redirigir si no hay sesión
 * @returns {Promise<import('firebase/auth').User>} - Usuario autenticado
 */
export function requireAuth(redirectTo) {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        if (redirectTo) {
          window.location.href = redirectTo;
        }
        reject(new Error('Usuario no autenticado'));
      }
    });
  });
}

/**
 * Obtiene el usuario actualmente autenticado.
 * @returns {Object|null} - Usuario autenticado o null
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Verifica si hay un usuario autenticado de forma síncrona.
 * @returns {boolean} - true si hay usuario autenticado
 */
export function isAuthenticated() {
  return auth.currentUser !== null;
}

/**
 * Escucha cambios en el estado de autenticación.
 * @param {Function} callback - Función que se ejecuta cuando cambia el estado
 * @returns {Function} - Función para desuscribirse
 */
export function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}
