import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type State = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !token) {
      setState("error");
      setErrorMsg("Invalid verification link.");
      return;
    }

    verifyEmail(uid, token)
      .then(() => setState("success"))
      .catch((err: Error) => {
        setState("error");
        setErrorMsg(err.message || "Verification failed. The link may be expired or invalid.");
      });
  }, [token, uid, verifyEmail]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">

        {/* Loading */}
        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Loader2 size={28} className="text-amber-500 animate-spin" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-lg">Verifying your email…</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This will only take a moment.</p>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {state === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* Animated check */}
            <div className="relative flex items-center justify-center">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-green-400/20"
                  initial={{ width: 64, height: 64, opacity: 0.5 }}
                  animate={{ width: 64 + (i + 1) * 32, height: 64 + (i + 1) * 32, opacity: 0 }}
                  transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CheckCircle2 size={30} className="text-green-400" />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-gray-900 dark:text-white font-bold text-xl">Email Verified!</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Your account is ready. You can now sign in.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
              >
                Sign in to your account
                <ArrowRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Error */}
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle size={30} className="text-red-400" />
            </div>

            <div>
              <p className="text-gray-900 dark:text-white font-bold text-xl">Verification Failed</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {errorMsg ?? "This link is invalid or has expired."}
              </p>
            </div>

            <div className="w-full space-y-2">
              <ResendVerificationSection />
              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl transition-colors"
              >
                Back to login
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function ResendVerificationSection() {
  const { resendVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleResend() {
    if (!email.trim()) return;
    setSending(true);
    setErr(null);
    try {
      await resendVerification(email.trim());
      setSent(true);
    } catch (e: unknown) {
      setErr((e as Error).message || "Failed to resend. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 justify-center py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
        <Mail size={14} className="text-green-400" />
        <p className="text-green-400 text-sm font-medium">New verification email sent!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {err && <p className="text-red-400 text-xs text-center">{err}</p>}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 focus:border-amber-500 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white text-sm outline-none transition-colors placeholder:text-gray-400"
        />
        <button
          onClick={handleResend}
          disabled={sending || !email.trim()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-bold text-sm rounded-xl transition-colors shrink-0"
        >
          {sending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Resend"
          )}
        </button>
      </div>
    </div>
  );
}