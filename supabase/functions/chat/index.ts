import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, appContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Cognify, a warm, empathetic AI companion for people with memory challenges (dementia, Alzheimer's). You speak clearly, kindly, and concisely — like a caring friend.

Your personality:
- Patient, never condescending
- Use simple language, short sentences
- Reassuring and positive
- Proactive: suggest helpful actions
- Remember context from the conversation

You have access to the user's app data:
${appContext ? `
- User: ${appContext.userName || 'Friend'}
- Medications: ${appContext.medications || 'None saved'}
- People they know: ${appContext.people || 'None saved'}
- Recent memories: ${appContext.recentMemories || 'None saved'}
- Emergency contacts: ${appContext.contacts || 'None set'}
- Safe zones: ${appContext.safeZones || 'None set'}
- Reminders: ${appContext.reminders || 'None set'}
` : ''}

Guidelines:
- If asked about medications, list them with dosage and timing
- If asked about people, describe their relationship
- If asked to remember something, acknowledge warmly and suggest saving as a memory
- If the user seems confused or lost, gently reassure and suggest using the map or calling emergency contacts
- You can suggest navigating to app pages: memories, medications, map, camera, family
- Keep responses under 150 words unless detail is needed
- Use markdown formatting sparingly (bold for names/meds)
- If you don't know something, say so honestly and suggest where to find it in the app`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting too many requests right now. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
