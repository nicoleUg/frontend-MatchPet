// src/Register_Pet/displayMessage.js 
// 
// Responsabilidad: Función utilitaria para mostrar un mensaje en un elemento DOM específico 
//                  y aplicar estilos basados en el tipo de mensaje.

const TYPE_CLASSES = {
    success: 'text-success',
    error: 'text-error',
    // Puedes agregar más tipos aquí, como 'warning': 'text-warning'
};

/**
 * Muestra un mensaje al usuario en la caja de mensajes predefinida.
 * @param {string} message - El texto del mensaje a mostrar.
 * @param {string} [type=''] - El tipo de mensaje ('success', 'error', etc.).
 */
function displayMessage(message, type = '') {
    const messageBox = document.getElementById('form-message');
    
    // Si no se encuentra el elemento, salimos sin fallar
    if (!messageBox) {
        console.warn('Elemento "form-message" no encontrado en el DOM.');
        return;
    }

    // 1. Limpieza inicial: quitamos todas las clases de tipo posibles
    messageBox.classList.remove('text-success', 'text-error', 'hidden');
    messageBox.textContent = '';

    // 2. Si hay un mensaje, lo mostramos y aplicamos estilo
    if (message) {
        messageBox.textContent = message;
        
        // Aplica la clase de estilo si el tipo es válido
        const styleClass = TYPE_CLASSES[type];
        if (styleClass) {
            messageBox.classList.add(styleClass);
        }
        
        // Asegurar que está visible
        messageBox.style.display = 'block';
        
    } else {
        // Si no hay mensaje (limpieza), aseguramos que esté oculto.
        messageBox.classList.add('hidden');
        messageBox.style.display = 'none';
    }
}

export default displayMessage;