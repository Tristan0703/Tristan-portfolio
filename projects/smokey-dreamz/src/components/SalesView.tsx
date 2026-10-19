"use client";

import { Search } from "lucide-react";

export default function SalesView({
  salesFilter,
  memberFilter,
  onSalesFilterChange,
  onMemberFilterChange,
  filteredSales,
}: {
  salesFilter: string;
  memberFilter: "all" | "member" | "walkin";
  onSalesFilterChange: (v: string) => void;
  onMemberFilterChange: (v: "all" | "member" | "walkin") => void;
  filteredSales: any[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={salesFilter}
            onChange={(e) => onSalesFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "member", "walkin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onMemberFilterChange(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                memberFilter === f
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border border-zinc-800"
              }`}
            >
              {f === "all" ? "All" : f === "member" ? "Members" : "Walk-in"}
            </button>
          ))}
        </div>
        <span className="text-zinc-500 text-sm">{filteredSales.length} results</span>
      </div>
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Time</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Product</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Member</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Category</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Qty</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Unit Price</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Total</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale: any, i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-zinc-400">
                  {new Date(sale.sale_date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
                <td className="py-3 px-4 text-white">{sale.product_name}</td>
                <td className="py-3 px-4">
                  {sale.membership_id ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold border border-gold/20">{sale.membership_id}</span>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">Walk-in</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">{sale.product_category}</span>
                </td>
                <td className="py-3 px-4 text-right text-zinc-400">{sale.quantity}</td>
                <td className="py-3 px-4 text-right text-zinc-500">
                  {sale.unit_price ? `R${parseFloat(sale.unit_price).toFixed(2)}` : "\u2014"}
                </td>
                <td className="py-3 px-4 text-right text-green-400 font-medium">
                  R{parseFloat(sale.total_amount || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-zinc-500">{sale.source || "aronium"}</td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-600">No sales found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
