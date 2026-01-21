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
    this.logger.log(`Gemini Provider inicializado con modelo: ${this.modelName}`);
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

      // Construir el contenido con imágenes/PDFs si los hay
      const parts: Part[] = [];

      // Agregar texto
      parts.push({ text: prompt });

      // Agregar imágenes o PDFs si existen
      for (const fileBase64 of images) {
        const mimeType = this.detectMimeType(fileBase64);
        const cleanBase64 = this.cleanBase64(fileBase64);
        
        this.logger.debug(`Procesando archivo: ${mimeType}`);
        
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
    return `Eres un asistente virtual inteligente para "Chifles Deliciosos", una empresa que produce y vende chifles (chips de plátano).

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

**Capacidades especiales:**
- Puedes analizar imágenes de listas de pedidos, facturas o documentos
- Puedes procesar documentos PDF y extraer información relevante
- Cuando recibas una imagen o PDF de un pedido:
  1. Analiza cuidadosamente el contenido
  2. Extrae los productos y cantidades mencionados
  3. Sugiere usar las herramientas disponibles para crear el pedido

**Puedes ayudar con:**
- Mostrar el catálogo de productos disponibles
- Consultar precios y descripciones
- Ayudar a realizar pedidos
- Verificar estado de pedidos existentes
- Registrar nuevos clientes
- Analizar documentos de pedidos (imágenes o PDFs)

Siempre responde en español de manera amable y profesional.
Si no puedes realizar una acción, explica claramente por qué.`;
  }

  private detectMimeType(base64: string): string {
    if (base64.startsWith('data:image/png')) return 'image/png';
    if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/jpg')) return 'image/jpeg';
    if (base64.startsWith('data:image/gif')) return 'image/gif';
    if (base64.startsWith('data:image/webp')) return 'image/webp';
    if (base64.startsWith('data:application/pdf')) return 'application/pdf';
    // Si no tiene prefijo, intentar detectar por contenido
    const cleanData = this.cleanBase64(base64);
    if (cleanData.startsWith('JVBERi')) return 'application/pdf'; // PDF magic bytes
    if (cleanData.startsWith('iVBOR')) return 'image/png'; // PNG magic bytes
    if (cleanData.startsWith('/9j/')) return 'image/jpeg'; // JPEG magic bytes
    return 'image/jpeg'; // Default
  }

  private cleanBase64(base64: string): string {
    // Eliminar prefijo data:*;base64,
    return base64.replace(/^data:[^;]+;base64,/, '');
  }
}
