/**
 * Servicio para manejar las llamadas al webhook de n8n
 */
class WebhookService {
    constructor() {
        // URL por defecto del webhook (configurable)
        this.WEBHOOK_URL = 'https://tu-instancia.n8n.cloud/webhook/microfono-trigger';
    }

    /**
     * Actualiza la URL del webhook
     * @param {string} url - Nueva URL del webhook
     */
    setWebhookUrl(url) {
        if (url && url.trim() !== '') {
            this.WEBHOOK_URL = url.trim();
        }
    }

    /**
     * Obtiene la URL actual del webhook
     * @returns {string} URL del webhook
     */
    getWebhookUrl() {
        return this.WEBHOOK_URL;
    }

    /**
     * Envía el trigger al webhook de n8n
     * @returns {Promise} Promesa con la respuesta del webhook
     */
    async triggerWebhook() {
        // Validar que la URL esté configurada
        if (!this.WEBHOOK_URL || this.WEBHOOK_URL === 'https://tu-instancia.n8n.cloud/webhook/microfono-trigger') {
            throw new Error('Por favor, configura la URL del webhook de n8n primero');
        }

        try {
            // Datos a enviar al webhook
            const payload = {
                timestamp: new Date().toISOString(),
                action: 'microphone_trigger',
                source: 'web_app',
                event: 'button_pressed'
            };

            console.log('Enviando trigger a n8n:', payload);

            const response = await fetch(this.WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                message: 'Trigger enviado correctamente a n8n'
            };

        } catch (error) {
            console.error('Error en webhook:', error);
            
            // Manejar diferentes tipos de errores
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('No se pudo conectar con n8n. Verifica la URL y tu conexión a internet.');
            }
            
            throw new Error(`Error al conectar con n8n: ${error.message}`);
        }
    }

    /**
     * Simula el envío para pruebas locales sin n8n
     * @returns {Promise} Promesa simulada
     */
    async simulateWebhook() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: { message: 'Simulación: trigger enviado' },
                    message: 'Modo simulación: trigger procesado'
                });
            }, 1000);
        });
    }
}

// Exportar una instancia única del servicio
export const webhookService = new WebhookService();