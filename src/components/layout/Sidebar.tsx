import { BarChart3, FileText, LayoutDashboard, Package, Receipt, Settings, ShoppingCart, Truck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const items = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.SALES, label: "New Sale", icon: ShoppingCart },
  { to: ROUTES.PRESCRIPTIONS, label: "Prescriptions", icon: FileText },
  { to: ROUTES.PATIENTS, label: "Patients", icon: Users },
  { to: ROUTES.INVENTORY, label: "Inventory", icon: Package },
  { to: ROUTES.BILLING, label: "Billing", icon: Receipt },
  { to: ROUTES.REPORTS, label: "Reports", icon: BarChart3 },
  { to: ROUTES.SUPPLIERS, label: "Suppliers", icon: Truck },
  { to: ROUTES.SETTINGS, label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-72 bg-slate-800 p-6 text-slate-200">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-amber-500 text-xl font-bold text-white">
          H+
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">HealthPlus</h2>
          <p className="text-xs text-slate-400">Pharmacy POS</p>
        </div>
      </div>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
