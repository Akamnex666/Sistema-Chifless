import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LLMModule } from '../llm/llm.module';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [LLMModule, McpModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
