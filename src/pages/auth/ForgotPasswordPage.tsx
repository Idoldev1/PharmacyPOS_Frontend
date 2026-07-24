import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import pharmacyImage from "../../assets/pharmacy_image.jpg";

type Step = "email" | "otp" | "password" | "done";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      await authService.requestOtp(email.trim());
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim(), otp.trim());
      setResetToken(res.data.resetToken);
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    email: { title: "Password Reset", subtitle: "Enter your Gmail to receive a one-time code." },
    otp: { title: "Enter OTP", subtitle: `We sent a 6-digit code to ${email}` },
    password: { title: "New Password", subtitle: "Choose a strong new password." },
    done: { title: "Password Updated", subtitle: "Your password has been reset successfully." },
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

        {/* Step indicator dots */}
        <div className="mb-6 flex items-center gap-2">
          {(["email", "otp", "password"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  step === s
                    ? "w-6 bg-teal-600"
                    : ["email", "otp", "password"].indexOf(step) > i || step === "done"
                    ? "bg-teal-400"
                    : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{stepTitles[step].title}</h2>
        <p className="mb-7 mt-1 text-center text-sm text-slate-500">{stepTitles[step].subtitle}</p>

        {error && (
          <div className="mb-4 w-full rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="w-full space-y-4">
          {/* Step 1 â€” Email */}
          {step === "email" && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Gmail address</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                  placeholder="your@gmail.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* Step 2 â€” OTP */}
          {step === "otp" && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">One-time code</p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  placeholder="6-digit code"
                  maxLength={6}
                  inputMode="numeric"
                  className={`${inputClass} text-center tracking-[0.5em] text-lg`}
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
              >
                Use a different email
              </button>
            </>
          )}

          {/* Step 3 â€” New password */}
          {step === "password" && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">New password</p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Confirm password</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  placeholder="Repeat new password"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </>
          )}

          {/* Step 4 â€” Done */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-sm text-slate-500">
                You can now sign in with your new password.
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Back to Sign in
              </Link>
            </div>
          )}

          {step !== "done" && (
            <div className="text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link to={ROUTES.LOGIN} className="text-teal-600 hover:text-teal-700">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

