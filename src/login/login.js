import { auth } from '../firebase.js';
import { verifyLogin } from '../services/demo-store.js';

/**
 * Inicia sesión de un usuario en Firebase Authentication.
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Objeto con los datos del usuario autenticado
 * @throws {Error} - Si hay algún error en el proceso de inicio de sesión
 */
export async function loginUser(email, password) {
  // Validaciones
  if (!email || email.trim() === '') {
    throw new Error('El correo electrónico es requerido');
  }

  if (!password || password.trim() === '') {
    throw new Error('La contraseña es requerida');
  }

  try {
    const userRecord = verifyLogin({ email, password });

    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };

    // Keep the rest of the app (guards, nav) working via the auth stub.
    auth._setCurrentUser(user);

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      message: 'Inicio de sesión exitoso',
    };
  } catch (error) {
    console.error('Error de Demo Auth:', error.code, error.message);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
}
