import { NextResponse } from "next/server";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";
import { razorpay } from "../razorpayHelper";

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = user;

    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const subscriptionId = userData.razorpay_customer_id;

    if (!subscriptionId) {
      return NextResponse.json({ error: "No active subscription found for this user" }, { status: 400 });
    }

    // 1. Cancel in Razorpay immediately (second parameter false means cancel immediately)
    await razorpay.subscriptions.cancel(subscriptionId, false);

    // 2. Update status in database
    const updates = {
      plan: "free",
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
    console.error("POST /api/subscriptions/cancel error:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel subscription" }, { status: 500 });
  }
}
