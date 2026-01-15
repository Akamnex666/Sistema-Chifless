import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
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
}

export class ChatResponseDto {
  text: string;
  toolsUsed?: string[];
  sessionId: string;
  timestamp: string;
}

export class ProviderDto {
  @IsString()
  provider: 'gemini' | 'openai';
}
