// Script de prueba para el servicio de chat
// Ejecutar con: node test_chat_service.js

const chatService = {
  // Simulación del método sendMessage para pruebas
  async sendMessage(message, userId = null, additionalData = {}) {
    const maxRetries = 2;
    const timeout = 30000;

    try {
      const payload = {
        body: {
          message: message,
          timestamp: new Date().toISOString(),
          user_id: userId || 1,
          ...additionalData
        }
      };

      console.log('📤 Enviando mensaje al webhook n8n:', payload);

      // Simular fetch con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Simular respuesta del webhook (descomenta la que quieras probar)
      let mockResponse;

      // Respuesta exitosa - formato texto plano (como el webhook real)
      mockResponse = {
        ok: true,
        text: async () => `¡Hola! He recibido tu mensaje: "${message}". ¿En qué puedo ayudarte?`
      };

      // Respuesta exitosa - formato objeto JSON
      // mockResponse = {
      //   ok: true,
      //   json: async () => ({ respuesta: `Respuesta a: "${message}"` })
      // };

      // Respuesta exitosa - formato array
      // mockResponse = {
      //   ok: true,
      //   json: async () => ([{ output: `Respuesta a: "${message}"`, metadata: { confidence: 0.95 } }])
      // };

      // Error 404 - webhook no activo (simulando respuesta real de n8n)
      // mockResponse = {
      //   ok: false,
      //   status: 404,
      //   json: async () => ({ code: 404, message: "The requested webhook \"chat\" is not registered.", hint: "Click the 'Execute workflow' button on the canvas, then try again. (In test mode, the webhook only works for one call after you click this button)" })
      // };

      // Error de red
      // throw new Error('fetch failed');

      // Timeout
      // setTimeout(() => controller.abort(), 100);

      clearTimeout(timeoutId);

      // Manejar respuestas de error del servidor
      if (!mockResponse.ok) {
        const errorData = await mockResponse.json().catch(() => ({}));
        console.error('❌ Error HTTP del webhook:', mockResponse.status, errorData);

        // Manejar error 404 específico del webhook n8n
        if (mockResponse.status === 404 && errorData.message?.includes('webhook') && errorData.message?.includes('not registered')) {
          return {
            success: false,
            response: 'El servicio de chat no está disponible temporalmente. El webhook necesita ser activado en n8n.',
            error: 'WEBHOOK_NOT_ACTIVE',
            data: errorData
          };
        }

        throw new Error(`HTTP ${mockResponse.status}: ${errorData.message || mockResponse.status}`);
      }

      // Intentar parsear como JSON primero, si falla tratar como texto plano
      let responseData;
      let responseText = '';
      let metadata = {};

      try {
        responseData = await mockResponse.json();
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
        const textResponse = await mockResponse.text();
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

      // Retornar respuesta de error controlada
      return {
        success: false,
        response: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        error: error.message
      };
    }
  }
};

// Función de prueba
async function testChatService() {
  console.log('🧪 Iniciando pruebas del servicio de chat...\n');

  // Prueba 1: Mensaje normal
  console.log('Test 1: Mensaje normal');
  const result1 = await chatService.sendMessage('Hola, ¿cómo estás?');
  console.log('Resultado:', result1);
  console.log('');

  // Prueba 2: Mensaje con datos adicionales
  console.log('Test 2: Mensaje con datos adicionales');
  const result2 = await chatService.sendMessage('¿Qué puedes hacer?', 123, { context: 'help' });
  console.log('Resultado:', result2);
  console.log('');

  console.log('✅ Pruebas completadas');
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testChatService();
}

module.exports = chatService;
