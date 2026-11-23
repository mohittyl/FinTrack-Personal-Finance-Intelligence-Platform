import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
  Wallet,
} from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please login." },
      });
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.error ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e7e2d7] bg-[#fcfbf8] py-3 pl-11 pr-4 text-sm text-[#30382e] outline-none transition placeholder:text-[#aaa99f] focus:border-[#7c8964] focus:bg-white focus:ring-4 focus:ring-[#7c8964]/10";

  return (
    <main className="min-h-screen bg-[#f5f3ec] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[28px] border border-[#e9e5da] bg-[#fffefa] shadow-[0_24px_80px_rgba(65,67,48,0.08)] lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative hidden overflow-hidden bg-[#e8eddf] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#d5dfc7]/80" />
          <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full border border-[#c4cfb4]" />
          <div className="absolute bottom-24 right-10 h-48 w-48 rounded-full bg-[#f0d9c9]/70" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#657653] text-white shadow-sm">
              <Wallet size={21} />
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#35412f]">FinTrack</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c8d2bb] bg-white/50 px-3 py-1.5 text-xs font-medium tracking-wide text-[#647452]">
              <Leaf size={13} /> Start with a fresh perspective
            </span>
            <h1 className="max-w-md text-5xl font-semibold leading-[1.12] tracking-[-0.04em] text-[#35412f] xl:text-[58px]">
              Your next chapter starts here.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-[#687360]">
              Bring your everyday finances together and turn your plans into
              steady, achievable progress.
            </p>

            <div className="mt-12 max-w-sm rounded-2xl border border-white/70 bg-white/45 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium leading-6 text-[#536348]">
                “The goal isn't to track every rupee. It's to feel more in
                control of where it goes.”
              </p>
              <p className="mt-3 text-xs text-[#87917b]">A more mindful money routine</p>
            </div>
          </div>

          <p className="relative z-10 text-xs text-[#78816f]">Simple tools for thoughtful decisions.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#657653] text-white">
                <Wallet size={20} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-[#35412f]">FinTrack</span>
            </div>

            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a9677]">Get started</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#30382e] sm:text-[34px]">
                Create your account.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#85877d]">
                A few details and you're ready to go.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-[#efc9bd] bg-[#fff3ee] px-4 py-3 text-sm text-[#a34f3e]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#50584a]">
                  Your name
                </label>
                <div className="relative">
                  <UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9d90]" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="How should we call you?"
                    autoComplete="name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#50584a]">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9d90]" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#50584a]">
                  Create password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9d90]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#92978a] transition hover:bg-[#efeee7] hover:text-[#536348]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#999b91]">Use at least 6 characters.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#50584a]">
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9d90]" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#92978a] transition hover:bg-[#efeee7] hover:text-[#536348]"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#687957] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(104,121,87,0.18)] transition hover:bg-[#586849] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight size={17} className="transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-7 border-t border-[#eeece4] pt-6 text-center">
              <p className="text-sm text-[#85877d]">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-[#687957] transition hover:text-[#4f6042]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
