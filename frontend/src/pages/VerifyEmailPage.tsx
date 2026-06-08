import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Inbox, RefreshCw } from "lucide-react";
import { BASE } from "../api/base";
import { useLanguage } from "../hooks/useLanguage";

// ─── Session storage key (set by RegisterPage after successful registration) ──
export const PENDING_VERIFY_EMAIL_KEY = "pending_verify_email";

// ─── API helpers ──────────────────────────────────────────────────────────────

// Backend uses GET /auth/verify-email/<uid>/<token>/
async function verifyEmailApi(uid: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/verify-email/${uid}/${token}/`, {
    method: "GET",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string; detail?: string }).error ??
      (data as { detail?: string }).detail ??
      "Verification failed.",
    );
  }
}

async function resendVerificationApi(email: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/resend-verification/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string; detail?: string }).error ??
      (data as { detail?: string }).detail ??
      "Failed to resend. Try again.",
    );
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type VerifyState = "check_email" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid?: string; token?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = useLocation();

  const {email} = location.state || {};
  // If email is passed via state (e.g. from RegisterPage), store it for potential resending
  useEffect(() => {
    if (email) {
      sessionStorage.setItem(PENDING_VERIFY_EMAIL_KEY, email);
    }
  }, [email]);

  const hasToken = Boolean(uid && token);

  // Email stored by RegisterPage so we can resend without asking again
  const [pendingEmail] = useState<string>(
    () => sessionStorage.getItem(PENDING_VERIFY_EMAIL_KEY) ?? "",
  );

  const [state, setState] = useState<VerifyState>(
    hasToken ? "loading" : "check_email",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Auto-verify when uid + token are in URL
  useEffect(() => {
    if (!hasToken) return;
    verifyEmailApi(uid!, token!)
      .then(() => {
        // Clean up stored email on success
        sessionStorage.removeItem(PENDING_VERIFY_EMAIL_KEY);
        setState("success");
      })
      .catch((err: Error) => {
        setState("error");
        setErrorMsg(err.message || "Verification failed. The link may be expired or invalid.");
      });
  }, [uid, token, hasToken]);

  const handleResend = useCallback(async () => {
    if (!pendingEmail || resending) return;
    setResending(true);
    setResendError(null);
    try {
      await resendVerificationApi(pendingEmail);
      setResent(true);
    } catch (e: unknown) {
      setResendError((e as Error).message || "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  }, [pendingEmail, resending]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-900 rounded-2xl border border-white/5 p-8 text-center">

        {/* ── Check your email ─────────────────────────────────────── */}
        {state === "check_email" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Inbox size={28} className="text-amber-400" />
            </div>

            <div>
              <p className="text-white font-bold text-xl">
                {t("verifyEmail.checkTitle") || "Check your email"}
              </p>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                {t("verifyEmail.checkBody") ||
                  "We've sent a verification link to your email address. Click the link to activate your account."}
              </p>
              {pendingEmail && (
                <p className="text-amber-400/80 text-sm font-medium mt-2">
                  {pendingEmail}
                </p>
              )}
            </div>

            <div className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs">
                {t("verifyEmail.spamNote") ||
                  "Didn't receive it? Check your spam folder or resend below."}
              </p>
            </div>

            {/* Resend — uses stored email, no input needed */}
            <div className="w-full space-y-3">
              {resent ? (
                <div className="flex items-center gap-2 justify-center py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Mail size={14} className="text-green-400" />
                  <p className="text-green-400 text-sm font-medium">
                    {t("verifyEmail.resentSuccess") || "New verification email sent!"}
                  </p>
                </div>
              ) : (
                <>
                  {resendError && (
                    <p className="text-red-400 text-xs text-center">{resendError}</p>
                  )}
                  {pendingEmail ? (
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/5 disabled:opacity-50 text-gray-300 font-medium text-sm rounded-xl transition-colors"
                    >
                      {resending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {t("verifyEmail.resendButton") || "Resend verification email"}
                    </button>
                  ) : (
                    // Fallback if email not in session (e.g. navigated directly)
                    <p className="text-gray-600 text-xs text-center">
                      {t("verifyEmail.noEmailFallback") ||
                        "Please register again to receive a new verification link."}
                    </p>
                  )}
                </>
              )}

              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 font-medium text-sm rounded-xl transition-colors"
              >
                {t("verifyEmail.backToLogin") || "Back to login"}
              </Link>
            </div>
          </div>
        )}

        {/* ── Verifying ─────────────────────────────────────────────── */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Loader2 size={28} className="text-amber-500 animate-spin" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                {t("verifyEmail.verifyingTitle") || "Verifying your email…"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t("verifyEmail.verifyingBody") || "This will only take a moment."}
              </p>
            </div>
          </div>
        )}

        {/* ── Success ───────────────────────────────────────────────── */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">
                {t("verifyEmail.successTitle") || "Email Verified!"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t("verifyEmail.successBody") ||
                  "Your account is ready. You can now sign in."}
              </p>
            </div>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
            >
              {t("verifyEmail.signIn") || "Sign in to your account"}
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle size={30} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">
                {t("verifyEmail.errorTitle") || "Verification Failed"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {errorMsg ?? t("verifyEmail.errorBody") ?? "This link is invalid or has expired."}
              </p>
            </div>

            <div className="w-full space-y-3">
              {/* Resend with stored email */}
              {pendingEmail && !resent && (
                <>
                  {resendError && (
                    <p className="text-red-400 text-xs text-center">{resendError}</p>
                  )}
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/5 disabled:opacity-50 text-gray-300 font-medium text-sm rounded-xl transition-colors"
                  >
                    {resending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    {t("verifyEmail.resendButton") || "Resend verification email"}
                  </button>
                </>
              )}
              {resent && (
                <div className="flex items-center gap-2 justify-center py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Mail size={14} className="text-green-400" />
                  <p className="text-green-400 text-sm font-medium">
                    {t("verifyEmail.resentSuccess") || "New verification email sent!"}
                  </p>
                </div>
              )}
              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 font-medium text-sm rounded-xl transition-colors"
              >
                {t("verifyEmail.backToLogin") || "Back to login"}
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}