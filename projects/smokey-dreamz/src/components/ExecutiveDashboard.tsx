"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3, Package, ShoppingCart, RefreshCw, MapPin
} from "lucide-react";
import DashboardLanding from "./DashboardLanding";
import SalesView from "./SalesView";
import InventoryView from "./InventoryView";
import BranchAnalytics from "./BranchAnalytics";

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

const SUB_TABS = [
  { id: "overview" as const, label: "Overview", icon: BarChart3 },
  { id: "sales" as const, label: "Sales", icon: ShoppingCart },
  { id: "inventory" as const, label: "Inventory", icon: Package },
  { id: "analytics" as const, label: "Analytics", icon: MapPin },
];

function DataLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-zinc-800/30 rounded-xl" />
        <div className="h-64 bg-zinc-800/30 rounded-xl" />
      </div>
      <div className="h-80 bg-zinc-800/30 rounded-xl" />
    </div>
  );
}

export default function ExecutiveDashboard() {
  const [logData, setLogData] = useState<DailyLogData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [subTab, setSubTab] = useState<"overview" | "sales" | "inventory" | "analytics">("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesFilter, setSalesFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "member" | "walkin">("all");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setRefreshing(true);
      if (!cancelled) setError(null);
    });
    fetch(`/api/daily-log?branch=randpark&date=${selectedDate}`)
      .then(async (res) => {
        if (cancelled) return null;
        if (res.ok) return res.json();
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Server error (${res.status})`);
      })
      .then((data) => { if (!cancelled && data) setLogData(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setRefreshing(false); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const fetchDailyLog = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily-log?branch=randpark&date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setLogData(data);
      } else {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setError(err.error || `Server error (${res.status})`);
      }
    } catch {
      setError("Network error \u2014 could not reach server");
    }
    setRefreshing(false);
  }, [selectedDate]);

  const filteredSales = useMemo(() => {
    return logData?.recentSales?.filter((s: any) => {
      const matchesSearch = s.product_name?.toLowerCase().includes(salesFilter.toLowerCase());
      const matchesMember =
        memberFilter === "all" ||
        (memberFilter === "member" && s.membership_id) ||
        (memberFilter === "walkin" && !s.membership_id);
      return matchesSearch && matchesMember;
    }) || [];
  }, [logData, salesFilter, memberFilter]);

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold focus:outline-none"
          />
          <button
            onClick={fetchDailyLog}
            disabled={refreshing}
            className="p-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gold ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <nav className="flex gap-1 mb-6 border-b border-white/5 pb-3">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                subTab === tab.id
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {subTab === "overview" && logData && (
        <DashboardLanding logData={logData} selectedDate={selectedDate} />
      )}
      {subTab === "overview" && !logData && !error && <DataLoadingSkeleton />}
      {subTab === "overview" && !logData && error && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-red-400 text-sm mb-2">Failed to load data</p>
            <p className="text-zinc-600 text-xs mb-6">{error}</p>
            <button onClick={fetchDailyLog} className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg text-sm text-gold transition-all">
              Retry
            </button>
          </div>
        </div>
      )}

      {subTab === "sales" && logData && (
        <SalesView
          salesFilter={salesFilter}
          memberFilter={memberFilter}
          onSalesFilterChange={setSalesFilter}
          onMemberFilterChange={setMemberFilter}
          filteredSales={filteredSales}
        />
      )}
      {subTab === "sales" && !logData && !error && <DataLoadingSkeleton />}
      {subTab === "sales" && !logData && error && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-red-400 text-sm mb-2">Failed to load sales data</p>
            <p className="text-zinc-600 text-xs mb-6">{error}</p>
            <button onClick={fetchDailyLog} className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg text-sm text-gold transition-all">
              Retry
            </button>
          </div>
        </div>
      )}

      {subTab === "inventory" && logData && <InventoryView logData={logData} />}
      {subTab === "inventory" && !logData && !error && <DataLoadingSkeleton />}
      {subTab === "inventory" && !logData && error && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-red-400 text-sm mb-2">Failed to load inventory data</p>
            <p className="text-zinc-600 text-xs mb-6">{error}</p>
            <button onClick={fetchDailyLog} className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg text-sm text-gold transition-all">
              Retry
            </button>
          </div>
        </div>
      )}

      {subTab === "analytics" && <BranchAnalytics />}
    </div>
  );
}
