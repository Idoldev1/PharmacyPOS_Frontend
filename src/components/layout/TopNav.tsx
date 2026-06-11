import { Bell, Moon, Sun } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { UserNav } from "./UserNav";

export function TopNav() {
  const { isDark, toggleDark } = useUiStore();

  const date = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pharmacy Dashboard</h1>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          {time}
        </div>

        <button
          onClick={toggleDark}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-500" />
          )}
        </button>

        <button className="relative rounded-xl p-3 transition hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
        </button>

        <UserNav />
      </div>
    </header>
  );
}
