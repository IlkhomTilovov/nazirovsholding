// Chat widget configuration
// Backend developer: replace API_BASE_URL with real chatbot endpoint

export const CHAT_CONFIG = {
  API_BASE_URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
  TIMEOUT_MS: 20000,
  MAX_MESSAGE_LENGTH: 1000,
  STORAGE_KEY: "tk-chat-history-v1",
  CONVERSATION_ID_KEY: "tk-chat-conversation-id",
  BRAND_COLOR: "#6B3E26",
};

export const WELCOME_MESSAGES: Record<"uz" | "ru", string> = {
  uz: "Assalomu alaykum! Sizga zamoklar, eshiklar, santexnika va qurilish lesalari bo'yicha yordam beraman.",
  ru: "Здравствуйте! Я помогу вам с умными замками, дверями, сантехникой и строительными лесами.",
};

export const SUGGESTED_QUESTIONS: Record<"uz" | "ru", string[]> = {
  uz: [
    "Smart zamoklar haqida",
    "Eshiklar katalogi",
    "Santexnika mahsulotlari",
    "Lesa narxlari",
    "Yetkazib berish",
    "Kontaktlar",
  ],
  ru: [
    "Об умных замках",
    "Каталог дверей",
    "Сантехника",
    "Цены на леса",
    "Доставка",
    "Контакты",
  ],
};

export const UI_TEXT: Record<"uz" | "ru", Record<string, string>> = {
  uz: {
    title: "TILLA KAMILOV AI Assistant",
    online: "Onlayn",
    placeholder: "Savolingizni yozing...",
    send: "Yuborish",
    clear: "Suhbatni tozalash",
    error: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
    retry: "Qayta urinish",
    typing: "Yozmoqda",
    suggested: "Tez savollar",
    close: "Yopish",
    open: "Chatni ochish",
  },
  ru: {
    title: "TILLA KAMILOV AI Assistant",
    online: "Онлайн",
    placeholder: "Напишите ваш вопрос...",
    send: "Отправить",
    clear: "Очистить чат",
    error: "Произошла ошибка. Пожалуйста, попробуйте снова.",
    retry: "Повторить",
    typing: "Печатает",
    suggested: "Быстрые вопросы",
    close: "Закрыть",
    open: "Открыть чат",
  },
};
