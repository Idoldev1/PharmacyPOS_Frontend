import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import pharmacyImage2 from "../../assets/pharmacy_image_2.jpg";

const roles = ["Pharmacist", "Cashier", "Manager", "Admin"] as const;

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("Pharmacist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const signup = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await authService.signup({
        username,
        password,
        firstName,
        lastName,
        role,
        branchId: "hq",
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create account.",
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

      {success ? (
        <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/95 p-10 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Account created!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your account has been created successfully. Redirecting to login…
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="mt-6 inline-block rounded-xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Sign in now
          </Link>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold text-slate-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign up and start managing pharmacy operations.
            </p>
          </div>

          <div className="space-y-5">
            {error ? (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as (typeof roles)[number])
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={signup}
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>

            <div className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-teal-600 hover:text-teal-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
