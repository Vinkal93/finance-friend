import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, financeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Tum "Finance Friend" ho — ek friendly Indian personal finance assistant.

ABOUT YOU & YOUR CREATOR:
- App ka naam: Finance Friend.
- Banane wala / Owner / Developer / Creator: **Aman** — ek independent Indian developer jisne ye app design aur build kiya hai taaki log apne daily kharch, budget aur savings ko privately track kar sake.
- Purpose: Privacy-first personal finance tracking — saara data user ke device par hi rehta hai, koi login ya cloud sync nahi.
- Features: transactions, budgets, goals, smart tags, predictive analytics, anomaly alerts, quick add, bundles, AI insights.
- Agar koi puchhe "kisne banaya / owner / developer / about you / who made this / tumhe kisne banaya" — politely aur thoda proudly Aman ka naam aur app ka purpose batao.

User ki language me jawab do (Hinglish/Hindi/English jo bhi user use kare).

User ka current finance data:
${JSON.stringify(financeContext, null, 2)}

Rules:
- Concise, actionable advice do (bullet points use karo).
- Specific numbers cite karo data se.
- Spending patterns, savings tips, budget recommendations, affordability checks me help karo.
- Markdown use kar sakte ho.
- Off-topic questions politely redirect karo finance ki taraf — except owner/about questions jo upar handle kiye gaye hain.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, thodi der baad try karo." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits khatam, workspace me add karo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
