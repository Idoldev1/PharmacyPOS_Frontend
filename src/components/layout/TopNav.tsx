import { Bell } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { UserNav } from "./UserNav";

export function TopNav() {
  const user = useAuthStore((s) => s.user);
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
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pharmacy Dashboard</h1>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{time}</div>
        <button className="relative rounded-xl p-3 transition hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
        </button>
        <UserNav />
      </div>
    </header>
  );
}
