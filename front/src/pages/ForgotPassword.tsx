import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { FormField, Button, Alert } from "../components/FormElements";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t("login.emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("login.emailInvalid"));
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error).message || t("register.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {sent ? (
          // ── Success state ──────────────────────────────────────────────────
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 size={22} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-base">
                Check your inbox
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                If <span className="text-amber-500 font-medium">{email}</span> is registered,
                a reset link has been sent. Check your spam folder if you don't see it.
              </p>
            </div>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium transition-colors"
            >
              Try a different email
            </button>
          </div>
        ) : (
          // ── Form ──────────────────────────────────────────────────────────
          <>
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormField
                label={t("login.emailLabel")}
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => {
                  if (!email.trim()) setError(t("login.emailRequired"));
                }}
                error={error ?? undefined}
                autoComplete="email"
                required
              />

              <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <ArrowLeft size={14} />
          <Link
            to="/login"
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
          >
            {t("verifyEmail.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}