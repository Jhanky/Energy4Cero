import apiService from './api';

// Servicio para manejar la comunicación con el chat IA
class ChatService {
  constructor() {
    this.baseURL = apiService.baseURL;
  }

  // Enviar mensaje al webhook del chat IA
  async sendMessage(message, userId = null, additionalData = {}, retryCount = 0) {
    const maxRetries = 2;
    const timeout = 30000; // 30 segundos

    try {
      const payload = {
        body: {
          message: message,
          timestamp: new Date().toISOString(),
          user_id: userId || apiService.getCurrentUserFromStorage()?.id,
          ...additionalData
        }
      };

      console.log('📤 Enviando mensaje al webhook n8n:', payload);

      // Crear controller para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('https://n8n.jhanky.online/webhook-test/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Manejar respuestas de error del servidor
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error HTTP del webhook:', response.status, errorData);

        // Manejar error 404 específico del webhook n8n
        if (response.status === 404 && errorData.message?.includes('webhook') && errorData.message?.includes('not registered')) {
          return {
            success: false,
            response: 'El servicio de chat no está disponible temporalmente. El webhook necesita ser activado en n8n.',
            error: 'WEBHOOK_NOT_ACTIVE',
            data: errorData
          };
        }

        // Para otros errores HTTP, intentar retry si no hemos alcanzado el máximo
        if (retryCount < maxRetries && response.status >= 500) {
          console.log(`🔄 Reintentando petición (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Espera exponencial
          return this.sendMessage(message, userId, additionalData, retryCount + 1);
        }

        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      // Intentar parsear como JSON primero, si falla tratar como texto plano
      let responseData;
      let responseText = '';
      let metadata = {};

      try {
        responseData = await response.json();
        console.log('📥 Respuesta del webhook n8n (JSON):', responseData);

        // Manejar diferentes formatos de respuesta JSON
        if (Array.isArray(responseData) && responseData.length > 0) {
          // Formato array: [{"output": "mensaje", "metadata": {...}}]
          const firstItem = responseData[0];
          responseText = firstItem?.output || firstItem?.respuesta || firstItem?.message || '';
          metadata = firstItem?.metadata || {};
        } else if (typeof responseData === 'object') {
          // Formato objeto: {"respuesta": "mensaje", "output": "mensaje", "message": "mensaje"}
          responseText = responseData?.respuesta || responseData?.output || responseData?.message || '';

          // Extraer metadata si existe
          const { respuesta, output, message, ...rest } = responseData;
          metadata = rest;
        }
      } catch (jsonError) {
        // Si no es JSON válido, tratar como texto plano
        const textResponse = await response.text();
        console.log('📥 Respuesta del webhook n8n (texto plano):', textResponse);
        responseText = textResponse;
        responseData = { raw: textResponse };
      }

      // Validar que tengamos una respuesta válida
      if (!responseText || typeof responseText !== 'string') {
        console.warn('⚠️ Respuesta del webhook no contiene texto válido:', responseData);
        responseText = 'El servicio respondió pero no se pudo extraer el mensaje. Por favor, intenta con una pregunta diferente.';
      }

      return {
        success: true,
        response: responseText.trim(),
        data: responseData,
        metadata: metadata
      };
    } catch (error) {
      console.error('❌ Error al enviar mensaje al webhook n8n:', error);

      // Manejar errores específicos
      if (error.name === 'AbortError') {
        return {
          success: false,
          response: 'La petición al servicio de chat excedió el tiempo límite. Por favor, intenta nuevamente.',
          error: 'TIMEOUT'
        };
      }

      if (error.message.includes('fetch')) {
        return {
          success: false,
          response: 'No se pudo conectar al servicio de chat. Verifica tu conexión a internet.',
          error: 'NETWORK_ERROR'
        };
      }

      // Para errores no manejados específicamente, intentar retry si no hemos alcanzado el máximo
      if (retryCount < maxRetries && !error.message.includes('WEBHOOK_NOT_ACTIVE')) {
        console.log(`🔄 Reintentando por error (${retryCount + 1}/${maxRetries}): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.sendMessage(message, userId, additionalData, retryCount + 1);
      }

      // Retornar respuesta de error controlada
      return {
        success: false,
        response: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        error: error.message
      };
    }
  }

  // Obtener historial de conversación (si el backend lo soporta)
  async getConversationHistory(userId = null, limit = 50) {
    try {
      const params = {
        user_id: userId || apiService.getCurrentUserFromStorage()?.id,
        limit: limit
      };

      const response = await apiService.get('/chat/history', { params });

      return {
        success: true,
        history: response.data?.history || [],
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al obtener historial de conversación:', error);

      return {
        success: false,
        history: [],
        error: error.message
      };
    }
  }

  // Limpiar conversación
  async clearConversation(userId = null) {
    try {
      const payload = {
        user_id: userId || apiService.getCurrentUserFromStorage()?.id
      };

      const response = await apiService.post('/chat/clear', payload);

      return {
        success: true,
        message: response.data?.message || 'Conversación limpiada exitosamente',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al limpiar conversación:', error);

      return {
        success: false,
        message: 'Error al limpiar la conversación',
        error: error.message
      };
    }
  }

  // Obtener sugerencias de mensajes (si el backend las proporciona)
  async getSuggestions(context = '') {
    try {
      const payload = {
        context: context,
        user_id: apiService.getCurrentUserFromStorage()?.id
      };

      const response = await apiService.post('/chat/suggestions', payload);

      return {
        success: true,
        suggestions: response.data?.suggestions || [],
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al obtener sugerencias:', error);

      return {
        success: false,
        suggestions: [],
        error: error.message
      };
    }
  }
}

// Crear instancia única del servicio
const chatService = new ChatService();

export default chatService;
