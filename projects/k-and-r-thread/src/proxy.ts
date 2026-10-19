import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (!pathname.startsWith("/vault")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("sb-access-token")?.value;
  
  if (!token) {
    return NextResponse.redirect(
      new URL("/apply-for-access?reason=authentication", request.url)
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(
        new URL("/apply-for-access?reason=authentication", request.url)
      );
    }

    const user = await response.json();
    const role = user.role;

    if (role !== "designer" && role !== "vip") {
      return NextResponse.redirect(
        new URL("/apply-for-access?reason=authorization", request.url)
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL("/apply-for-access?reason=server", request.url)
    );
  }
}

export const config = {
  matcher: ["/vault/:path*"],
};