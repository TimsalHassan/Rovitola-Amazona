import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/admin/AdminAuthContext";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError((err as Error).message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#030712" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Amber glow blob */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[360px]">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl"
            style={{ background: "#f59e0b", boxShadow: "0 0 40px rgba(245,158,11,0.25)" }}
          >
            🍽
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">Amazona</h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-semibold">Admin Access</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#0a0f1e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">Sign in to continue</p>

          {error && (
            <div
              className="mb-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <span className="shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ravintolaamazona.fi"
                autoComplete="email"
                required
                className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all placeholder:text-gray-700"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            <div>
              <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none pr-10 transition-all placeholder:text-gray-700"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors text-xs"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-gray-900 transition-all mt-2"
              style={{
                background: loading ? "#d97706" : "#f59e0b",
                boxShadow: "0 4px 24px rgba(245,158,11,0.15)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-[10px] mt-5 uppercase tracking-widest">
          Ravintola Amazona © {new Date().getFullYear()} · Admin Only
        </p>
      </div>
    </div>
  );
}