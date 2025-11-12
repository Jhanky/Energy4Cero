import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../../ui/chat-bubble';
import { ChatMessageList } from '../../ui/chat-message-list';
import chatService from '../../services/chatService';

const ChatIA = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enviar mensaje a través del servicio de chat
      const response = await chatService.sendMessage(userMessage.content);

      // Manejar respuesta exitosa
      if (response.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.response,
          timestamp: new Date(),
          metadata: response.metadata || {}
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // Manejar errores específicos
        let errorMessage = response.response;

        // Personalizar mensajes de error según el tipo
        if (response.error === 'WEBHOOK_NOT_ACTIVE') {
          errorMessage = '🤖 El asistente IA no está disponible temporalmente. El webhook de n8n necesita ser activado.';
        } else if (response.error === 'TIMEOUT') {
          errorMessage = '⏱️ La respuesta está tardando demasiado. Por favor, intenta con una pregunta más corta.';
        } else if (response.error === 'NETWORK_ERROR') {
          errorMessage = '🌐 Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
        }

        const errorResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: errorMessage,
          timestamp: new Date(),
          isError: true
        };

        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);

      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Lo siento, hubo un error inesperado al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-green-600" />
            Asistente IA
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="animate-pulse">
                En línea
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.type === 'user' ? 'sent' : 'received'}
              >
                <ChatBubbleAvatar
                  fallback={message.type === 'user' ? 'Tú' : 'AI'}
                />
                <ChatBubbleMessage
                  variant={message.type === 'user' ? 'sent' : 'received'}
                  isError={message.isError}
                >
                  <div className="space-y-2">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-xs block ${
                        message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}

            <div ref={messagesEndRef} />
          </ChatMessageList>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Presiona Enter para enviar. Shift + Enter para nueva línea.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatIA;
