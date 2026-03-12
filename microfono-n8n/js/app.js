import { MicrophoneButton } from './components/MicrophoneButton.js';
import { webhookService } from './services/webhookService.js';

/**
 * Componente principal de la aplicación
 */
class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.microphoneButton = new MicrophoneButton();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        this.render();
        this.setupEventListeners();
        this.loadSavedConfig();
    }

    /**
     * Renderiza la aplicación completa
     */
    render() {
        const appHTML = `
            <div class="app-container">
                <div class="app-card">
                    <div class="app-header">
                        <h1>🎙️ n8n Voice Trigger</h1>
                        <p>Presiona el micrófono para activar tu automatización</p>
                    </div>
                    
                    <div id="microphoneContainer"></div>
                    
                    <div class="config-section">
                        <h3>Configuración del Webhook</h3>
                        <input 
                            type="url" 
                            id="webhookUrl" 
                            class="config-input" 
                            placeholder="https://tu-instancia.n8n.cloud/webhook/..."
                            value="${webhookService.getWebhookUrl()}"
                        >
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
                            ⚡ La URL se guarda automáticamente al escribir
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.appContainer.innerHTML = appHTML;

        // Renderizar el componente del micrófono
        const microphoneContainer = document.getElementById('microphoneContainer');
        this.microphoneButton.render(microphoneContainer);
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        const webhookInput = document.getElementById('webhookUrl');
        
        // Guardar URL cuando se pierde el foco
        webhookInput.addEventListener('blur', (e) => {
            this.saveWebhookUrl(e.target.value);
        });

        // Guardar con Enter
        webhookInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });

        // Registrar callback del micrófono
        this.microphoneButton.onTrigger((result) => {
            console.log('Trigger activado:', result);
        });
    }

    /**
     * Guarda la URL del webhook
     * @param {string} url - URL del webhook
     */
    saveWebhookUrl(url) {
        webhookService.setWebhookUrl(url);
        localStorage.setItem('n8n_webhook_url', url);
        
        // Mostrar confirmación visual
        const input = document.getElementById('webhookUrl');
        input.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            input.style.borderColor = '#e5e7eb';
        }, 1000);
    }

    /**
     * Carga la configuración guardada
     */
    loadSavedConfig() {
        const savedUrl = localStorage.getItem('n8n_webhook_url');
        if (savedUrl) {
            webhookService.setWebhookUrl(savedUrl);
            const input = document.getElementById('webhookUrl');
            if (input) {
                input.value = savedUrl;
            }
        }
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});