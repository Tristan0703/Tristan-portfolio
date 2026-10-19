"use client";

import { useState, useEffect } from "react";
import { RefreshCw, MapPin } from "lucide-react";

const BRANCHES = [
  { id: "randpark", label: "Randpark Ridge" },
  { id: "witbank", label: "Witbank" },
  { id: "blairgowrie", label: "Blairgowrie" },
] as const;

interface BranchSummary {
  totalRevenue: number;
  totalTransactions: number;
  itemsSold: number;
  outOfStock: number;
  totalProducts: number;
}

type BranchData = Record<string, BranchSummary | null>;

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-zinc-800 rounded-full" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-zinc-800 rounded" />
          <div className="w-16 h-3 bg-zinc-800/50 rounded" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="w-16 h-4 bg-zinc-800 rounded" />
        <div className="w-12 h-4 bg-zinc-800 rounded" />
        <div className="w-12 h-4 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export default function BranchAnalytics() {
  const [branchData, setBranchData] = useState<BranchData>({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) setLoading(true); });

    const results: BranchData = {};

    Promise.all(
      BRANCHES.map(async (b) => {
        try {
          const res = await fetch(`/api/daily-log?branch=${b.id}&date=${date}`);
          if (res.ok) {
            const data = await res.json();
            results[b.id] = {
              totalRevenue: parseFloat(data.summary.totalRevenue),
              totalTransactions: data.summary.totalTransactions,
              itemsSold: data.summary.itemsSold,
              outOfStock: data.summary.outOfStock,
              totalProducts: data.summary.totalProducts,
            };
          } else {
            results[b.id] = null;
          }
        } catch {
          results[b.id] = null;
        }
      })
    ).then(() => {
      if (!cancelled) setBranchData(results);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [date, fetchId]);

  const combined: BranchSummary | null = (() => {
    const entries = Object.values(branchData).filter(Boolean) as BranchSummary[];
    if (entries.length === 0) return null;
    return {
      totalRevenue: entries.reduce((s, e) => s + e.totalRevenue, 0),
      totalTransactions: entries.reduce((s, e) => s + e.totalTransactions, 0),
      itemsSold: entries.reduce((s, e) => s + e.itemsSold, 0),
      outOfStock: entries.reduce((s, e) => s + e.outOfStock, 0),
      totalProducts: entries.reduce((s, e) => s + e.totalProducts, 0),
    };
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold focus:outline-none"
          />
          <button onClick={() => setFetchId((id) => id + 1)} disabled={loading} className="p-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gold ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!loading && (
        <>
          {combined && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
              <h3 className="font-serif text-lg text-gold mb-3">All Branches Combined</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div><p className="text-zinc-500 text-xs">Revenue</p><p className="text-green-400 font-bold">R{combined.totalRevenue.toFixed(2)}</p></div>
                <div><p className="text-zinc-500 text-xs">Transactions</p><p className="text-white font-bold">{combined.totalTransactions}</p></div>
                <div><p className="text-zinc-500 text-xs">Items Sold</p><p className="text-white font-bold">{combined.itemsSold}</p></div>
                <div><p className="text-zinc-500 text-xs">Out of Stock</p><p className="text-red-400 font-bold">{combined.outOfStock}</p></div>
                <div><p className="text-zinc-500 text-xs">Total Products</p><p className="text-white font-bold">{combined.totalProducts}</p></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {BRANCHES.map((b) => {
              const data = branchData[b.id];
              return (
                <div key={b.id} className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-gold" />
                    <h3 className="font-serif text-white">{b.label}</h3>
                    {data === null && <span className="text-xs text-red-400 ml-auto">No data</span>}
                  </div>
                  {data ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div><p className="text-zinc-500 text-xs">Revenue</p><p className="text-green-400 font-bold">R{data.totalRevenue.toFixed(2)}</p></div>
                      <div><p className="text-zinc-500 text-xs">Transactions</p><p className="text-white font-bold">{data.totalTransactions}</p></div>
                      <div><p className="text-zinc-500 text-xs">Items Sold</p><p className="text-white font-bold">{data.itemsSold}</p></div>
                      <div><p className="text-zinc-500 text-xs">Out of Stock</p><p className="text-red-400 font-bold">{data.outOfStock}</p></div>
                      <div><p className="text-zinc-500 text-xs">Products</p><p className="text-white font-bold">{data.totalProducts}</p></div>
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-sm">Failed to load data for this branch.</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
