import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import pharmacyImage from "../../assets/pharmacy_image.jpg";

const ROLES = ["Pharmacist", "Cashier", "Manager", "Admin", "ChiefPharmacist"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABELS: Record<Role, string> = {
  Pharmacist: "Pharmacist",
  Cashier: "Cashier",
  Manager: "Manager",
  Admin: "Admin",
  ChiefPharmacist: "Chief Pharmacist",
};

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("Pharmacist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(username, password, selectedRole);
      setAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken,
      );
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${pharmacyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Translucent overlay */}
      <div className="absolute inset-0 bg-slate-900/55" />

      {/* Left hero panel */}
      <div className="relative z-10 flex flex-1 flex-col justify-center p-14 text-white">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Trusted Healthcare Platform
        </div>

        {(() => {
          const name = import.meta.env.VITE_PHARMACY_NAME ?? "Pharmacy";
          const lastSpace = name.lastIndexOf(" ");
          const line1 = lastSpace > 0 ? name.slice(0, lastSpace) : name;
          const line2 = lastSpace > 0 ? name.slice(lastSpace + 1) : null;
          return (
            <>
              <h1
                className="mb-1 text-7xl font-semibold leading-none text-white"
                style={{ fontFamily: "'Crimson Text', Georgia, serif" }}
              >
                {line1}
              </h1>
              {line2 && (
                <h2
                  className="mb-8 text-7xl font-semibold leading-none text-teal-400"
                  style={{ fontFamily: "'Crimson Text', Georgia, serif" }}
                >
                  {line2}
                </h2>
              )}
            </>
          );
        })()}

        <p className="mb-14 max-w-sm text-base leading-relaxed text-white/75">
          Advanced pharmaceutical management system designed for modern
          healthcare professionals.
        </p>

        <div className="flex items-center gap-8">
          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-white/55">Support</p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div>
            <p className="text-2xl font-bold">99.9%</p>
            <p className="text-sm text-white/55">Uptime</p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div>
            <p className="text-2xl font-bold">500K+</p>
            <p className="text-sm text-white/55">Prescriptions</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 flex w-[430px] flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="my-auto flex flex-col items-center px-8 py-6">
          {/* H+ logo */}
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-extrabold tracking-tight text-white shadow-lg">
            H+
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">Sign in to continue</p>

          {/* Role selector */}
          <div className="mb-4 w-full">
            <p className="mb-2 text-sm font-medium text-slate-700">Select Role</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role, i) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    i === ROLES.length - 1 ? "col-span-2" : ""
                  } ${
                    selectedRole === role
                      ? "bg-teal-600 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600"
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div className="mb-3 w-full">
            <p className="mb-1.5 text-sm font-medium text-slate-700">Username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Password */}
          <div className="mb-4 w-full">
            <p className="mb-1.5 text-sm font-medium text-slate-700">Password</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 w-full rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
