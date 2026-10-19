import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/logo.png", process.env.NEXT_PUBLIC_SITE_URL || "https://smokey-dreamz.co.za"));
}