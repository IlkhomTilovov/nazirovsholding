import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "@/lib/chat/types";
import { CHAT_CONFIG } from "@/lib/chat/config";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  errorText?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessages({
  messages,
  isTyping,
  errorText,
  retryLabel,
  onRetry,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div
            key={m.id}
            className={`flex flex-col animate-fade-in ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                isUser
                  ? "text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              } ${m.error ? "border border-destructive/40" : ""}`}
              style={isUser ? { backgroundColor: CHAT_CONFIG.BRAND_COLOR } : undefined}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none break-words [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 px-1">
              {formatTime(m.timestamp)}
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-start animate-fade-in">
          <div className="bg-muted rounded-2xl rounded-bl-sm">
            <TypingIndicator />
          </div>
        </div>
      )}

      {errorText && (
        <div className="flex flex-col items-center gap-2 text-center text-xs text-destructive py-2">
          <div>{errorText}</div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 rounded-md border border-destructive/40 hover:bg-destructive/10 transition"
            >
              {retryLabel}
            </button>
          )}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
