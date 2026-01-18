import { IsString, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  image?: string; // Base64 encoded image

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Multiple Base64 encoded images

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  model?: string; // Modelo específico para esta petición (opcional)
}

export class ChatResponseDto {
  text: string;
  toolsUsed?: string[];
  sessionId: string;
  timestamp: string;
  model?: string; // Modelo usado para la respuesta
  provider?: string; // Proveedor usado
}

export class SetProviderDto {
  @IsString()
  @IsIn(['gemini', 'grok', 'openai', 'groq'])
  provider: 'gemini' | 'grok' | 'openai' | 'groq';
}

export class SetModelDto {
  @IsString()
  model: string;
}
