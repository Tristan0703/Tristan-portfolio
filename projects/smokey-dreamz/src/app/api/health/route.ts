import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count, error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { connected: false, error: "Service unavailable" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    connected: true,
    message: "OK",
    memberCount: count || 0,
    timestamp: new Date().toISOString(),
  });
}
