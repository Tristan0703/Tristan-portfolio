import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabase, canAccessVault, type UserRole } from "../lib/supabase";

export async function vaultMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (!pathname.startsWith("/vault")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.redirect(new URL("/apply-for-access", request.url));
  }

  try {
    const client = getSupabase();
    const { data: { user }, error: authError } = await client.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return NextResponse.redirect(new URL("/apply-for-access", request.url));
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.redirect(new URL("/apply-for-access", request.url));
    }

    if (!canAccessVault(profile.role as UserRole)) {
      return NextResponse.redirect(new URL("/apply-for-access", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/apply-for-access", request.url));
  }
}

export function createVaultMiddleware(
  getAuthToken: () => Promise<string | null>,
  getUserRole: () => Promise<UserRole | null>
) {
  return async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;
    
    if (!pathname.startsWith("/vault")) {
      return NextResponse.next();
    }

    const token = await getAuthToken();
    
    if (!token) {
      return NextResponse.redirect(
        new URL("/apply-for-access?reason=authentication", request.url)
      );
    }

    const role = await getUserRole();
    
    if (!role || !canAccessVault(role)) {
      return NextResponse.redirect(
        new URL("/apply-for-access?reason=authorization", request.url)
      );
    }

    return NextResponse.next();
  };
}