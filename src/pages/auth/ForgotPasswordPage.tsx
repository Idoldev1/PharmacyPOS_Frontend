import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import pharmacyImage from "../../assets/pharmacy_image.jpg";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async () => {
    setError("");
    setMessage("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(username);
      setMessage(
        response.data.message +
          (response.data.resetToken
            ? ` Your reset token is ${response.data.resetToken}`
            : ""),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request password reset.",
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
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">
            Password reset
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your username to receive a reset token.
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
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={requestReset}
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Requesting..." : "Request reset token"}
          </button>

          <div className="text-center text-sm text-slate-600">
            Remembered your password?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-teal-600 hover:text-teal-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
