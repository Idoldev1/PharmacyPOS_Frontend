import BarChartIcon from "@mui/icons-material/BarChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import PeopleIcon from "@mui/icons-material/People";
import KeyIcon from "@mui/icons-material/VpnKey";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Permissions } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { usePermissions } from "../../hooks/usePermissions";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  anyPermission?: string[];
}

const items: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: DashboardIcon },
  { to: ROUTES.SALES, label: "New Sale", icon: ShoppingCartIcon, anyPermission: [Permissions.Sales.Create] },
  { to: ROUTES.CHECKOUT, label: "Checkout", icon: KeyIcon, anyPermission: [Permissions.Sales.Complete] },
  { to: ROUTES.PRESCRIPTIONS, label: "Prescriptions", icon: DescriptionIcon, anyPermission: [Permissions.Prescriptions.View] },
  { to: ROUTES.PATIENTS, label: "Patients", icon: PeopleIcon, anyPermission: [Permissions.Patients.View, Permissions.Patients.ViewBasic] },
  { to: ROUTES.INVENTORY, label: "Inventory", icon: InventoryIcon, anyPermission: [Permissions.Inventory.View, Permissions.Inventory.ViewStockOnly] },
  { to: ROUTES.BILLING, label: "Billing", icon: ReceiptIcon, anyPermission: [Permissions.Billing.View] },
  {
    to: ROUTES.REPORTS, label: "Reports", icon: BarChartIcon,
    anyPermission: [
      Permissions.Reports.ViewAll, Permissions.Reports.ViewFinancial,
      Permissions.Reports.ViewOperational, Permissions.Reports.ViewInventory,
      Permissions.Reports.ViewPrescription, Permissions.Reports.ViewPersonalSales,
    ],
  },
  { to: ROUTES.SUPPLIERS, label: "Suppliers", icon: LocalPharmacyIcon, anyPermission: [Permissions.Suppliers.View] },
  {
    to: ROUTES.SETTINGS, label: "Settings", icon: SettingsIcon,
    anyPermission: [
      Permissions.Settings.View, Permissions.Settings.ManageSystem,
      Permissions.Settings.ManageUsers, Permissions.Settings.ManageDrugCatalog,
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { hasAnyPermission } = usePermissions();

  const visibleItems = items.filter(
    (item) => !item.anyPermission || hasAnyPermission(item.anyPermission),
  );

  return (
    <aside
      className={`relative flex flex-col overflow-visible bg-slate-800 text-slate-200 transition-[width] duration-300 ease-in-out dark:bg-slate-950 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center p-4 pb-6 transition-all duration-300 ${collapsed ? "justify-center pt-6" : "px-6 pt-6"}`}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-amber-500 text-base font-bold text-white">
          H+
        </div>
        {/* Name fades and collapses horizontally */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            collapsed ? "max-w-0 opacity-0" : "ml-3 max-w-[200px] opacity-100"
          }`}
        >
          <h2 className="whitespace-nowrap text-base font-bold text-white">
            {import.meta.env.VITE_PHARMACY_NAME ?? "Pharmacy"}
          </h2>
          <p className="whitespace-nowrap text-xs text-slate-400">Pharmacy POS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="group relative">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 text-sm transition-all duration-200 ${
                    collapsed ? "justify-center px-2" : "px-4"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-teal-500 font-semibold text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <Icon style={{ fontSize: 20 }} className="flex-shrink-0" />
                {/* Label fades + collapses; always rendered so flex gap is managed by ml */}
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                    collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[160px] opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>

              {/* Tooltip — only relevant while collapsed */}
              <div
                className={`pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-opacity duration-150 ${
                  collapsed ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* Toggle button — single chevron rotates 180° */}
      <div className="border-t border-slate-700 p-3 dark:border-slate-800">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex w-full items-center rounded-xl py-2 text-sm text-slate-400 transition-colors hover:bg-slate-700 hover:text-white ${
            collapsed ? "justify-center px-2" : "gap-2 px-3"
          }`}
        >
          <ChevronLeftIcon
            style={{ fontSize: 20 }}
            className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"
            }`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
