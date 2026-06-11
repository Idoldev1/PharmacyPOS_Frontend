import BarChartIcon from "@mui/icons-material/BarChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const items = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: DashboardIcon },
  { to: ROUTES.SALES, label: "New Sale", icon: ShoppingCartIcon },
  { to: ROUTES.PRESCRIPTIONS, label: "Prescriptions", icon: DescriptionIcon },
  { to: ROUTES.PATIENTS, label: "Patients", icon: PeopleIcon },
  { to: ROUTES.INVENTORY, label: "Inventory", icon: InventoryIcon },
  { to: ROUTES.BILLING, label: "Billing", icon: ReceiptIcon },
  { to: ROUTES.REPORTS, label: "Reports", icon: BarChartIcon },
  { to: ROUTES.SUPPLIERS, label: "Suppliers", icon: LocalPharmacyIcon },
  { to: ROUTES.SETTINGS, label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-slate-800 text-slate-200 transition-all duration-300 dark:bg-slate-950 overflow-visible ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 pb-6 ${collapsed ? "justify-center" : "px-6 pt-6"}`}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-amber-500 text-base font-bold text-white">
          H+
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-white">
              {import.meta.env.VITE_PHARMACY_NAME ?? "Pharmacy"}
            </h2>
            <p className="text-xs text-slate-400">Pharmacy POS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 text-sm transition ${
                    collapsed ? "justify-center px-0" : "gap-3 px-4"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 font-semibold text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <Icon style={{ fontSize: 20 }} className="flex-shrink-0" />
                {!collapsed && item.label}
              </NavLink>

              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className={`border-t border-slate-700 p-3 dark:border-slate-800 ${collapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-700 hover:text-white ${
            collapsed ? "justify-center px-0 w-10 h-10" : "w-full"
          }`}
        >
          {collapsed ? (
            <ChevronRightIcon style={{ fontSize: 20 }} className="flex-shrink-0" />
          ) : (
            <>
              <ChevronLeftIcon style={{ fontSize: 20 }} className="flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
