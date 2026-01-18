import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMResponse, ChatMessage, LLMProvider } from './interfaces/llm-provider.interface';
import {
  ProviderType,
  ProviderStatus,
  ModelsResponse,
  ModelInfo,
  AVAILABLE_MODELS,
  getModelsByProvider,
  getModelInfo,
} from './interfaces/model-config.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { GrokProvider } from './providers/grok.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { GroqProvider } from './providers/groq.provider';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private currentProvider: ProviderType = 'gemini';
  private currentModel: string;

  constructor(
    private configService: ConfigService,
    private geminiProvider: GeminiProvider,
    private grokProvider: GrokProvider,
    private openaiProvider: OpenAIProvider,
    private groqProvider: GroqProvider,
  ) {
    // Determinar proveedor inicial desde env
    const defaultProvider = this.configService.get<string>('DEFAULT_LLM_PROVIDER') as ProviderType;
    if (defaultProvider && ['gemini', 'grok', 'openai', 'groq'].includes(defaultProvider)) {
      this.currentProvider = defaultProvider;
    }

    // Determinar modelo inicial
    if (this.currentProvider === 'grok') {
      this.currentModel = this.configService.get<string>('GROK_MODEL') || 'grok-2-latest';
    } else if (this.currentProvider === 'openai') {
      this.currentModel = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    } else if (this.currentProvider === 'groq') {
      this.currentModel = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    } else {
      this.currentModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
    }

    this.logger.log(`LLM Service inicializado con ${this.currentProvider} (${this.currentModel})`);
  }

  /**
   * Obtiene el proveedor activo
   */
  private getActiveProvider(): LLMProvider {
    switch (this.currentProvider) {
      case 'grok':
        return this.grokProvider;
      case 'openai':
        return this.openaiProvider;
      case 'groq':
        return this.groqProvider;
      case 'gemini':
      default:
        return this.geminiProvider;
    }
  }

  /**
   * Obtiene el nombre del proveedor actual
   */
  getCurrentProvider(): string {
    return this.getActiveProvider().getName();
  }

  /**
   * Obtiene el tipo de proveedor actual
   */
  getCurrentProviderType(): ProviderType {
    return this.currentProvider;
  }

  /**
   * Obtiene el modelo actual
   */
  getCurrentModel(): string {
    return this.currentModel;
  }

  /**
   * Lista los proveedores disponibles
   */
  getAvailableProviders(): string[] {
    return ['gemini', 'grok', 'openai', 'groq'];
  }

  /**
   * Obtiene el estado de todos los proveedores
   */
  getProvidersStatus(): ProviderStatus[] {
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    const grokKey = this.configService.get<string>('GROK_API_KEY');
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    const groqKey = this.configService.get<string>('GROQ_API_KEY');

    return [
      {
        provider: 'gemini',
        name: 'Google Gemini',
        configured: !!geminiKey,
        currentModel: this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash',
        available: !!geminiKey,
      },
      {
        provider: 'grok',
        name: 'xAI Grok',
        configured: !!grokKey,
        currentModel: this.configService.get<string>('GROK_MODEL') || 'grok-2-latest',
        available: !!grokKey,
      },
      {
        provider: 'openai',
        name: 'OpenAI',
        configured: !!openaiKey,
        currentModel: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        available: !!openaiKey,
      },
      {
        provider: 'groq',
        name: 'Groq (Gratis)',
        configured: !!groqKey,
        currentModel: this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile',
        available: !!groqKey,
      },
    ];
  }

  /**
   * Obtiene información completa de modelos y proveedores
   */
  getModelsInfo(): ModelsResponse {
    return {
      currentProvider: this.currentProvider,
      currentModel: this.currentModel,
      providers: this.getProvidersStatus(),
      models: AVAILABLE_MODELS,
    };
  }

  /**
   * Obtiene modelos disponibles para un proveedor
   */
  getModelsForProvider(provider: ProviderType): ModelInfo[] {
    return getModelsByProvider(provider);
  }

  /**
   * Cambia el proveedor activo
   */
  setProvider(provider: ProviderType): { success: boolean; message: string } {
    const status = this.getProvidersStatus().find((p) => p.provider === provider);
    
    if (!status) {
      throw new BadRequestException(`Proveedor '${provider}' no reconocido. Proveedores válidos: gemini, grok, openai`);
    }

    if (!status.available) {
      throw new BadRequestException(
        `Proveedor '${provider}' no está configurado. Agrega ${provider.toUpperCase()}_API_KEY en .env`,
      );
    }

    this.currentProvider = provider;
    this.currentModel = status.currentModel;
    
    this.logger.log(`Proveedor cambiado a ${provider} (${this.currentModel})`);
    
    return {
      success: true,
      message: `Proveedor cambiado a ${status.name} con modelo ${this.currentModel}`,
    };
  }

  /**
   * Cambia el modelo activo
   */
  setModel(modelId: string): { success: boolean; message: string } {
    const modelInfo = getModelInfo(modelId);
    
    if (!modelInfo) {
      const availableIds = AVAILABLE_MODELS.map((m) => m.id).join(', ');
      throw new BadRequestException(
        `Modelo '${modelId}' no reconocido. Modelos disponibles: ${availableIds}`,
      );
    }

    // Verificar que el proveedor del modelo esté configurado
    const providerStatus = this.getProvidersStatus().find((p) => p.provider === modelInfo.provider);
    if (!providerStatus?.available) {
      throw new BadRequestException(
        `El modelo '${modelId}' requiere el proveedor ${modelInfo.provider} que no está configurado`,
      );
    }

    this.currentProvider = modelInfo.provider;
    this.currentModel = modelId;
    
    this.logger.log(`Modelo cambiado a ${modelId} (${modelInfo.provider})`);
    
    return {
      success: true,
      message: `Modelo cambiado a ${modelInfo.name} (${modelInfo.provider})`,
    };
  }

  /**
   * Genera una respuesta usando el proveedor activo
   */
  async generateResponse(
    prompt: string,
    images?: string[],
    history?: ChatMessage[],
    tools?: any[],
  ): Promise<LLMResponse> {
    const provider = this.getActiveProvider();
    this.logger.debug(`Generando respuesta con ${provider.getName()} (${this.currentModel})`);
    
    try {
      return await provider.generateResponse(prompt, images, history, tools);
    } catch (error) {
      // Manejar error de cuota excedida (429)
      if (error.status === 429) {
        const retryMatch = error.message?.match(/retry in (\d+\.?\d*)/i);
        const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
        
        this.logger.warn(`Cuota de ${provider.getName()} excedida. Reintentar en ${retrySeconds} segundos`);
        
        // Retornar respuesta amigable en lugar de error
        return {
          text: `⚠️ **Límite de API alcanzado**\n\nHe excedido temporalmente el límite de solicitudes de ${provider.getName()}. Por favor espera **${retrySeconds} segundos** e intenta de nuevo.\n\n_Tip: Los límites se reinician cada minuto._`,
          toolCalls: [],
          finishReason: 'rate_limit',
        };
      }
      
      throw error;
    }
  }
}
