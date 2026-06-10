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
      setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
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
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the reset token and choose a new password.
          </p>
        </div>

        <div className="space-y-5">
          {error ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reset token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter reset token"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <div className="text-center text-sm text-slate-600">
            <Link
              to={ROUTES.LOGIN}
              className="text-teal-600 hover:text-teal-700"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
