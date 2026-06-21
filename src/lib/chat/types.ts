export type ChatRole = "user" | "bot";
export type ChatLanguage = "uz" | "ru";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  error?: boolean;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
}

export interface ChatConfig {
  apiBaseUrl: string;
  timeoutMs: number;
  maxMessageLength: number;
}
