"use client";

import { Package, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-zinc-800 ${color}`}>{icon}</div>
        <div>
          <p className="text-zinc-500 text-xs">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function InventoryView({ logData }: { logData: DailyLogData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Package className="w-5 h-5" />} label="Total Products" value={logData.summary.totalProducts.toString()} color="text-blue-400" />
        <StatCard icon={<ArrowUpRight className="w-5 h-5" />} label="In Stock" value={(logData.summary.totalProducts - logData.summary.outOfStock).toString()} color="text-green-400" />
        <StatCard icon={<ArrowDownRight className="w-5 h-5" />} label="Out of Stock" value={logData.summary.outOfStock.toString()} color="text-red-400" />
      </div>
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Product</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Category</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Stock</th>
              <th className="text-center py-3 px-4 text-zinc-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {logData.inventoryAlerts.map((item: any) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-white">{item.name}</td>
                <td className="py-3 px-4 text-zinc-500">{item.category}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-medium ${item.stock_quantity === 0 ? "text-red-400" : "text-yellow-400"}`}>{item.stock_quantity}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.is_available ? "bg-green-950/50 text-green-400" : "bg-red-950/50 text-red-400"}`}>
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                </td>
              </tr>
            ))}
            {logData.inventoryAlerts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-green-400">All products are in stock.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
