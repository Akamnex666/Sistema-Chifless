import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Part, Content } from '@google/generative-ai';
import {
  LLMProvider,
  LLMResponse,
  ChatMessage,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider implements LLMProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY no está configurada');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';
  }

  getName(): string {
    return 'Gemini';
  }

  async generateResponse(
    prompt: string,
    images: string[] = [],
    history: ChatMessage[] = [],
    tools: any[] = [],
  ): Promise<LLMResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: this.getSystemPrompt(),
      });

      // Construir el contenido con imágenes si las hay
      const parts: Part[] = [];

      // Agregar texto
      parts.push({ text: prompt });

      // Agregar imágenes si existen
      for (const imageBase64 of images) {
        // Detectar tipo de imagen
        const mimeType = this.detectMimeType(imageBase64);
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }

      // Construir historial para el chat
      const chatHistory: Content[] = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Configurar herramientas si existen
      const generationConfig: any = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      };

      // Si hay herramientas, configurarlas
      let modelWithTools = model;
      if (tools.length > 0) {
        modelWithTools = this.genAI.getGenerativeModel({
          model: this.modelName,
          systemInstruction: this.getSystemPrompt(),
          tools: [{ functionDeclarations: tools }],
        });
      }

      // Iniciar chat con historial
      const chat = modelWithTools.startChat({
        history: chatHistory,
        generationConfig,
      });

      // Enviar mensaje
      const result = await chat.sendMessage(parts);
      const response = result.response;

      // Procesar respuesta
      const text = response.text();
      const functionCalls = response.functionCalls();

      const llmResponse: LLMResponse = {
        text,
        finishReason: response.candidates?.[0]?.finishReason,
      };

      // Si hay llamadas a funciones
      if (functionCalls && functionCalls.length > 0) {
        llmResponse.toolCalls = functionCalls.map((fc) => ({
          name: fc.name,
          args: fc.args as Record<string, any>,
        }));
      }

      return llmResponse;
    } catch (error) {
      this.logger.error('Error al generar respuesta con Gemini:', error);
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
    if (base64.startsWith('data:application/pdf')) return 'application/pdf';
    return 'image/jpeg'; // Default
  }
}
