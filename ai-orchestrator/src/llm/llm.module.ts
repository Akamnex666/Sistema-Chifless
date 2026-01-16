import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMService } from './llm.service';
import { GeminiProvider } from './providers/gemini.provider';
import { GrokProvider } from './providers/grok.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { GroqProvider } from './providers/groq.provider';

@Module({
  imports: [ConfigModule],
  providers: [LLMService, GeminiProvider, GrokProvider, OpenAIProvider, GroqProvider],
  exports: [LLMService],
})
export class LLMModule {}
