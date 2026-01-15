export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export interface LLMResponse {
  text: string;
  toolCalls?: ToolCall[];
  finishReason?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCallId?: string;
  toolName?: string;
}

export interface LLMProvider {
  /**
   * Genera una respuesta del LLM
   * @param prompt - Texto del usuario
   * @param images - Imágenes en Base64 (opcional)
   * @param history - Historial de conversación (opcional)
   * @param tools - Definición de herramientas disponibles (opcional)
   */
  generateResponse(
    prompt: string,
    images?: string[],
    history?: ChatMessage[],
    tools?: any[],
  ): Promise<LLMResponse>;

  /**
   * Nombre del proveedor
   */
  getName(): string;
}
