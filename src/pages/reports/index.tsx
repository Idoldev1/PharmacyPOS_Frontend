import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { reportsService } from "../../services/reportsService";
import { QUERY_KEYS } from "../../constants/queryKeys";

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const { data: summary } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS, "summary"],
    queryFn: () => reportsService.getSummary().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: weekly = [] } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS, "weekly"],
    queryFn: () => reportsService.getWeeklyRevenue().then((r) => r.data),
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS, "payment"],
    queryFn: () => reportsService.getPaymentBreakdown().then((r) => r.data),
  });

  const { data: topDrugs = [] } = useQuery({
    queryKey: [QUERY_KEYS.REPORTS, "top-drugs"],
    queryFn: () => reportsService.getTopDrugs().then((r) => r.data),
  });

  return (
    <div className="overflow-y-auto bg-slate-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="mt-0.5 text-sm text-slate-500">Business insights and performance metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Total Revenue Today"
          value={`₦${Number(summary?.todayRevenue ?? 0).toLocaleString()}`}
          sub={summary?.todayTransactions ? `${summary.todayTransactions} transactions` : undefined}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="Total Transactions"
          value={String(summary?.todayTransactions ?? 0)}
          sub={summary?.avgSaleValue ? `Avg: ₦${Math.round(summary.avgSaleValue).toLocaleString()}` : undefined}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Top Selling Drug"
          value={summary?.topSellingDrug ?? "—"}
          sub={
            summary?.topSellingUnits
              ? `${summary.topSellingBrand ? `${summary.topSellingBrand} · ` : ""}${summary.topSellingUnits} units`
              : undefined
          }
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <SummaryCard
          icon={Package}
          label="Low Stock Items"
          value={String(summary?.lowStockCount ?? 0)}
          sub="Need reorder"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weekly revenue bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Weekly Revenue</h3>
          {weekly.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" style={{ fontSize: "12px" }} />
                <YAxis stroke="#64748B" style={{ fontSize: "12px" }}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`₦${Number(v).toLocaleString()}`, "Revenue"] as [string, string]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px" }}
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment methods pie chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Payment Methods (This Month)</h3>
          {paymentMethods.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "Share"] as [string, string]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top drugs table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Top 10 Drugs by Revenue (This Month)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Rank", "Drug Name", "Units Sold", "Revenue"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${h === "Units Sold" || h === "Revenue" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDrugs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No sales data this month
                  </td>
                </tr>
              ) : (
                topDrugs.map((drug, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">#{i + 1}</td>
                    <td className="px-4 py-3 text-slate-900">
                      {drug.name}
                      {drug.brand && <div className="text-xs text-slate-400">{drug.brand}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{drug.units}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      ₦{Number(drug.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
