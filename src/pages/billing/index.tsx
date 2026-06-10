import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Receipt,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  CreditCard,
  Smartphone,
  Banknote,
  Clock,
  X,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { salesService } from "../../services/salesService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useDebounce } from "../../hooks/useDebounce";
import type { Sale } from "../../types/sale.types";

function paymentIcon(method: string) {
  const m = method.toLowerCase();
  if (m === "cash") return <Banknote size={14} className="text-emerald-600" />;
  if (m === "pos" || m === "card") return <CreditCard size={14} className="text-blue-600" />;
  if (m === "transfer") return <Smartphone size={14} className="text-purple-600" />;
  return <CreditCard size={14} className="text-slate-400" />;
}

function statusVariant(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "refunded") return "danger";
  return "info";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sale detail side panel ────────────────────────────────────────────────────
function SaleDetailPanel({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-sm flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-bold text-slate-900">Receipt #{sale.receiptNo}</h2>
            <p className="text-xs text-slate-500">{formatDate(sale.createdAt)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + payment */}
          <div className="flex items-center justify-between">
            <Badge variant={statusVariant(sale.status)}>{sale.status}</Badge>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 capitalize">
              {paymentIcon(sale.paymentMethod)}
              {sale.paymentMethod}
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-1 text-xs text-slate-500">Customer</p>
            <p className="font-medium text-slate-900">
              {sale.patientId ? `PAT-${sale.patientId.slice(0, 8).toUpperCase()}` : "Walk-in Customer"}
            </p>
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Items</h3>
            <div className="space-y-2">
              {sale.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.drugName}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × ₦{Number(item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-medium text-slate-900">₦{Number(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
            {[
              { label: "Subtotal", value: `₦${Number(sale.subtotal).toLocaleString()}` },
              { label: "Discount", value: `-₦${Number(sale.discount).toLocaleString()}` },
              { label: "Tax", value: `₦${Number(sale.tax).toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-700">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-lg font-bold text-teal-700">₦{Number(sale.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SALES],
    queryFn: () => salesService.getSales({ pageSize: 100 }).then((r) => r.data),
  });

  const allSales: Sale[] = data?.items ?? [];

  const sales = debouncedSearch
    ? allSales.filter(
        (s) =>
          s.receiptNo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (s.patientId && s.patientId.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : allSales;

  const todayIso = new Date().toDateString();
  const todaySales = allSales.filter((s) => new Date(s.createdAt).toDateString() === todayIso);
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const todayCount = todaySales.length;
  const refundedCount = allSales.filter((s) => s.status === "refunded").length;
  const avgSale = todayCount > 0 ? todayRevenue / todayCount : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="mt-0.5 text-sm text-slate-500">Sales transactions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            {
              icon: TrendingUp,
              label: "Today's Revenue",
              value: `₦${todayRevenue.toLocaleString()}`,
              color: "text-teal-600",
              bg: "bg-teal-50",
            },
            {
              icon: ShoppingCart,
              label: "Transactions Today",
              value: todayCount,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              icon: RefreshCw,
              label: "Refunds",
              value: refundedCount,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              icon: Clock,
              label: "Avg. Sale Value",
              value: `₦${Math.round(avgSale).toLocaleString()}`,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by receipt ID or patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Receipt No", "Customer", "Items", "Total", "Payment", "Cashier", "Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading transactions…</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {search ? "No transactions match your search." : "No transactions found."}
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedSale(s)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Receipt size={14} className="text-slate-400 shrink-0" />
                        <span className="font-mono font-medium text-slate-900">{s.receiptNo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.patientId
                        ? `PAT-${s.patientId.slice(0, 6).toUpperCase()}`
                        : "Walk-in Customer"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.items.length}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ₦{Number(s.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600 capitalize">
                        {paymentIcon(s.paymentMethod)}
                        {s.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {s.cashierId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <SaleDetailPanel sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
}
