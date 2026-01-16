import axios from 'axios';

const aiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_ORCHESTRATOR_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir Authorization desde localStorage
aiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('AI api request interceptor error', e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  toolsUsed?: string[];
  image?: string;
}

export interface ChatRequest {
  text: string;
  image?: string;
  images?: string[];
  history?: { role: 'user' | 'assistant'; content: string }[];
  sessionId?: string;
  model?: string;
}

export interface ChatResponse {
  text: string;
  toolsUsed?: string[];
  sessionId: string;
  timestamp: string;
  model?: string;
  provider?: string;
}

export interface ProviderInfo {
  current: string;
  currentModel: string;
  available: string[];
}

export type ProviderType = 'gemini' | 'grok' | 'openai' | 'groq';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  maxTokens: number;
  supportsVision: boolean;
  supportsTools: boolean;
}

export interface ProviderStatus {
  provider: ProviderType;
  name: string;
  configured: boolean;
  currentModel: string;
  available: boolean;
}

export interface ModelsResponse {
  currentProvider: ProviderType;
  currentModel: string;
  providers: ProviderStatus[];
  models: ModelInfo[];
}

/**
 * Envía un mensaje al AI Orchestrator
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await aiClient.post<ChatResponse>('/chat/message', request);
  return response.data;
}

/**
 * Obtiene el historial de una sesión
 */
export async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  const response = await aiClient.get<ChatMessage[]>(`/chat/session/${sessionId}/history`);
  return response.data;
}

/**
 * Limpia el historial de una sesión
 */
export async function clearSession(sessionId: string): Promise<void> {
  await aiClient.delete(`/chat/session/${sessionId}`);
}

/**
 * Obtiene información del proveedor LLM
 */
export async function getProviderInfo(): Promise<ProviderInfo> {
  const response = await aiClient.get<ProviderInfo>('/chat/provider');
  return response.data;
}

/**
 * Obtiene todos los modelos disponibles
 */
export async function getModelsInfo(): Promise<ModelsResponse> {
  const response = await aiClient.get<ModelsResponse>('/chat/models');
  return response.data;
}

/**
 * Cambia el proveedor de LLM
 */
export async function setProvider(provider: ProviderType): Promise<{ success: boolean; message: string }> {
  const response = await aiClient.put('/chat/provider', { provider });
  return response.data;
}

/**
 * Cambia el modelo de LLM
 */
export async function setModel(model: string): Promise<{ success: boolean; message: string }> {
  const response = await aiClient.put('/chat/models', { model });
  return response.data;
}

/**
 * Health check del servicio
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string; provider: string; model: string }> {
  const response = await aiClient.get('/chat/health');
  return response.data;
}

/**
 * Convierte un archivo a Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default aiClient;
