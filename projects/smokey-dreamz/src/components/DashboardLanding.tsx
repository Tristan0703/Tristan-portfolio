"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, TrendingUp, Users } from "lucide-react";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

const BRANCHES = [
  { id: "randpark", label: "RAN" },
  { id: "witbank", label: "WIT" },
  { id: "blairgowrie", label: "BLA" },
] as const;

interface DailyLogData {
  date: string;
  branch: string;
  summary: {
    totalRevenue: string;
    totalTransactions: number;
    itemsSold: number;
    outOfStock: number;
    totalProducts: number;
  };
  salesByCategory: Record<string, { count: number; revenue: number }>;
  recentSales: any[];
  inventoryAlerts: any[];
}

interface BranchMetric {
  revenue: number;
  transactions: number;
  itemsSold: number;
}

export default function DashboardLanding({ logData, selectedDate }: { logData: DailyLogData; selectedDate: string }) {
  const [branchMetrics, setBranchMetrics] = useState<Record<string, BranchMetric | null>>({});
  const [checkins, setCheckins] = useState<Record<string, number>>({});
  const [checkinTotal, setCheckinTotal] = useState(0);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const dateDisplay = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-ZA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchBranchData = async (branch: string) => {
      try {
        const res = await fetch(`/api/daily-log?branch=${branch}&date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          return {
            revenue: parseFloat(data.summary.totalRevenue) || 0,
            transactions: data.summary.totalTransactions || 0,
            itemsSold: data.summary.itemsSold || 0,
          };
        }
      } catch {}
      return null;
    };

    const fetchVisits = async () => {
      try {
        const start = `${selectedDate}T00:00:00`;
        const end = `${selectedDate}T23:59:59`;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/visits?created_at=gte.${start}&created_at=lte.${end}&select=branch_id`,
          { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
        );
        if (res.ok) {
          const data = await res.json();
          const byBranch: Record<string, number> = {};
          let total = 0;
          for (const v of data || []) {
            const b = v.branch_id || "unknown";
            byBranch[b] = (byBranch[b] || 0) + 1;
            total++;
          }
          return { byBranch, total };
        }
      } catch {}
      return { byBranch: {} as Record<string, number>, total: 0 };
    };

    Promise.all([
      ...BRANCHES.map((b) => fetchBranchData(b.id)),
      fetchVisits(),
    ]).then(([...results]) => {
      if (cancelled) return;
      const visitData = results[BRANCHES.length] as { byBranch: Record<string, number>; total: number };
      const metrics: Record<string, BranchMetric | null> = {};
      BRANCHES.forEach((b, i) => { metrics[b.id] = results[i] as BranchMetric | null; });
      setBranchMetrics(metrics);
      setCheckins(visitData.byBranch);
      setCheckinTotal(visitData.total);
      setLoadingBranches(false);
    });

    return () => { cancelled = true; };
  }, [selectedDate]);

  const totalRevenue = BRANCHES.reduce((sum, b) => {
    const m = branchMetrics[b.id];
    return sum + (m?.revenue || 0);
  }, 0);

  return (
    <div className="space-y-8">

      {/* SECTION 1: Live Sales Log Stream */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <h2 className="font-serif text-xl text-white">Live Sales Log</h2>
          <span className="text-zinc-600 text-sm ml-auto">{dateDisplay}</span>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-900/95">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Time</th>
                  <th className="text-left py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Category</th>
                  <th className="text-right py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Qty</th>
                  <th className="text-right py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {logData.recentSales.slice(0, 15).map((sale: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                    <td className="py-2 px-4 text-zinc-500 font-mono text-xs">
                      {new Date(sale.sale_date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2 px-4 text-white text-sm">{sale.product_name}</td>
                    <td className="py-2 px-4 text-zinc-500 text-xs">{sale.product_category}</td>
                    <td className="py-2 px-4 text-right text-zinc-400">{sale.quantity}</td>
                    <td className="py-2 px-4 text-right text-green-400 font-medium">
                      R{parseFloat(sale.total_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {logData.recentSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-600">No sales recorded today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Multi-Branch Revenue Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-xl text-white">Multi-Branch Revenue</h2>
          <span className="text-zinc-600 text-sm ml-auto">
            {loadingBranches ? "Loading..." : `${BRANCHES.filter((b) => branchMetrics[b.id]).length}/${BRANCHES.length} branches reporting`}
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {BRANCHES.map((b) => {
            const m = branchMetrics[b.id];
            const isUp = m !== null;
            return (
              <div key={b.id} className={`rounded-xl p-5 border ${isUp ? "bg-zinc-900/40 border-white/10" : "bg-zinc-900/20 border-white/5"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${isUp ? "bg-green-400" : "bg-zinc-700"}`} />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{b.label}</span>
                </div>
                {isUp ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-400">R{(m?.revenue || 0).toFixed(2)}</p>
                    <div className="flex gap-4 text-xs text-zinc-500">
                      <span>{m?.transactions || 0} txns</span>
                      <span>{m?.itemsSold || 0} items</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-700 text-sm italic">No data</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 justify-end text-xs text-zinc-600">
          <TrendingUp className="w-3 h-3" />
          Combined: <span className="text-green-400 font-bold">R{totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* SECTION 3: Daily Check-in Volume */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-xl text-white">Daily Check-in Volume</h2>
        </div>
        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-4xl font-bold text-white">{checkinTotal}</p>
            <div className="flex items-center gap-1 text-zinc-500 text-sm">
              <Clock className="w-3 h-3" />
              {dateDisplay}
            </div>
          </div>
          {checkinTotal > 0 && (
            <div className="flex gap-4 flex-wrap">
              {Object.entries(checkins)
                .sort(([, a], [, b]) => b - a)
                .map(([branch, count]) => (
                  <div key={branch} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg">
                    <span className="text-xs font-bold text-zinc-400 uppercase">{branch}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
            </div>
          )}
          {checkinTotal === 0 && !loadingBranches && (
            <p className="text-zinc-600 text-sm">No check-ins recorded for this date.</p>
          )}
          {loadingBranches && (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
