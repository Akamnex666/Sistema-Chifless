import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../llm/llm.service';
import { McpToolsService, ToolResult } from '../mcp/mcp-tools.service';
import { getToolsForGemini } from '../mcp/tools/tool-definitions';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import { ChatMessage } from '../llm/interfaces/llm-provider.interface';
import { InteractionLog } from './interfaces/interaction-log.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private interactionLogs: InteractionLog[] = [];
  private sessions: Map<string, ChatMessage[]> = new Map();

  constructor(
    private llmService: LLMService,
    private mcpToolsService: McpToolsService,
  ) {}

  /**
   * Procesa un mensaje del usuario y genera una respuesta
   */
  async processMessage(chatDto: ChatDto): Promise<ChatResponseDto> {
    const sessionId = chatDto.sessionId || uuidv4();
    const toolsUsed: string[] = [];

    // Obtener o crear historial de sesión
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    const sessionHistory = this.sessions.get(sessionId)!;

    // Log de entrada
    this.logInteraction({
      id: uuidv4(),
      sessionId,
      timestamp: new Date(),
      type: 'input',
      content: {
        text: chatDto.text,
        hasImage: !!(chatDto.image || chatDto.images?.length),
      },
    });

    try {
      // Preparar imágenes
      const images: string[] = [];
      if (chatDto.image) images.push(chatDto.image);
      if (chatDto.images) images.push(...chatDto.images);

      // Combinar historial del DTO con el de la sesión
      const fullHistory = [
        ...sessionHistory,
        ...(chatDto.history || []),
      ];

      // Obtener definición de herramientas
      const tools = getToolsForGemini();

      // Primera llamada al LLM
      let response = await this.llmService.generateResponse(
        chatDto.text,
        images,
        fullHistory,
        tools,
      );

      this.logger.debug(`Respuesta inicial del LLM: ${JSON.stringify(response)}`);

      // Si el LLM quiere usar herramientas, procesarlas
      let maxIterations = 5; // Evitar loops infinitos
      while (response.toolCalls && response.toolCalls.length > 0 && maxIterations > 0) {
        this.logger.log(`LLM solicita ${response.toolCalls.length} herramienta(s)`);

        // Ejecutar cada herramienta
        const toolResults: { name: string; result: ToolResult }[] = [];
        
        for (const toolCall of response.toolCalls) {
          // Log de llamada a herramienta
          this.logInteraction({
            id: uuidv4(),
            sessionId,
            timestamp: new Date(),
            type: 'tool_call',
            content: toolCall,
          });

          toolsUsed.push(toolCall.name);
          const result = await this.mcpToolsService.executeTool(toolCall);
          
          // Log de resultado de herramienta
          this.logInteraction({
            id: uuidv4(),
            sessionId,
            timestamp: new Date(),
            type: 'tool_result',
            content: { tool: toolCall.name, result },
          });

          toolResults.push({ name: toolCall.name, result });
        }

        // Construir mensaje con resultados de herramientas
        const toolResultsText = toolResults
          .map((tr) => {
            const status = tr.result.success ? '✅' : '❌';
            const data = tr.result.success
              ? JSON.stringify(tr.result.data, null, 2)
              : tr.result.error;
            return `${status} Resultado de ${tr.name}:\n${data}`;
          })
          .join('\n\n');

        // Llamar nuevamente al LLM con los resultados
        const updatedHistory: ChatMessage[] = [
          ...fullHistory,
          { role: 'user', content: chatDto.text },
          { role: 'assistant', content: response.text || '' },
          { role: 'user', content: `Resultados de las herramientas:\n${toolResultsText}` },
        ];

        response = await this.llmService.generateResponse(
          'Por favor, responde al usuario basándote en los resultados de las herramientas.',
          [],
          updatedHistory,
          tools,
        );

        maxIterations--;
      }

      // Actualizar historial de sesión
      sessionHistory.push(
        { role: 'user', content: chatDto.text },
        { role: 'assistant', content: response.text },
      );

      // Limitar tamaño del historial (últimos 20 mensajes)
      if (sessionHistory.length > 20) {
        sessionHistory.splice(0, sessionHistory.length - 20);
      }

      // Log de salida
      this.logInteraction({
        id: uuidv4(),
        sessionId,
        timestamp: new Date(),
        type: 'output',
        content: {
          text: response.text,
          toolsUsed,
        },
      });

      return {
        text: response.text,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        sessionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error procesando mensaje:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de una sesión
   */
  getSessionHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId) || [];
  }

  /**
   * Limpia el historial de una sesión
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Obtiene los logs de interacciones (para debugging/auditoría)
   */
  getInteractionLogs(sessionId?: string): InteractionLog[] {
    if (sessionId) {
      return this.interactionLogs.filter((log) => log.sessionId === sessionId);
    }
    return this.interactionLogs;
  }

  /**
   * Registra una interacción
   */
  private logInteraction(log: InteractionLog): void {
    this.interactionLogs.push(log);
    
    // Limitar a últimos 1000 logs
    if (this.interactionLogs.length > 1000) {
      this.interactionLogs.shift();
    }

    this.logger.debug(`[${log.type}] ${log.sessionId}: ${JSON.stringify(log.content)}`);
  }

  /**
   * Obtiene información del proveedor actual
   */
  getProviderInfo(): { current: string; available: string[] } {
    return {
      current: this.llmService.getCurrentProvider(),
      available: this.llmService.getAvailableProviders(),
    };
  }
}
