import { MessageCircle, X } from "lucide-react";
import { CHAT_CONFIG } from "@/lib/chat/config";

interface Props {
  open: boolean;
  onClick: () => void;
  label: string;
}

export function ChatButton({ open, onClick, label }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: CHAT_CONFIG.BRAND_COLOR }}
    >
      {!open && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: CHAT_CONFIG.BRAND_COLOR }}
        />
      )}
      <span className="relative">
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </span>
    </button>
  );
}
