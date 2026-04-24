// src/services/page-guard.js

import { requireAuth } from './auth-guard.service.js';
import { auth } from '../firebase.js';

// 👉 REQUIERE autenticación antes de cargar la página
requireAuth()
  .then(() => {
    console.log('Usuario autenticado correctamente');
  })
  .catch(() => {
    // 🔴 Si NO hay sesión → redirigir al index (login principal)
    window.location.href = '/index.html';
  });

// 👉 Esperar carga del DOM
document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');
  const profileNameEl = document.getElementById('profile-name');
  const profilePill = document.getElementById('profile-pill');

  // 👉 CERRAR SESIÓN
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        auth._setCurrentUser(null);
        localStorage.removeItem('user');
        console.log('Sesión cerrada exitosamente');
        window.location.href = '/index.html'; // 🔁 Vuelve al login correcto
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Intenta nuevamente.');
      }
    });
  }

  // 👉 MOMENTO EN QUE FIREBASE CARGA LOS DATOS
  try {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // Mostrar nombre en el navbar
        const name =
          user.displayName ||
          (user.email ? user.email.split('@')[0] : 'Usuario');

        if (profileNameEl) profileNameEl.textContent = name;

        // Asegurar que el botón de perfil apunte a Perfil
        if (profilePill) {
          profilePill.setAttribute(
            'href',
            `${window.location.origin}/src/profile/profile.html`
          );
        }
      } else {
        // 👉 Si no hay usuario → ocultar botón de perfil
        if (profilePill) profilePill.style.display = 'none';
      }
    });
  } catch (e) {
    console.warn('No se pudo enlazar onAuthStateChanged:', e);
  }
});
