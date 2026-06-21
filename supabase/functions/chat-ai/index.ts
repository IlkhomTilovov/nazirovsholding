// TILLA KAMILOV Chat Bot API endpoint
// =====================================
// Bu endpoint frontend chat widget tomonidan chaqiriladi.
// Backendchi: shu fayl ichidagi logikani o'zingizning chatbot AI bilan almashtiring.
//
// So'rov (POST):
//   {
//     "message": "string",            // foydalanuvchi xabari
//     "language": "uz" | "ru",        // sayt tili
//     "conversationId": "string|null",// suhbat ID (yangi bo'lsa null)
//     "history": [{ role, content }]  // oxirgi xabarlar (ixtiyoriy)
//   }
//
// Javob (200):
//   {
//     "reply": "string",              // bot javobi (markdown qo'llab-quvvatlanadi)
//     "conversationId": "string"      // suhbat ID
//   }

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ChatRequest {
  message?: string;
  language?: "uz" | "ru";
  conversationId?: string | null;
  history?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const message = (body.message ?? "").toString().trim();
  const language = body.language === "ru" ? "ru" : "uz";
  const conversationId = body.conversationId || crypto.randomUUID();

  if (!message) {
    return new Response(
      JSON.stringify({ error: "message is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ===== PLACEHOLDER javob =====
  // Backendchi: shu blokni o'zingizning chatbot chaqiruvi bilan almashtiring.
  const reply = language === "ru"
    ? `Здравствуйте! (заглушка) Вы написали: "${message}". Здесь будет ответ AI-ассистента TILLA KAMILOV.`
    : `Assalomu alaykum! (placeholder) Siz yozdingiz: "${message}". Bu yerda TILLA KAMILOV AI yordamchisining javobi bo'ladi.`;

  return new Response(
    JSON.stringify({ reply, conversationId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
