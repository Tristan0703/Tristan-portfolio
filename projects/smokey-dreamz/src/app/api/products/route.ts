import { NextResponse } from "next/server";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

export async function GET() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products?is_available=eq.true&order=created_at.desc`;
    const res = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
