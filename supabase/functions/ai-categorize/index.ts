const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { note, amount, type, history } = await req.json();
    if (!note || typeof note !== "string") {
      return new Response(JSON.stringify({ error: "note required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const expenseCats = ["Food", "Travel", "Rent", "Bills", "Shopping", "Health", "Entertainment", "Education", "Other"];
    const incomeCats = ["Salary", "Freelance", "Business", "Investment", "Other"];
    const cats = type === "income" ? incomeCats : expenseCats;

    // Build hint from history (past note -> category map)
    const historyHint = Array.isArray(history) && history.length > 0
      ? `\n\nUser's past patterns:\n${history.slice(0, 15).map((h: any) => `- "${h.note}" → ${h.category}`).join("\n")}`
      : "";

    const systemPrompt = `You are a financial transaction categorizer. Given a transaction note and amount, pick the BEST matching category from this list: ${cats.join(", ")}.
Respond ONLY by calling the categorize tool. Use past patterns when available.${historyHint}`;

    const userMsg = `Note: "${note}"\nAmount: ${amount}\nType: ${type}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        tools: [{
          type: "function",
          function: {
            name: "categorize",
            description: "Return the best category and confidence",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: cats },
                confidence: { type: "number", description: "0 to 1" },
                tag: { type: "string", description: "Optional sub-tag like 'Zomato', 'Uber'" },
              },
              required: ["category", "confidence"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "categorize" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No category returned" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-categorize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
