'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  sendChatMessage, 
  fileToBase64,
  getModelsInfo,
  setModel,
  ChatMessage,
  ModelsResponse,
  ModelInfo,
} from '@/services/aiApi';

// Iconos simples como componentes
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
  </svg>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para modelos
  const [modelsData, setModelsData] = useState<ModelsResponse | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isChangingModel, setIsChangingModel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Cargar modelos al iniciar
  useEffect(() => {
    loadModels();
  }, []);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadModels = async () => {
    try {
      const data = await getModelsInfo();
      setModelsData(data);
      setCurrentModel(data.currentModel);
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  const handleModelChange = async (modelId: string) => {
    if (modelId === currentModel || isChangingModel) return;
    
    setIsChangingModel(true);
    try {
      await setModel(modelId);
      setCurrentModel(modelId);
      setIsModelDropdownOpen(false);
      // Recargar información de modelos
      await loadModels();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cambiar el modelo');
    } finally {
      setIsChangingModel(false);
    }
  };

  const getModelDisplayName = (): string => {
    if (!modelsData) return 'Cargando...';
    const model = modelsData.models.find(m => m.id === currentModel);
    return model ? model.name : currentModel;
  };

  const getAvailableModels = (): ModelInfo[] => {
    if (!modelsData) return [];
    // Filtrar solo modelos de proveedores configurados
    const availableProviders = modelsData.providers
      .filter(p => p.available)
      .map(p => p.provider);
    return modelsData.models.filter(m => availableProviders.includes(m.provider));
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al enviar el mensaje');
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

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header del Chat */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <BotIcon />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Asistente Chifles IA</h1>
              {/* Selector de Modelo */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  disabled={isChangingModel}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
                >
                  <CpuIcon />
                  <span>{isChangingModel ? 'Cambiando...' : getModelDisplayName()}</span>
                  <ChevronDownIcon />
                </button>
                
                {/* Dropdown de modelos */}
                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase">Seleccionar Modelo</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {getAvailableModels().map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelChange(model.id)}
                          className={`w-full px-3 py-2 text-left hover:bg-amber-50 transition-colors ${
                            currentModel === model.id ? 'bg-amber-100' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{model.name}</p>
                              <p className="text-xs text-gray-500">{model.description}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              model.provider === 'gemini' 
                                ? 'bg-blue-100 text-blue-700' 
                                : model.provider === 'openai'
                                ? 'bg-green-100 text-green-700'
                                : model.provider === 'groq'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {model.provider === 'gemini' ? 'Gemini' : model.provider === 'openai' ? 'OpenAI' : model.provider === 'groq' ? 'Groq' : 'Grok'}
                            </span>
                          </div>
                          {currentModel === model.id && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-xs text-green-600">Activo</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {modelsData && modelsData.providers.some(p => !p.available) && (
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                          💡 Configura más proveedores en .env para más opciones
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Nueva conversación
          </button>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-200 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <div className="inline-flex p-4 bg-amber-100 rounded-full mb-4">
              <BotIcon />
            </div>
            <h2 className="text-lg font-medium text-gray-700">¡Hola! Soy tu asistente de Chifles</h2>
            <p className="text-sm mt-2">
              Puedo ayudarte a consultar productos, crear pedidos, verificar estados y más.
            </p>
            <p className="text-sm mt-1">
              También puedes enviarme imágenes de listas de pedidos o facturas.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full h-fit">
                <BotIcon />
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              {/* Imagen adjunta */}
              {message.image && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.image}
                    alt="Imagen adjunta"
                    className="max-w-full h-auto rounded-md max-h-48 object-contain"
                  />
                </div>
              )}
              
              {/* Contenido del mensaje */}
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Tools usadas */}
              {message.toolsUsed && message.toolsUsed.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    🔧 Herramientas usadas: {message.toolsUsed.join(', ')}
                  </p>
                </div>
              )}
              
              {/* Timestamp */}
              {message.timestamp && (
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-amber-100' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="flex-shrink-0 p-2 bg-gray-200 rounded-full h-fit">
                <UserIcon />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full h-fit">
              <BotIcon />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-pulse flex gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Procesando...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Imagen seleccionada preview */}
      {selectedImage && (
        <div className="bg-white border-x border-gray-200 px-4 py-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Preview"
              className="h-12 w-12 object-cover rounded"
            />
            <span className="text-sm text-gray-600 max-w-xs truncate">
              {selectedImageName}
            </span>
            <button
              onClick={removeSelectedImage}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2 items-end">
          {/* Botón de imagen */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Adjuntar imagen"
          >
            <ImageIcon />
          </button>

          {/* Input de texto */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent max-h-32"
            style={{ minHeight: '42px' }}
          />

          {/* Botón enviar */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Presiona Enter para enviar • Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
