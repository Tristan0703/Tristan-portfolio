import { NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/api-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igfnlqmevjanfpcxxanh.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm";

const VALID_BRANCHES = ["randpark", "witbank", "blairgowrie"] as const;

export async function GET(request: Request) {
  const { user, response } = await verifyApiAuth(request);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  if (branch && !VALID_BRANCHES.includes(branch as any)) {
    return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
  }
  const branchId = (branch as typeof VALID_BRANCHES[number]) || "randpark";

  try {
    const url = `${SUPABASE_URL}/rest/v1/products?branch_id=eq.${branchId}&select=id,name,category,stock_quantity,is_available,updated_at`;
    const res = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, response } = await verifyApiAuth(request);
  if (response) return response;

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, stock_quantity, is_available } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const qty = parseInt(stock_quantity);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 });
    }

    const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_quantity: qty,
        is_available: typeof is_available === "boolean" ? is_available : qty > 0,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to update inventory" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
