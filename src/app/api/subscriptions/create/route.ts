import { NextResponse } from "next/server";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";
import { razorpay, getOrCreatePlans } from "../razorpayHelper";

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = user;
    const { planType } = await req.json().catch(() => ({}));

    if (planType !== "monthly" && planType !== "annual") {
      return NextResponse.json({ error: "Invalid planType. Must be 'monthly' or 'annual'." }, { status: 400 });
    }

    // 1. Resolve Plan IDs (creates them in Razorpay if needed)
    const { monthlyPlanId, annualPlanId } = await getOrCreatePlans();
    const planId = planType === "monthly" ? monthlyPlanId : annualPlanId;

    // 2. Create the subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === "monthly" ? 60 : 5, // 5 years max
      quantity: 1,
      notes: {
        userId: uid,
        planType: planType,
      },
    });

    // 3. Keep track of this pending subscription on the user profile
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        pending_subscription_id: subscription.id,
        pending_plan_type: planType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("POST /api/subscriptions/create error:", err);
    return NextResponse.json({ error: err.message || "Failed to create subscription" }, { status: 500 });
  }
}
