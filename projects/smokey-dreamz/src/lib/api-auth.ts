import { NextResponse } from "next/server";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

export interface AuthenticatedUser {
  id: string;
  email: string;
  is_admin: boolean;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function verifyApiAuth(request: Request): Promise<{ user: AuthenticatedUser | null; response: NextResponse | null }> {
  const sessionCookie = request.headers.get("cookie")?.match(/sb-[^=]+=([^;]+)/);
  if (!sessionCookie?.[1]) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie[1]));
    if (!session?.access_token) {
      return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const payload = decodeJwtPayload(session.access_token);
    const userId = payload?.sub as string;
    if (!userId) {
      return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const memberResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/members?id=eq.${userId}&select=is_admin,email`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );

    let isAdmin = false;
    let email = (payload?.email as string) || "";
    if (memberResponse.ok) {
      const memberData = await memberResponse.json();
      if (memberData?.[0]) {
        isAdmin = memberData[0].is_admin === true;
        email = memberData[0].email || email;
      }
    }

    return {
      user: { id: userId, email, is_admin: isAdmin },
      response: null,
    };
  } catch {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
