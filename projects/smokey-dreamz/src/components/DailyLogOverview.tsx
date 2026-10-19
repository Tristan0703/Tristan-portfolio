"use client";

import {
  DollarSign, ShoppingCart, TrendingUp, AlertTriangle,
} from "lucide-react";

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

export default function DailyLogOverview({ logData }: { logData: DailyLogData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenue" value={`R${logData.summary.totalRevenue}`} color="text-green-400" />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Transactions" value={logData.summary.totalTransactions.toString()} color="text-blue-400" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Items Sold" value={logData.summary.itemsSold.toString()} color="text-purple-400" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Out of Stock" value={logData.summary.outOfStock.toString()} color={logData.summary.outOfStock > 0 ? "text-red-400" : "text-zinc-500"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="font-serif text-lg text-white mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {Object.entries(logData.salesByCategory || {}).map(([cat, data]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">{cat}</span>
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500 text-xs">{data.count} sales</span>
                  <span className="text-green-400 text-sm font-medium">R{data.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {Object.keys(logData.salesByCategory || {}).length === 0 && (
              <p className="text-zinc-600 text-sm">No sales recorded for this date.</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="font-serif text-lg text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Low Stock Alerts
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logData.inventoryAlerts.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-900/30">
                <div>
                  <p className="text-white text-sm">{item.name}</p>
                  <p className="text-zinc-500 text-xs">{item.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.stock_quantity === 0 ? "bg-red-950/50 text-red-400" : "bg-yellow-950/50 text-yellow-400"}`}>
                  {item.stock_quantity} left
                </span>
              </div>
            ))}
            {logData.inventoryAlerts.length === 0 && (
              <p className="text-zinc-600 text-sm">All products in stock.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="font-serif text-lg text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-zinc-500 font-medium">Time</th>
                <th className="text-left py-2 px-3 text-zinc-500 font-medium">Product</th>
                <th className="text-left py-2 px-3 text-zinc-500 font-medium">Member</th>
                <th className="text-left py-2 px-3 text-zinc-500 font-medium">Category</th>
                <th className="text-right py-2 px-3 text-zinc-500 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-zinc-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {logData.recentSales.map((sale: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3 text-zinc-400">
                    {new Date(sale.sale_date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2 px-3 text-white">{sale.product_name}</td>
                  <td className="py-2 px-3">
                    {sale.membership_id ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold border border-gold/20">{sale.membership_id}</span>
                    ) : (
                      <span className="text-zinc-600 text-xs italic">Walk-in</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-zinc-500">{sale.product_category}</td>
                  <td className="py-2 px-3 text-right text-zinc-400">{sale.quantity}</td>
                  <td className="py-2 px-3 text-right text-green-400">R{parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {logData.recentSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-600">No transactions for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
