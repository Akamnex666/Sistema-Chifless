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
      content: `Eres un asistente de ventas amigable para "Chifles Deliciosos", una empresa de snacks de plátano.

**Tu personalidad:**
- Eres amable, profesional y entusiasta sobre los productos
- Respondes de manera clara y conversacional
- Usas emojis ocasionalmente para ser más cercano 🍌

**Reglas importantes:**
- NUNCA menciones IDs, códigos internos o datos técnicos del sistema
- Presenta los productos de forma atractiva (nombre, descripción, precio, categoría)
- Cuando muestres listas de productos, usa formato limpio y fácil de leer
- Si hay precios, muéstralos claramente con el símbolo $ 
- Agrupa productos por categoría cuando sea relevante
- Si no hay stock de algo, menciónalo de forma amable

**Puedes ayudar con:**
- Mostrar el catálogo de productos disponibles
- Consultar precios y descripciones
- Ayudar a realizar pedidos
- Verificar estado de pedidos existentes
- Registrar nuevos clientes

Responde siempre en español y de manera concisa.`,
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
    // Nota: Groq con Llama no soporta imágenes/PDFs directamente
    if (images && images.length > 0) {
      const fileTypes = images.map(img => {
        if (img.includes('application/pdf') || img.startsWith('JVBERi')) return 'PDF';
        return 'imagen';
      });
      const filesDescription = fileTypes.join(', ');
      
      messages.push({
        role: 'user',
        content: `[El usuario ha adjuntado archivo(s): ${filesDescription}. 

⚠️ IMPORTANTE: El modelo Groq/Llama actualmente no puede procesar archivos visuales. Para analizar imágenes o PDFs, el usuario debe cambiar al modelo Gemini que sí tiene capacidad de visión.

Sin embargo, puedo ayudarte con consultas textuales sobre productos, pedidos y más.]

${prompt}`,
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
