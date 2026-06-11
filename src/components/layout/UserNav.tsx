import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

export function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      await authService.logout(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2 transition hover:bg-slate-200"
      >
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {user ? `${user.firstName} ${user.lastName}`.trim() : "User"}
          </div>
          <div className="text-xs text-slate-500">{user?.role ?? "staff"}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-amber-500">
          <User size={18} className="text-white" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">
              {user ? `${user.firstName} ${user.lastName}`.trim() : "User"}
            </div>
            <div className="text-xs text-slate-500">
              {user?.role ?? "staff"}
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleNavigate(`${ROUTES.SETTINGS}#profile`)}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleNavigate(ROUTES.SETTINGS)}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
