import { NextResponse } from "next/server";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid, email } = user;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (error || !profile) {
      // Fallback: If database trigger didn't run, create the profile manually
      const derivedUsername = email?.split("@")[0] ?? "user";

      const newProfile = {
        id: uid,
        email: email ?? "",
        username: derivedUsername,
        display_name: derivedUsername,
        avatar: "",
        bio: "",
        website: "",
        location: "",
        subscription_status: null,
        subscription_plan: null,
        ai_credits: 0,
      };

      const { data: createdProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (insertError || !createdProfile) {
        console.error("Profile fallback insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create user profile", details: insertError?.message ?? insertError },
          { status: 500 }
        );
      }

      return NextResponse.json({ profile: createdProfile }, { status: 201 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("POST /api/auth/profile error:", err);
    return NextResponse.json({ error: err.message || "Failed to create or fetch user profile" }, { status: 500 });
  }
}
