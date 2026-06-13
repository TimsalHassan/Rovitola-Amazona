import { useState, type FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { Button, Alert, PasswordField } from "../components/FormElements";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = "Password is required.";
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    if (!uid || !token) {
      setError("Invalid or expired reset link.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ uid, token, new_password: newPassword });
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <KeyRound size={24} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset your password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose a new password for your account.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {done ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 size={22} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-base">
                Password updated!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <Button size="lg" className="w-full mt-2" onClick={() => navigate("/login")}>
              Go to login
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <PasswordField
                label={t("login.passwordLabel")}
                placeholder={t("login.passwordPlaceholder")}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: "" }));
                }}
                onBlur={() => {
                  const errs = validate();
                  if (errs.newPassword) setFieldErrors((p) => ({ ...p, newPassword: errs.newPassword }));
                }}
                error={fieldErrors.newPassword}
                autoComplete="new-password"
                required
              />

              <PasswordField
                label="Confirm password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                onBlur={() => {
                  const errs = validate();
                  if (errs.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: errs.confirmPassword }));
                }}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                {loading ? "Resetting…" : "Reset password"}
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