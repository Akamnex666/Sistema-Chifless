'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  sendChatMessage, 
  fileToBase64,
  ChatMessage,
} from '@/services/aiApi';
import { 
  MessageCircle, 
  X, 
  Send, 
  Image, 
  Loader2, 
  Minus, 
  Maximize2,
  Plus,
  History,
  Trash2,
  ChevronLeft,
  MessageSquare,
  FileText,
  Paperclip
} from 'lucide-react';

// Interfaz para conversaciones guardadas
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Función para generar ID único
const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Función para generar título de conversación
const generateTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage?.content) {
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
  }
  return 'Nueva conversación';
};

// Formato de fecha relativa
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export function ChatbotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Estado de conversaciones
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Estado del chat actual
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar conversaciones del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatbot_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        // Cargar la última conversación activa
        if (parsed.length > 0) {
          const lastConv = parsed[0];
          setCurrentConversationId(lastConv.id);
          setMessages(lastConv.messages);
          setSessionId(lastConv.sessionId);
        }
      } catch {
        console.error('Error loading conversations');
      }
    }
  }, []);

  // Guardar conversaciones en localStorage
  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem('chatbot_conversations', JSON.stringify(convs));
  }, []);

  // Actualizar conversación actual
  const updateCurrentConversation = useCallback((newMessages: ChatMessage[], newSessionId: string | null) => {
    setConversations(prev => {
      let updated: Conversation[];
      
      if (currentConversationId) {
        updated = prev.map(conv => 
          conv.id === currentConversationId
            ? { 
                ...conv, 
                messages: newMessages, 
                sessionId: newSessionId,
                title: generateTitle(newMessages),
                updatedAt: new Date().toISOString() 
              }
            : conv
        );
      } else {
        // Crear nueva conversación
        const newConv: Conversation = {
          id: generateId(),
          title: generateTitle(newMessages),
          messages: newMessages,
          sessionId: newSessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentConversationId(newConv.id);
        updated = [newConv, ...prev];
      }
      
      saveConversations(updated);
      return updated;
    });
  }, [currentConversationId, saveConversations]);

  // Auto-scroll y auto-resize
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  // Auto-resize del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      // Validar tipos permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no soportado. Usa imágenes (JPG, PNG, GIF, WebP) o PDF.');
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setSelectedImage(base64);
        setSelectedImageName(file.name);
        setError(null);
      } catch {
        setError('Error al procesar el archivo');
      }
    }
  };

  // Función para verificar si el archivo es un PDF
  const isPDF = (filename: string | null): boolean => {
    return filename?.toLowerCase().endsWith('.pdf') || false;
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    // Determinar el texto por defecto según el tipo de archivo
    const getDefaultPrompt = (): string => {
      if (!selectedImage) return inputText;
      if (isPDF(selectedImageName)) {
        return inputText || 'Analiza este documento PDF y extrae la información relevante';
      }
      return inputText || 'Analiza esta imagen';
    };

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText || (isPDF(selectedImageName) ? `📄 [Documento: ${selectedImageName}]` : `🖼️ [Imagen: ${selectedImageName}]`),
      timestamp: new Date().toISOString(),
      image: selectedImage || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage({
        text: getDefaultPrompt(),
        image: selectedImage || undefined,
        sessionId: sessionId || undefined,
      });

      const newSessionId = response.sessionId || sessionId;
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.text,
        timestamp: response.timestamp,
        toolsUsed: response.toolsUsed,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      updateCurrentConversation(updatedMessages, newSessionId);
      removeSelectedImage();
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj?.response?.data?.message || 'Error al enviar el mensaje');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Crear nueva conversación
  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setSessionId(null);
    setError(null);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  // Cargar conversación del historial
  const loadConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    setMessages(conv.messages);
    setSessionId(conv.sessionId);
    setError(null);
    setShowHistory(false);
  };

  // Eliminar conversación
  const deleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId);
      saveConversations(updated);
      
      // Si eliminamos la conversación actual, limpiar
      if (convId === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
        setSessionId(null);
      }
      
      return updated;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 z-50 group"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 flex flex-col transition-all duration-300 overflow-hidden ${
        isMinimized ? 'w-80 h-16' : 'w-[420px] h-[650px] max-h-[85vh]'
      }`}
      style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-t-3xl">
        <div className="flex items-center gap-3">
          {showHistory && !isMinimized && (
            <button
              onClick={() => setShowHistory(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-lg">🍌</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-wide">
              {showHistory ? 'Historial' : 'Asistente Chifles'}
            </h3>
            {!isMinimized && !showHistory && (
              <p className="text-xs text-white/80">IA • Siempre disponible</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && !showHistory && (
            <>
              <button
                onClick={startNewConversation}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
                title="Nueva conversación"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white relative"
                title="Historial"
              >
                <History size={18} />
                {conversations.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-400 rounded-full text-[10px] flex items-center justify-center font-bold">
                    {conversations.length}
                  </span>
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minus size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {showHistory ? (
            /* Panel de Historial */
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-indigo-500" />
                  </div>
                  <p className="text-gray-600 font-medium text-center">No hay conversaciones</p>
                  <p className="text-gray-400 text-sm text-center mt-1">
                    Inicia una nueva conversación
                  </p>
                  <button
                    onClick={startNewConversation}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Nueva conversación
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv)}
                      className={`group p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                        conv.id === currentConversationId
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200'
                          : 'bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {conv.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatRelativeDate(conv.updatedAt)}
                            </span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">
                              {conv.messages.length} mensajes
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <span className="text-2xl">👋</span>
                    </div>
                    <p className="text-base font-semibold text-gray-700">¡Hola! ¿En qué puedo ayudarte?</p>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                      Consulta productos, pedidos, reportes y más. Estoy aquí para ayudarte.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['📦 Ver productos', '📋 Mis pedidos', '📊 Reportes'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setInputText(suggestion.split(' ').slice(1).join(' '))}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-lg'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {message.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={message.image}
                          alt="Adjunto"
                          className="max-w-full h-auto rounded-xl mb-2 max-h-36 object-contain"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
                          <span>🔧</span> {message.toolsUsed.join(', ')}
                        </p>
                      )}
                      <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(message.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-gray-500">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
                    <p className="font-medium">Error</p>
                    <p className="text-xs mt-1">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* File Preview (Image or PDF) */}
              {selectedImage && (
                <div className="px-4 py-2 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-2">
                    {isPDF(selectedImageName) ? (
                      <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText size={24} className="text-red-500" />
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-600 truncate font-medium block">
                        {selectedImageName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {isPDF(selectedImageName) ? 'Documento PDF' : 'Imagen'}
                      </span>
                    </div>
                    <button
                      onClick={removeSelectedImage}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area - Mejorado */}
              <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
                <div className="flex items-end gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                    aria-label="Adjuntar imagen o PDF"
                    title="Adjuntar imagen o PDF"
                  >
                    <Paperclip size={22} />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={1}
                      className="w-full resize-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!inputText.trim() && !selectedImage)}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Enter para enviar • Shift+Enter para nueva línea
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
