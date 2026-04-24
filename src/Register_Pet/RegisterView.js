// src/Register_Pet/RegisterView.js
//
// Responsabilidad: Funciones de manipulación directa de la interfaz de usuario (DOM).

// --- Constantes DOM ---
const PREVIEW_ID = 'image-preview';
const ICON_ID = 'camera-icon';
const MESSAGE_ID = 'form-message';

/**
 * Maneja la carga de imágenes y muestra una vista previa.
 * Utiliza FileReader para leer el archivo local.
 * @param {Event} event - El evento change del input de archivo.
 */
export function handleImageUpload(event) {
    const file = event.target.files?.[0]; // Uso de optional chaining para seguridad
    const previewContainer = document.getElementById(PREVIEW_ID);

    if (!file || !previewContainer) return; // Robustez

    const iconContainer = document.getElementById(ICON_ID);

    const reader = new FileReader();

    reader.onload = function(e) {
        // Aplicación de estilos de forma concisa (cssText)
        previewContainer.style.cssText = `
            background-image: url('${e.target.result}');
            border-style: solid;
            border-width: 0;
        `;

        // Ocultar el ícono de la cámara
        if (iconContainer) {
            iconContainer.classList.add('hidden');
        }
    };

    reader.readAsDataURL(file);
}

// --- Estado Inicial del Contenedor ---
const INITIAL_PREVIEW_STYLES = `
    background-image: none;
    border-style: dashed;
    border-width: 2px;
`;

/**
 * Restablece el formulario a su estado inicial, incluyendo la vista previa de la imagen.
 * @param {HTMLFormElement} form - La referencia al formulario a resetear.
 */
export function resetFormView(form) {
    if (!form) return; // Robustez

    form.reset();
    
    const previewContainer = document.getElementById(PREVIEW_ID);
    const iconContainer = document.getElementById(ICON_ID);
    const messageElement = document.getElementById(MESSAGE_ID);
    
    // 1. Restablecer la vista de la imagen
    if (previewContainer) {
        previewContainer.style.cssText = INITIAL_PREVIEW_STYLES;
    }
    
    // 2. Mostrar el ícono de la cámara
    if (iconContainer) {
        iconContainer.classList.remove('hidden');
    }
    
    // 3. Ocultar y limpiar el mensaje de estado (CORRECCIÓN CLAVE)
    if (messageElement) {
        messageElement.classList.add('hidden');
        // Usar remove para limpiar las clases de color que quedaron del intento anterior
        messageElement.classList.remove('text-success', 'text-error');
    }
}