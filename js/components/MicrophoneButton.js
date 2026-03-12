import { webhookService } from '../services/webhookService.js';

/**
 * Componente del botón de micrófono
 */
export class MicrophoneButton {
    constructor() {
        this.isActive = false;
        this.isProcessing = false;
        this.element = null;
        this.statusElement = null;
        this.badgeElement = null;
        this.feedbackElement = null;
        this.onTriggerCallback = null;
    }

    /**
     * Renderiza el componente en el DOM
     * @param {HTMLElement} container - Contenedor donde se renderizará
     */
    render(container) {
        // Crear estructura del componente
        const microphoneHTML = `
            <div class="microphone-container">
                <button class="microphone-button" id="microphoneBtn" aria-label="Activar micrófono">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
                
                <div class="wave-animation" id="waveAnimation">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                </div>

                <div class="microphone-status">
                    <div class="status-text" id="statusText">Listo para activar</div>
                    <div class="status-badge" id="statusBadge">Inactivo</div>
                </div>

                <div class="feedback-message hidden" id="feedbackMessage"></div>
            </div>
        `;

        // Insertar en el contenedor
        container.innerHTML = microphoneHTML;

        // Obtener referencias a los elementos
        this.element = document.getElementById('microphoneBtn');
        this.waveAnimation = document.getElementById('waveAnimation');
        this.statusText = document.getElementById('statusText');
        this.statusBadge = document.getElementById('statusBadge');
        this.feedbackElement = document.getElementById('feedbackMessage');

        // Ocultar animación inicialmente
        this.waveAnimation.style.opacity = '0';

        // Agregar event listeners
        this.element.addEventListener('click', () => this.handleClick());
        this.element.addEventListener('mousedown', () => this.handlePressStart());
        this.element.addEventListener('mouseup', () => this.handlePressEnd());
        this.element.addEventListener('mouseleave', () => this.handlePressEnd());
        
        // Soporte táctil
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePressStart();
        });
        this.element.addEventListener('touchend', () => this.handlePressEnd());
    }

    /**
     * Maneja el inicio de la presión del botón
     */
    handlePressStart() {
        if (!this.isProcessing && !this.isActive) {
            this.element.classList.add('active');
            this.waveAnimation.style.opacity = '1';
            this.statusText.textContent = 'Presiona para activar...';
            this.statusBadge.textContent = 'Listo';
        }
    }

    /**
     * Maneja el final de la presión del botón
     */
    handlePressEnd() {
        if (!this.isActive && !this.isProcessing) {
            this.element.classList.remove('active');
            this.waveAnimation.style.opacity = '0';
            this.statusText.textContent = 'Listo para activar';
            this.statusBadge.textContent = 'Inactivo';
        }
    }

    /**
     * Maneja el click en el botón
     */
    async handleClick() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.isActive = true;

        // Actualizar UI
        this.element.classList.add('active');
        this.waveAnimation.style.opacity = '1';
        this.statusText.textContent = '🎤 Enviando trigger...';
        this.statusBadge.textContent = 'Activando';
        this.statusBadge.classList.add('active');
        
        // Ocultar mensajes previos
        this.hideFeedback();

        try {
            // Enviar trigger al webhook
            const result = await webhookService.triggerWebhook();
            
            // Mostrar éxito
            this.showFeedback('✅ Trigger enviado correctamente a n8n', 'success');
            this.statusText.textContent = '¡Activado!';
            this.statusBadge.textContent = 'Completado';
            this.statusBadge.classList.remove('active');
            this.statusBadge.classList.add('success');

            // Llamar al callback si existe
            if (this.onTriggerCallback) {
                this.onTriggerCallback(result);
            }

        } catch (error) {
            // Mostrar error
            this.showFeedback(`❌ ${error.message}`, 'error');
            this.statusText.textContent = 'Error al activar';
            this.statusBadge.textContent = 'Error';
            this.statusBadge.classList.remove('active');
            this.statusBadge.classList.add('error');
            
            console.error('Error en trigger:', error);
        } finally {
            // Restaurar estado después de 3 segundos
            setTimeout(() => {
                this.resetState();
            }, 3000);
        }
    }

    /**
     * Restaura el estado inicial del componente
     */
    resetState() {
        this.isActive = false;
        this.isProcessing = false;
        this.element.classList.remove('active');
        this.waveAnimation.style.opacity = '0';
        this.statusText.textContent = 'Listo para activar';
        this.statusBadge.textContent = 'Inactivo';
        this.statusBadge.classList.remove('success', 'error');
        this.hideFeedback();
    }

    /**
     * Muestra un mensaje de feedback
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, info)
     */
    showFeedback(message, type = 'info') {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback-message ${type}`;
        this.feedbackElement.classList.remove('hidden');
    }

    /**
     * Oculta el mensaje de feedback
     */
    hideFeedback() {
        this.feedbackElement.classList.add('hidden');
    }

    /**
     * Registra un callback para cuando se active el trigger
     * @param {Function} callback - Función a llamar
     */
    onTrigger(callback) {
        this.onTriggerCallback = callback;
    }
}