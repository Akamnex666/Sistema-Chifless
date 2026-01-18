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

// Configuración de modelos disponibles
export const AVAILABLE_MODELS: ModelInfo[] = [
  // OpenAI Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Modelo rápido y económico de OpenAI, ideal para tareas generales',
    maxTokens: 16384,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Modelo más avanzado de OpenAI con capacidades multimodales',
    maxTokens: 16384,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Versión optimizada de GPT-4 para mayor velocidad',
    maxTokens: 8192,
    supportsVision: true,
    supportsTools: true,
  },
  // Gemini Models (2026)
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Modelo rápido y eficiente de Google, ideal para tareas generales',
    maxTokens: 8192,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'gemini',
    description: 'Versión ligera y más rápida de Gemini 2.0',
    maxTokens: 8192,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'gemini',
    description: 'Modelo avanzado de Google para tareas complejas',
    maxTokens: 8192,
    supportsVision: true,
    supportsTools: true,
  },
  // Grok Models
  {
    id: 'grok-2-latest',
    name: 'Grok 2',
    provider: 'grok',
    description: 'Modelo más avanzado de xAI con capacidades multimodales',
    maxTokens: 4096,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision',
    provider: 'grok',
    description: 'Modelo de xAI optimizado para análisis de imágenes',
    maxTokens: 4096,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'grok',
    description: 'Versión beta de Grok con nuevas características',
    maxTokens: 4096,
    supportsVision: true,
    supportsTools: true,
  },
  // Groq Models (FREE)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    description: 'Modelo potente y gratuito de Meta vía Groq, ideal para tareas complejas',
    maxTokens: 32768,
    supportsVision: false,
    supportsTools: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    description: 'Modelo ultrarrápido y gratuito, perfecto para respuestas instantáneas',
    maxTokens: 8192,
    supportsVision: false,
    supportsTools: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Modelo Mixture of Experts gratuito con gran contexto',
    maxTokens: 32768,
    supportsVision: false,
    supportsTools: true,
  },
];

export function getModelsByProvider(provider: ProviderType): ModelInfo[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
}

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}
