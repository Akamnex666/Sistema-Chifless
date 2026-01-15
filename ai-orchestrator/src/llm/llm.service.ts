import { Injectable, Logger } from '@nestjs/common';
import { LLMResponse, ChatMessage } from './interfaces/llm-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(private geminiProvider: GeminiProvider) {
    this.logger.log('LLM Service inicializado con Gemini');
  }

  /**
   * Obtiene el nombre del proveedor
   */
  getCurrentProvider(): string {
    return this.geminiProvider.getName();
  }

  /**
   * Lista los proveedores disponibles
   */
  getAvailableProviders(): string[] {
    return ['gemini'];
  }

  /**
   * Genera una respuesta usando Gemini
   */
  async generateResponse(
    prompt: string,
    images?: string[],
    history?: ChatMessage[],
    tools?: any[],
  ): Promise<LLMResponse> {
    this.logger.debug('Generando respuesta con Gemini');
    
    try {
      return await this.geminiProvider.generateResponse(prompt, images, history, tools);
    } catch (error) {
      // Manejar error de cuota excedida (429)
      if (error.status === 429) {
        const retryMatch = error.message?.match(/retry in (\d+\.?\d*)/i);
        const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
        
        this.logger.warn(`Cuota de Gemini excedida. Reintentar en ${retrySeconds} segundos`);
        
        // Retornar respuesta amigable en lugar de error
        return {
          text: `⚠️ **Límite de API alcanzado**\n\nHe excedido temporalmente el límite de solicitudes de Gemini. Por favor espera **${retrySeconds} segundos** e intenta de nuevo.\n\n_Tip: Los límites se reinician cada minuto._`,
          toolCalls: [],
          finishReason: 'rate_limit',
        };
      }
      
      throw error;
    }
  }
}
