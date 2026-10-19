import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();
const SESSION_COOKIE_NAME = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

async function getUserFromCookie(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const session = JSON.parse(decodeURIComponent(cookie.value));
    if (!session?.access_token) return null;

    const payload = decodeJwtPayload(session.access_token);
    if (!payload?.sub) return null;

    // Verify user exists in members table
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/members?id=eq.${payload.sub}&select=id,email`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.[0] ? { id: data[0].id, email: data[0].email } : null;
  } catch {
    return null;
  }
}

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/members?id=eq.${userId}&select=is_admin`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data?.[0]?.is_admin === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicPaths = ["/welcome", "/api/health", "/api/logo", "/api/products"];
  if (publicPaths.some(p => path === p || path.startsWith("/_next") || path.startsWith("/favicon"))) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (path === "/admin") return NextResponse.next();

    const user = await getUserFromCookie(request);
    if (!user?.id) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (path.startsWith("/staff/verify")) {
    const user = await getUserFromCookie(request);
    if (!user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (path === "/membership/card") {
    return NextResponse.next();
  }

  const isProtected = path.startsWith("/membership") || path.startsWith("/menu") || path.startsWith("/verify");
  if (isProtected) {
    const verified = request.cookies.get("age-verified");
    const user = await getUserFromCookie(request);

    if (!verified && !user) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
  }

  if (path === "/welcome") {
    const verified = request.cookies.get("age-verified");
    const user = await getUserFromCookie(request);
    if (verified && user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
