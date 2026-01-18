export interface InteractionLog {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'input' | 'output' | 'tool_call' | 'tool_result';
  content: any;
}
