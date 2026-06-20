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
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json().catch(() => ({}));

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

    const pendingPlanType = userData.pending_plan_type || "monthly";

    const updates = {
      subscription_status: "active",
      subscription_plan: pendingPlanType === "annual" ? "pro_annual" : "pro_monthly",
      subscription_id: razorpay_subscription_id,
      pending_subscription_id: null,
      pending_plan_type: null,
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

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error("POST /api/subscriptions/verify error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
