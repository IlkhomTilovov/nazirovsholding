import { Trash2, X } from "lucide-react";
import { CHAT_CONFIG } from "@/lib/chat/config";

interface Props {
  title: string;
  onlineLabel: string;
  clearLabel: string;
  closeLabel: string;
  onClear: () => void;
  onClose: () => void;
}

export function ChatHeader({
  title,
  onlineLabel,
  clearLabel,
  closeLabel,
  onClear,
  onClose,
}: Props) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 text-white"
      style={{ backgroundColor: CHAT_CONFIG.BRAND_COLOR }}
    >
      <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm">
        TK
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="flex items-center gap-1.5 text-xs opacity-90">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          {onlineLabel}
        </div>
      </div>
      <button
        type="button"
        aria-label={clearLabel}
        title={clearLabel}
        onClick={onClear}
        className="p-1.5 rounded-md hover:bg-white/15 transition"
      >
        <Trash2 size={16} />
      </button>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="p-1.5 rounded-md hover:bg-white/15 transition"
      >
        <X size={18} />
      </button>
    </div>
  );
}
