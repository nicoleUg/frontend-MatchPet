import { auth } from '../firebase.js';
import { createUser, verifyLogin } from './demo-store.js';

export const authService = {
  onChange(cb) {
    return auth.onAuthStateChanged(cb); // devuelve unsubscribe()
  },

  async registerEmail({ email, password, displayName }) {
    const userRecord = createUser({
      fullName: displayName ?? '',
      email,
      password,
    });

    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };

    auth._setCurrentUser(user);
    return user;
  },

  async loginEmail({ email, password }) {
    const userRecord = verifyLogin({ email, password });
    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
    auth._setCurrentUser(user);
    return user;
  },

  async loginGoogle() {
    throw new Error('Login con Google no disponible en modo demo');
  },

  async logout() {
    auth._setCurrentUser(null);
  },
};
