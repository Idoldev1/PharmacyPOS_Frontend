import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import pharmacyImage2 from "../../assets/pharmacy_image_2.jpg";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (!token.trim() || !newPassword) {
      setError("Reset token and new password are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setMessage("Password has been reset. You can now sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
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
          backgroundImage: `url(${pharmacyImage2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
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
      <div className="relative z-10 flex w-[430px] flex-col items-center justify-center overflow-y-auto bg-white px-8 py-10 shadow-2xl">
        {/* H+ logo */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-xl font-extrabold tracking-tight text-white shadow-lg">
          H+
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
        <p className="mb-7 mt-1 text-sm text-slate-500">Enter your reset token and choose a new password.</p>

        {error && (
          <div className="mb-4 w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="w-full space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Reset token</p>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter reset token"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">New password</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Confirm password</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <div className="text-center text-sm text-slate-500">
            <Link to={ROUTES.LOGIN} className="text-teal-600 hover:text-teal-700">
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

