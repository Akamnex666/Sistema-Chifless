'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  sendChatMessage, 
  fileToBase64,
  ChatMessage,
} from '@/services/aiApi';
import { MessageCircle, X, Send, Image, Loader2, Minus, Maximize2 } from 'lucide-react';

export function ChatbotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setSelectedImage(base64);
        setSelectedImageName(file.name);
      } catch {
        setError('Error al procesar la imagen');
      }
    }
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

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage({
        text: inputText || 'Analiza esta imagen',
        image: selectedImage || undefined,
        sessionId: sessionId || undefined,
      });

      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.text,
        timestamp: response.timestamp,
        toolsUsed: response.toolsUsed,
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 z-50"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">🍌</span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Asistente Chifles</h3>
            {!isMinimized && (
              <p className="text-xs text-blue-100">Siempre disponible para ayudar</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👋</span>
                </div>
                <p className="text-sm font-medium text-gray-700">¡Hola! ¿En qué puedo ayudarte?</p>
                <p className="text-xs text-gray-500 mt-1">
                  Consulta productos, pedidos, reportes y más
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  {message.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={message.image}
                      alt="Adjunto"
                      className="max-w-full h-auto rounded-lg mb-2 max-h-32 object-contain"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <p className="text-xs mt-1 opacity-70">
                      🔧 {message.toolsUsed.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-10 w-10 object-cover rounded"
                />
                <span className="text-xs text-gray-600 flex-1 truncate">
                  {selectedImageName}
                </span>
                <button
                  onClick={removeSelectedImage}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Adjuntar imagen"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text -- Este es un icono de lucide-react, no un elemento img */}
                <Image size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="w-full resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
                  style={{ minHeight: '42px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
