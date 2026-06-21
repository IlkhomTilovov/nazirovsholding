// Single API service layer for the chat widget.
// Backend developer: implement these methods against the real API.
// UI components must NOT call fetch directly — they call this service.

import { CHAT_CONFIG } from "./config";
import type { ChatLanguage, ChatResponse } from "./types";

function getConversationId(): string | null {
  try {
    return localStorage.getItem(CHAT_CONFIG.CONVERSATION_ID_KEY);
  } catch {
    return null;
  }
}

function setConversationId(id: string) {
  try {
    localStorage.setItem(CHAT_CONFIG.CONVERSATION_ID_KEY, id);
  } catch {
    /* ignore */
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

/**
 * Send a user message to the chatbot backend.
 * Currently returns a mocked reply — replace fetch call with real endpoint.
 */
export async function sendMessage(
  message: string,
  language: ChatLanguage,
  history?: Array<{ role: string; content: string }>,
): Promise<ChatResponse> {
  const conversationId = getConversationId();

  const res = await withTimeout(
    fetch(CHAT_CONFIG.API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ message, language, conversationId, history }),
    }),
    CHAT_CONFIG.TIMEOUT_MS,
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as ChatResponse;
  if (data.conversationId) setConversationId(data.conversationId);
  return data;
}

/** Backend health check — used by future status indicator. */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await withTimeout(
      fetch(`${CHAT_CONFIG.API_BASE_URL}/health`),
      5000,
    );
    return res.ok;
  } catch {
    return true; // mock: always healthy
  }
}

/** Reset conversation state on the server (and locally). */
export async function clearConversation(): Promise<void> {
  const conversationId = getConversationId();
  try {
    await withTimeout(
      fetch(`${CHAT_CONFIG.API_BASE_URL}/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      }),
      5000,
    );
  } catch {
    /* ignore — mock */
  }
  try {
    localStorage.removeItem(CHAT_CONFIG.CONVERSATION_ID_KEY);
  } catch {
    /* ignore */
  }
}
