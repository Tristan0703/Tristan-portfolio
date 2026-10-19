import { NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/api-auth";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

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

  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;

    const [salesRes, inventoryRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/sales?branch_id=eq.${branchId}&sale_date=gte.${start}&sale_date=lte.${end}&order=sale_date.desc`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, cache: "no-store" }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/products?branch_id=eq.${branchId}&select=id,name,category,stock_quantity,is_available`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, cache: "no-store" }
      ),
    ]);

    const sales = salesRes.ok ? await salesRes.json() : [];
    const inventory = inventoryRes.ok ? await inventoryRes.json() : [];

    const totalRevenue = sales.reduce((sum: number, s: any) => sum + (parseFloat(s.total_amount) || 0), 0);
    const salesByCategory: Record<string, { count: number; revenue: number }> = {};
    sales.forEach((s: any) => {
      const cat = s.product_category || "Unknown";
      if (!salesByCategory[cat]) salesByCategory[cat] = { count: 0, revenue: 0 };
      salesByCategory[cat].count += 1;
      salesByCategory[cat].revenue += parseFloat(s.total_amount) || 0;
    });

    return NextResponse.json({
      date,
      branch: branchId,
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions: sales.length,
        itemsSold: sales.reduce((sum: number, s: any) => sum + (parseInt(s.quantity) || 0), 0),
        outOfStock: inventory.filter((p: any) => !p.is_available || p.stock_quantity <= 0).length,
        totalProducts: inventory.length,
      },
      salesByCategory,
      recentSales: sales.slice(0, 20),
      inventoryAlerts: inventory
        .filter((p: any) => p.stock_quantity <= 5)
        .sort((a: any, b: any) => a.stock_quantity - b.stock_quantity)
        .slice(0, 10),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
