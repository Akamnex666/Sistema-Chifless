import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMProvider,
  LLMResponse,
  ChatMessage,
} from '../interfaces/llm-provider.interface';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | OpenAIContentPart[];
  tool_call_id?: string;
}

interface OpenAIContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
    tool_calls?: OpenAIToolCall[];
  };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private apiKey: string;
  private modelName: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.modelName = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY no está configurada');
    }
  }

  getName(): string {
    return 'OpenAI';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateResponse(
    prompt: string,
    images: string[] = [],
    history: ChatMessage[] = [],
    tools: any[] = [],
  ): Promise<LLMResponse> {
    try {
      const messages: OpenAIMessage[] = [];

      // System prompt
      messages.push({
        role: 'system',
        content: this.getSystemPrompt(),
      });

      // Historial de conversación
      for (const msg of history) {
        if (msg.role === 'tool') {
          messages.push({
            role: 'tool',
            content: msg.content,
            tool_call_id: msg.toolCallId,
          });
        } else {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      }

      // Mensaje actual con imágenes si las hay
      if (images.length > 0) {
        const contentParts: OpenAIContentPart[] = [
          { type: 'text', text: prompt },
        ];

        for (const imageBase64 of images) {
          // Asegurar formato correcto data URL
          let imageUrl = imageBase64;
          if (!imageBase64.startsWith('data:')) {
            const mimeType = this.detectMimeType(imageBase64);
            imageUrl = `data:${mimeType};base64,${imageBase64}`;
          }

          contentParts.push({
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'auto',
            },
          });
        }

        messages.push({
          role: 'user',
          content: contentParts,
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt,
        });
      }

      // Construir body de la petición
      const requestBody: any = {
        model: this.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      };

      // Agregar herramientas si existen
      if (tools.length > 0) {
        requestBody.tools = tools.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        }));
        requestBody.tool_choice = 'auto';
      }

      this.logger.debug(`Enviando petición a OpenAI: ${this.modelName}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Error de OpenAI API: ${response.status} - ${errorBody}`);
        
        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded, please retry in 60 seconds' };
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
      }

      const data: OpenAIResponse = await response.json();
      const choice = data.choices[0];

      const llmResponse: LLMResponse = {
        text: choice.message.content || '',
        finishReason: choice.finish_reason,
      };

      // Procesar tool calls si existen
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        llmResponse.toolCalls = choice.message.tool_calls.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          args: JSON.parse(tc.function.arguments),
        }));
      }

      this.logger.debug(`Respuesta de OpenAI recibida: ${llmResponse.text.substring(0, 100)}...`);

      return llmResponse;
    } catch (error) {
      this.logger.error('Error al generar respuesta con OpenAI:', error);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `Eres un asistente virtual inteligente para "Sistema Chifles", una empresa que produce y vende chifles (chips de plátano).

Tu rol es ayudar a los clientes y empleados con:
- Consultar productos disponibles y precios
- Crear y gestionar pedidos
- Verificar el estado de pedidos existentes
- Registrar nuevos clientes
- Generar análisis de ventas

Cuando el usuario envíe una imagen de una lista de pedidos, factura o cualquier documento:
1. Analiza cuidadosamente el contenido
2. Extrae los productos y cantidades mencionados
3. Usa las herramientas disponibles para crear el pedido

Siempre responde en español de manera amable y profesional.
Si no puedes realizar una acción, explica claramente por qué.`;
  }

  private detectMimeType(base64: string): string {
    if (base64.startsWith('data:image/png')) return 'image/png';
    if (base64.startsWith('data:image/jpeg')) return 'image/jpeg';
    if (base64.startsWith('data:image/gif')) return 'image/gif';
    if (base64.startsWith('data:image/webp')) return 'image/webp';
    // Detectar por primeros bytes
    if (base64.startsWith('/9j/')) return 'image/jpeg';
    if (base64.startsWith('iVBOR')) return 'image/png';
    if (base64.startsWith('R0lGO')) return 'image/gif';
    return 'image/jpeg'; // Default
  }
}
