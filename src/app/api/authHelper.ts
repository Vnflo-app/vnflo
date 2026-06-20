import { supabaseAdmin } from "../db/supabaseAdmin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

/**
 * Extracts and verifies the access token from the request's Authorization header.
 * Returns the authenticated user details (uid, email) or null if authentication fails.
 */
export async function verifyAuth(req: Request): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error("verifyAuth failed: error =", error, "user =", user);
      return null;
    }

    return {
      uid: user.id,
      email: user.email,
    };
  } catch (err) {
    console.error("Token verification failed in verifyAuth helper exception:", err);
    return null;
  }
}
