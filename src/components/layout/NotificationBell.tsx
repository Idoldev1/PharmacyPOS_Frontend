import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, FileText } from "lucide-react";
import { Badge } from "../ui/Badge";
import { ROUTES } from "../../constants/routes";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Permissions } from "../../constants/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import { dashboardService } from "../../services/dashboardService";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();

  const canViewInventory = hasAnyPermission([
    Permissions.Inventory.View,
    Permissions.Inventory.ViewStockOnly,
  ]);
  const canViewPrescriptions = hasAnyPermission([Permissions.Prescriptions.View]);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: () => dashboardService.getSummary().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const lowStockCount = canViewInventory ? (data?.lowStockCount ?? 0) : 0;
  const lowStockDrugs = canViewInventory ? (data?.lowStockDrugs ?? []) : [];
  const pendingRxCount = canViewPrescriptions ? (data?.pendingRxCount ?? 0) : 0;
  const totalCount = lowStockCount + pendingRxCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative rounded-xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-300" />
        {totalCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
          </div>

          {totalCount === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">You're all caught up.</div>
          ) : (
            <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {lowStockCount > 0 && (
                <div>
                  <button
                    onClick={() => handleNavigate(ROUTES.INVENTORY)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-500" /> Low Stock
                    </span>
                    <span>{lowStockCount}</span>
                  </button>
                  {lowStockDrugs.slice(0, 5).map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => handleNavigate(ROUTES.INVENTORY)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{drug.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{drug.strength ?? drug.form}</p>
                      </div>
                      <Badge variant={drug.stockQty === 0 ? "danger" : "warning"}>
                        {drug.stockQty === 0 ? "Out of stock" : `${drug.stockQty} units`}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {pendingRxCount > 0 && (
                <button
                  onClick={() => handleNavigate(ROUTES.PRESCRIPTIONS)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                    <FileText size={14} className="text-amber-500" /> Pending prescriptions
                  </span>
                  <Badge variant="warning">{pendingRxCount}</Badge>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
