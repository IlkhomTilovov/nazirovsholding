import { Send } from "lucide-react";
import { useRef, useState, KeyboardEvent } from "react";
import { CHAT_CONFIG } from "@/lib/chat/config";

interface Props {
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
  onSend: (text: string) => void;
}

export function ChatInput({ placeholder, sendLabel, disabled, onSend }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const max = CHAT_CONFIG.MAX_MESSAGE_LENGTH;

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text.slice(0, max));
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t p-2 bg-background">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            const v = e.target.value.slice(0, max);
            setValue(v);
            if (ref.current) {
              ref.current.style.height = "auto";
              ref.current.style.height =
                Math.min(ref.current.scrollHeight, 120) + "px";
            }
          }}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-[120px]"
        />
        <button
          type="button"
          aria-label={sendLabel}
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="h-10 w-10 rounded-xl text-white flex items-center justify-center disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: CHAT_CONFIG.BRAND_COLOR }}
        >
          <Send size={16} />
        </button>
      </div>
      <div className="flex justify-end text-[10px] text-muted-foreground px-1 pt-1">
        {value.length}/{max}
      </div>
    </div>
  );
}
