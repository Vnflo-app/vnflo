import Razorpay from "razorpay";
import { supabaseAdmin } from "../../db/supabaseAdmin";

// Initialize Razorpay client
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Helper to fetch existing plans from Supabase profiles/settings table,
 * or create them in Razorpay and save them if they don't exist.
 */
export async function getOrCreatePlans(): Promise<{ monthlyPlanId: string; annualPlanId: string }> {
  const { data: settings, error } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "razorpay")
    .single();

  if (settings?.value) {
    const data = settings.value as any;
    if (data?.pro_monthly_plan_id && data?.pro_annual_plan_id) {
      return {
        monthlyPlanId: data.pro_monthly_plan_id,
        annualPlanId: data.pro_annual_plan_id,
      };
    }
  }

  console.log("⚙️ Razorpay plans not found in database. Initializing plans in Razorpay...");

  // 1. Create Pro Monthly Plan (INR 399)
  const monthlyPlan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "Visual Node Flow - Pro Monthly",
      amount: 39900, // INR 399.00 in paise
      currency: "INR",
      description: "Monthly subscription to Visual Node Flow Pro",
    },
  });

  // 2. Create Pro Annual Plan (INR 3828/yr = INR 319/mo)
  const annualPlan = await razorpay.plans.create({
    period: "yearly",
    interval: 1,
    item: {
      name: "Visual Node Flow - Pro Annual",
      amount: 382800, // INR 3828.00 in paise
      currency: "INR",
      description: "Annual subscription to Visual Node Flow Pro",
    },
  });

  const planIds = {
    pro_monthly_plan_id: monthlyPlan.id,
    pro_annual_plan_id: annualPlan.id,
    updatedAt: new Date().toISOString(),
  };

  // Cache in Supabase settings
  await supabaseAdmin
    .from("settings")
    .upsert({
      key: "razorpay",
      value: planIds,
      updated_at: new Date().toISOString()
    });

  return {
    monthlyPlanId: monthlyPlan.id,
    annualPlanId: annualPlan.id,
  };
}
