import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = user;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planType } = await req.json().catch(() => ({}));

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

    // 1. Verify the signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    // 2. Update user profile to active subscription
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const updates = {
      plan: "pro",
      razorpay_customer_id: razorpay_subscription_id,
      ai_credits: 50000,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", uid)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 3. Log the payment transaction
    const resolvedPlanType = planType || "monthly";
    const paymentAmount = resolvedPlanType === "annual" ? 382800 : 39900; // paise

    await supabaseAdmin.from("payments").insert({
      user_id: uid,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      amount: paymentAmount,
      currency: "INR",
      plan_type: resolvedPlanType,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error("POST /api/subscriptions/verify error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
