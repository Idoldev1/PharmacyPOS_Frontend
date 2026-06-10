import { AlertTriangle, FileText, ShoppingCart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { dashboardService } from "../../services/dashboardService";

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: () => dashboardService.getSummary().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const revenue = data?.todayRevenue ?? 0;
  const transactions = data?.todayTransactions ?? 0;
  const lowStockCount = data?.lowStockCount ?? 0;
  const pendingRxCount = data?.pendingRxCount ?? 0;
  const lowStockDrugs = data?.lowStockDrugs ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
        <p className="text-sm text-slate-500">Track your pharmacy performance in real-time.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 p-5 text-white shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-white/85">Today's Revenue</span>
            <TrendingUp />
          </div>
          <p className="text-3xl font-bold">{isLoading ? "—" : fmt(revenue)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Transactions</span>
            <ShoppingCart className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? "—" : transactions}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Low Stock Alerts</span>
            <AlertTriangle className="text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? "—" : lowStockCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Pending Rx</span>
            <FileText className="text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{isLoading ? "—" : pendingRxCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white shadow">
          <header className="border-b border-slate-100 p-5">
            <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts</h3>
          </header>
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-5 text-sm text-slate-400">Loading…</div>
            ) : lowStockDrugs.length === 0 ? (
              <div className="p-5 text-sm text-slate-400">No low-stock items.</div>
            ) : (
              lowStockDrugs.map((drug) => (
                <div key={drug.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{drug.name}</p>
                    <p className="text-xs text-slate-500">{drug.strength ?? drug.form}</p>
                  </div>
                  <Badge variant={drug.stockQty === 0 ? "danger" : "warning"}>
                    {drug.stockQty === 0 ? "Out of stock" : `${drug.stockQty} units`}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => navigate(ROUTES.SALES)}>
              New Sale
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => navigate(ROUTES.PRESCRIPTIONS)}>
              New Prescription
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => navigate(ROUTES.INVENTORY)}>
              Add Drug to Inventory
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => navigate(ROUTES.PATIENTS)}>
              Register Patient
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
