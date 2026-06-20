import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../db/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${allowedOrigin}/reset-password`,
      },
    });

    if (error) {
      console.error("Error generating recovery link:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const link = data?.properties?.action_link;

    // Log the link to the console for the developer in dev environments
    console.log(`\n🔑 [DEV ONLY] Password recovery link generated for ${email}:`);
    console.log(`${link}\n`);

    const isDev = process.env.VERCEL !== "1";
    return NextResponse.json({
      success: true,
      message: "Recovery link generated successfully.",
      link: isDev ? link : undefined,
    });
  } catch (err: any) {
    console.error("POST /api/auth/recovery-link error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate recovery link" }, { status: 500 });
  }
}
