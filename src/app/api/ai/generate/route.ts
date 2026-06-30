import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, model, temperature } = body;

    // 1. Basic Validation
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing or invalid 'messages' array in request body." }, { status: 400 });
    }

    // 2. Authentication Check (Strictly Pro Users Only)
    const authUser = await verifyAuth(req);
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
    }

    const uid = authUser.uid;

    // 3. Fetch User Profile & Credits
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("plan, ai_credits")
      .eq("id", uid)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const isPro = userData.plan !== "free";
    // Default to 50,000 if null/undefined for legacy users or initial setup
    let currentCredits = userData.ai_credits !== null && userData.ai_credits !== undefined ? userData.ai_credits : 50000;

    if (!isPro) {
      return NextResponse.json({ error: "Pro subscription required to access AI features." }, { status: 403 });
    }

    if (currentCredits <= 0) {
      return NextResponse.json({ error: "You have exhausted your AI credits for this month." }, { status: 403 });
    }

    // 4. Prepare OpenRouter Request
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error("⚠️ OPENROUTER_API_KEY is not set in environment variables.");
      // Fallback for development if key is missing, otherwise fail securely
      if (process.env.NODE_ENV === 'production') {
         return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
      }
    }
    //const model = "nvidia/nemotron-3-ultra-550b-a55b:free";
    // Construct the payload for OpenRouter
    // Note: We ensure the system prompt encourages JSON output if needed by your frontend
    const requestBody = {
      model: model || "nvidia/nemotron-3-ultra-550b-a55b:free", // Default fallback model if none provided
      messages: [
        {
          role: "system",
          content: "You are an expert diagram generator. Respond with valid JSON containing a 'message' string and a 'diagram' object with 'nodes' and 'edges' arrays."
        },
        ...messages
      ],
      temperature: temperature || 0.7,
    };

    // 5. Call OpenRouter API
    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Visual Node Flow",
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("OpenRouter Error:", errText);
      return NextResponse.json({ 
        error: `AI Service error: ${apiRes.statusText}` 
      }, { status: apiRes.status });
    }

    const completion = await apiRes.json();
    const tokensUsed = completion.usage?.total_tokens ?? 500; // Estimate if usage missing

    // 6. Log AI Usage & Update Credits
    const newCredits = Math.max(0, currentCredits - tokensUsed);

    try {
      const promptString = JSON.stringify(messages);
      const promptHash = crypto.createHash("sha256").update(promptString).digest("hex");
      const selectedModel = model || "nvidia/nemotron-3-ultra-550b-a55b:free";
      const costUsd = selectedModel.includes(":free") ? 0.0 : Number((tokensUsed * 0.000002).toFixed(6));

      await supabaseAdmin.from("ai_usage_logs").insert({
        user_id: uid,
        prompt_hash: promptHash,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        model_used: selectedModel,
      });
    } catch (logErr) {
      console.error("Failed to insert AI usage log:", logErr);
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        ai_credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq("id", uid);

    if (updateError) {
      console.error("Failed to update credits:", updateError);
    }

    return NextResponse.json({
      ...completion,
      userCredits: newCredits
    });

  } catch (err: any) {
    console.error("AI Generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate diagram." }, { status: 500 });
  }
}