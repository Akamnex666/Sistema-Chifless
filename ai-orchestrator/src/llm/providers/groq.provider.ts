import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMResponse, ChatMessage, ToolCall } from '../interfaces/llm-provider.interface';

@Injectable()
export class GroqProvider implements LLMProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';

    if (!this.apiKey) {
      this.logger.warn('GROQ_API_KEY no configurada. El proveedor Groq no funcionará.');
    } else {
      this.logger.log(`Groq Provider inicializado con modelo: ${this.model}`);
    }
  }

  getName(): string {
    return 'Groq';
  }

  async generateResponse(
    prompt: string,
    images?: string[],
    history?: ChatMessage[],
    tools?: any[],
  ): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY no está configurada');
    }

    try {
      const messages = this.buildMessages(prompt, images, history);
      
      this.logger.debug(`Enviando petición a Groq: ${this.model}`);

      const requestBody: any = {
        model: this.model,
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      };

      // Groq soporta function calling con modelos Llama 3
      if (tools && tools.length > 0) {
        requestBody.tools = tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters || {},
          },
        }));
        requestBody.tool_choice = 'auto';
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Error de Groq API: ${response.status} - ${errorData}`);
        
        if (response.status === 429) {
          throw {
            status: 429,
            message: 'Rate limit exceeded, please retry in 60 seconds',
          };
        }
        
        throw new Error(`Groq API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      
      if (!choice) {
        throw new Error('No se recibió respuesta de Groq');
      }

      const toolCalls = this.extractToolCalls(choice.message);
      
      return {
        text: choice.message?.content || '',
        toolCalls,
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error) {
      this.logger.error('Error al generar respuesta con Groq:');
      this.logger.error(error);
      throw error;
    }
  }

  private buildMessages(
    prompt: string,
    images?: string[],
    history?: ChatMessage[],
  ): any[] {
    const messages: any[] = [];

    // System prompt
    messages.push({
      role: 'system',
      content: `Eres un asistente inteligente para el sistema de gestión de Chifles (snacks de plátano). 
Ayudas a los usuarios con:
- Consultas sobre productos, precios e inventario
- Gestión de pedidos y órdenes de producción
- Información de clientes y facturación
- Análisis de datos del negocio

Responde de manera concisa, profesional y en español.
Cuando sea apropiado, usa formato Markdown para estructurar tus respuestas.`,
    });

    // Historial de conversación
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Mensaje actual del usuario
    // Nota: Groq con Llama no soporta imágenes directamente, pero podemos mencionar que se recibió una imagen
    if (images && images.length > 0) {
      messages.push({
        role: 'user',
        content: `[El usuario ha adjuntado ${images.length} imagen(es). Por el momento no puedo procesar imágenes, pero puedo ayudarte con cualquier pregunta textual sobre tu sistema de Chifles.]\n\n${prompt}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt,
      });
    }

    return messages;
  }

  private extractToolCalls(message: any): ToolCall[] {
    if (!message?.tool_calls || !Array.isArray(message.tool_calls)) {
      return [];
    }

    return message.tool_calls.map((tc: any) => ({
      id: tc.id,
      name: tc.function?.name || '',
      arguments: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {},
    }));
  }
}
