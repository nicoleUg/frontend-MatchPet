// src/Register_Pet/register.presenter.js
// 
// Función: Gestiona la vista y el flujo completo de registro de la mascota.

import '../firebase.js';
import { auth } from '../firebase.js';
import displayMessage from './displayMessage.js';
import { handleImageUpload, resetFormView } from './RegisterView.js';
import coreRegister from '../core/registerUseCase.js';
import petsAdapter from '../adapters/petsServiceAdapter.js';

// La función de coleccionar datos del DOM se mantiene
function collectFormData() {
    // ... (código existente, no requiere cambios de lógica)
    const name = document.getElementById('name').value.trim();
    const species = document.getElementById('species').value;
    const genderElement = document.querySelector('input[name="gender"]:checked');
    const gender = genderElement ? genderElement.value : '';

    const personality = document.getElementById('personality').value.trim();
    const age = document.getElementById('age').value.trim();
    const breed = document.getElementById('breed').value.trim();

    return { name, species, gender, personality, age, breed };
}

// -------------------------------------------------------------
// --- FUNCIÓN DE LÓGICA DE NEGOCIO (Testeable y Limpia) ---
// -------------------------------------------------------------
/**
 * Gestiona el registro de la mascota: validación, creación de instancia y persistencia.
 * @param {Object} data - Datos limpios del formulario (name, species, gender, etc.).
 * @param {Object | null} currentUser - Objeto de usuario autenticado o null.
 * @returns {Promise<Pet | string>} Promesa de la instancia de Pet guardada o mensaje de error (string).
 */
export async function handlePetRegistration(data, currentUser) {
    
    // 1) Use the core use-case. It validates and persists through the injected adapter.
    try {
        const saved = await coreRegister.registerPet(data, currentUser, petsAdapter);
        return saved;
    } catch (err) {
        console.error('Error al guardar en la BD (presenter):', err);
        throw new Error('Ocurrió un error inesperado al registrar la mascota.');
    }
}

// -------------------------------------------------------------
// --- FUNCIÓN DE INICIALIZACIÓN (Solo interacciones con el DOM) ---
// -------------------------------------------------------------
function init() {
    const form = document.getElementById('register-form');
    const photoInput = document.getElementById('photo-upload');
    const msgBox = document.getElementById('form-message');

    // ... (otras funciones y listeners)

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Limpieza de vista y recolección de datos
        // NOTA: La clase 'hidden' se quita aquí, pero la función displayMessage debería manejar la visibilidad.
        msgBox.classList.remove('hidden'); 
        msgBox.textContent = '';
        msgBox.style.color = 'var(--primary)';

        const data = collectFormData();
        const user = auth.currentUser; 

        try {
            // 2. Ejecuta la lógica de negocio pura
            console.log('[register.presenter] submit handler invoked with data:', data);

            // Mostrar un mensaje inmediato de estado para que los E2E vean actividad
            displayMessage('Registrando...', '');

            const result = await handlePetRegistration(data, user);
            console.log('[register.presenter] handlePetRegistration result:', result);
            
            // 3. Renderiza el resultado
            
            // Si el resultado es un string, es un error de validación
            if (typeof result === 'string') {
                displayMessage(result, 'error');
                return;
            }

            // Si es exitoso, result es la instancia de Pet guardada
            if (result && result.name) {
                displayMessage(`¡${result.name} ha sido registrado(a) exitosamente!`, 'success');
            } else {
                // Defensive: if adapter returned undefined/null, show a generic error
                console.error('[register.presenter] Unexpected empty result from register flow', result);
                displayMessage('Ocurrió un error al registrar la mascota. Intenta nuevamente.', 'error');
            }
            
            // Espera breve para que el usuario alcance a leer el mensaje
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // PASO C: Limpiar el formulario y ocultar el mensaje de nuevo
            resetFormView(form);
            
        } catch (error) {
            // Captura errores de guardado lanzados por handlePetRegistration
            console.error('[register.presenter] error during registration:', error);
            const msg = error && error.message ? error.message : 'Ocurrió un error inesperado al registrar la mascota.';
            displayMessage(msg, 'error');
        }
    });
}

// Evita ejecutar en entornos sin DOM
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}