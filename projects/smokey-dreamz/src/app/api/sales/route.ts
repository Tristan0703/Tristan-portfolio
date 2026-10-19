import { NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/api-auth";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

const VALID_BRANCHES = ["randpark", "witbank", "blairgowrie"] as const;
const MAX_LIMIT = 500;

export async function GET(request: Request) {
  const { user, response } = await verifyApiAuth(request);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  if (branch && !VALID_BRANCHES.includes(branch as any)) {
    return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
  }
  const branchId = (branch as typeof VALID_BRANCHES[number]) || "randpark";

  let limit = parseInt(searchParams.get("limit") || "100");
  if (isNaN(limit) || limit < 1) limit = 100;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  try {
    let query = `/rest/v1/sales?branch_id=eq.${branchId}&order=sale_date.desc&limit=${limit}`;

    const date = searchParams.get("date");
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && dateRegex.test(date)) {
      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;
      query = `/rest/v1/sales?branch_id=eq.${branchId}&sale_date=gte.${start}&sale_date=lte.${end}&order=sale_date.desc&limit=${limit}`;
    }

    const url = `${SUPABASE_URL}${query}`;
    const res = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch sales" }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, response: authResponse } = await verifyApiAuth(request);
  if (authResponse) return authResponse;

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const allowedFields = [
      "product_id", "product_name", "product_category", "quantity",
      "unit_price", "total_amount", "branch_id", "receipt_id", "sale_date", "source",
    ];
    const sanitized: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) sanitized[field] = body[field];
    }

    sanitized.branch_id = sanitized.branch_id || "randpark";
    sanitized.quantity = parseInt(String(sanitized.quantity || 1));
    if (isNaN(sanitized.quantity as number) || (sanitized.quantity as number) < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const url = `${SUPABASE_URL}/rest/v1/sales`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to create sale" }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
