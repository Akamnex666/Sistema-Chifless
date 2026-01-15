import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import { ChatMessage } from '../llm/interfaces/llm-provider.interface';
import { InteractionLog } from './interfaces/interaction-log.interface';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * Endpoint principal para procesar mensajes
   * POST /chat/message
   */
  @Post('message')
  @HttpCode(HttpStatus.OK)
  async handleMessage(@Body() chatDto: ChatDto): Promise<ChatResponseDto> {
    this.logger.log(`Nuevo mensaje recibido: ${chatDto.text.substring(0, 50)}...`);
    return this.chatService.processMessage(chatDto);
  }

  /**
   * Obtiene el historial de una sesión
   * GET /chat/session/:sessionId/history
   */
  @Get('session/:sessionId/history')
  getSessionHistory(@Param('sessionId') sessionId: string): ChatMessage[] {
    return this.chatService.getSessionHistory(sessionId);
  }

  /**
   * Limpia el historial de una sesión
   * DELETE /chat/session/:sessionId
   */
  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearSession(@Param('sessionId') sessionId: string): void {
    this.chatService.clearSession(sessionId);
    this.logger.log(`Sesión ${sessionId} limpiada`);
  }

  /**
   * Obtiene los logs de interacciones
   * GET /chat/logs
   * GET /chat/logs/:sessionId
   */
  @Get('logs')
  getAllLogs(): InteractionLog[] {
    return this.chatService.getInteractionLogs();
  }

  @Get('logs/:sessionId')
  getSessionLogs(@Param('sessionId') sessionId: string): InteractionLog[] {
    return this.chatService.getInteractionLogs(sessionId);
  }

  /**
   * Obtiene información del proveedor actual
   * GET /chat/provider
   */
  @Get('provider')
  getProviderInfo() {
    return this.chatService.getProviderInfo();
  }

  /**
   * Health check del servicio de chat
   * GET /chat/health
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: this.chatService.getProviderInfo(),
    };
  }
}
