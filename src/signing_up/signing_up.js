import { auth } from '../firebase.js';
import { createUser as createDemoUser } from '../services/demo-store.js';

/**
 * Registra un nuevo usuario en Firebase Authentication y guarda sus datos en Firestore.
 * @param {string} fullName - Nombre completo del usuario
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} confirmPassword - Confirmación de la contraseña
 * @param {string} matches - Confirmación de la contraseña
 * @returns {Promise<Object>} - Objeto con los datos del usuario registrado
 * @throws {Error} - Si hay algún error en el proceso de registro
 */
export async function registerUser(fullName, email, password, confirmPassword) {
  // Validaciones
  if (!fullName || fullName.trim() === '') {
    throw new Error('El nombre completo es requerido');
  }

  if (!email || email.trim() === '') {
    throw new Error('El correo electrónico es requerido');
  }

  if (!password || password.trim() === '') {
    throw new Error('La contraseña es requerida');
  }

  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  try {
    const userRecord = createDemoUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });

    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };

    auth._setCurrentUser(user);

    return {
      uid: user.uid,
      fullName: fullName.trim(),
      email: email.trim(),
      message: 'Usuario registrado exitosamente',
    };
  } catch (error) {
    console.error('Error de Demo Auth:', error.code, error.message);
    throw new Error(error.message || 'Error al registrar usuario');
  }
}
