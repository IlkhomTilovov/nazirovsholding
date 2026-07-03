import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import {
  CHAT_CONFIG,
  SUGGESTED_QUESTIONS,
  UI_TEXT,
  WELCOME_MESSAGES,
} from "@/lib/chat/config";
import type { ChatLanguage, ChatMessage } from "@/lib/chat/types";
import { clearConversation, sendMessage } from "@/lib/chat/chatService";
import { ChatButton } from "./ChatButton";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatWidget() {
  const { language } = useLanguage();
  const { settings } = useSystemSettings();
  const lang: ChatLanguage = language === "ru" ? "ru" : "uz";
  const t = UI_TEXT[lang];

  // Admin paneldan yoqilmagan bo'lsa — widgetni umuman ko'rsatmaslik
  if (!settings?.chat_enabled) return null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_CONFIG.STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_CONFIG.STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Welcome message when opened with empty history
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: uid(),
          role: "bot",
          content: WELCOME_MESSAGES[lang],
          timestamp: Date.now(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const showSuggested = useMemo(
    () => messages.filter((m) => m.role === "user").length === 0,
    [messages],
  );

  const handleSend = async (text: string) => {
    setError(null);
    setLastUserMessage(text);
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const res = await sendMessage(text, lang);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "bot",
          content: res.reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError(t.error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
    await clearConversation();
  };

  const handleRetry = () => {
    if (lastUserMessage) handleSend(lastUserMessage);
  };

  return (
    <>
      <ChatButton
        open={open}
        onClick={() => setOpen((o) => !o)}
        label={open ? t.close : t.open}
      />

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="fixed z-[59] bg-card border shadow-2xl flex flex-col overflow-hidden animate-scale-in
            bottom-24 right-5 w-[380px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl
            max-sm:bottom-20 max-sm:right-3 max-sm:left-3 max-sm:w-auto max-sm:h-[calc(100vh-6rem)]"
        >
          <ChatHeader
            title={t.title}
            onlineLabel={t.online}
            clearLabel={t.clear}
            closeLabel={t.close}
            onClear={handleClear}
            onClose={() => setOpen(false)}
          />
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            errorText={error ?? undefined}
            retryLabel={t.retry}
            onRetry={lastUserMessage ? handleRetry : undefined}
          />
          {showSuggested && (
            <SuggestedQuestions
              label={t.suggested}
              questions={SUGGESTED_QUESTIONS[lang]}
              onPick={(q) => handleSend(q)}
            />
          )}
          <ChatInput
            placeholder={t.placeholder}
            sendLabel={t.send}
            disabled={isTyping}
            onSend={handleSend}
          />
        </div>
      )}
    </>
  );
}
