import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import pharmacyImage from "../../assets/pharmacy_image.jpg";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changePassword = async () => {
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword) {
      setError("Current password and new password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMessage("Password successfully updated.");
      setTimeout(() => navigate(ROUTES.SETTINGS), 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to change password.",
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
          backgroundImage: `url(${pharmacyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/55" />
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Change password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update your password for your account.
          </p>
        </div>

        <div className="space-y-5">
          {error ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {message}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={changePassword}
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}
