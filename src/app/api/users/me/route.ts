import { NextResponse } from "next/server";
import { verifyAuth } from "../../authHelper";
import { supabaseAdmin } from "../../../db/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = user;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let updated = false;
    const updates: any = {};

    if (profile.subscription_status === "active" && (profile.ai_credits === null || profile.ai_credits === undefined)) {
      updates.ai_credits = 50000;
      updated = true;
    }

    if (updated) {
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", uid)
        .select()
        .single();

      if (!updateError && updatedProfile) {
        Object.assign(profile, updatedProfile);
      }
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = user;
    const body = await req.json().catch(() => ({}));

    // Map allowed frontend camelCase fields to Postgres snake_case columns
    const updates: any = {};
    if (typeof body.displayName === "string") updates.display_name = body.displayName;
    if (typeof body.bio === "string") updates.bio = body.bio;
    if (typeof body.website === "string") updates.website = body.website;
    if (typeof body.location === "string") updates.location = body.location;
    if (typeof body.avatar === "string") updates.avatar = body.avatar;
    if (typeof body.username === "string") updates.username = body.username;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    if (updates.avatar && updates.avatar.length > 1000000) {
      return NextResponse.json({ error: "Avatar image is too large. Please upload an image under 1MB." }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", uid)
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("PATCH /api/users/me error:", err);
    return NextResponse.json({ error: err.message || "Failed to update user profile" }, { status: 500 });
  }
}
