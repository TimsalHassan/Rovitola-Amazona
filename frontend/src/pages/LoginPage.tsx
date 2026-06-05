import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { FormField, PasswordField, Button, Alert } from "../components/FormElements";

type T = (fi: string, en: string) => string;

function validateEmail(value: string, t: T): string | null {
  if (!value) return t("login.emailRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return t("login.emailInvalid");
  return null;
}

function validatePassword(value: string, t: T): string | null {
  if (!value) return t("login.passwordRequired");
  if (value.length < 6)
    return t("login.passwordMinLength");
  return null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateField(name: string, value: string) {
    let msg: string | null = null;
    if (name === "email") msg = validateEmail(value, t);
    if (name === "password") msg = validatePassword(value, t);
    setFieldErrors((prev) => {
      if (msg) return { ...prev, [name]: msg };
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleBlur(name: string, value: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (touched.email) validateField("email", e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (touched.password) validateField("password", e.target.value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    const errors: Record<string, string> = {};
    const emailErr = validateEmail(email, t);
    const passErr = validatePassword(password, t);
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as Error & { field?: string };
      if (e.field) {
        setFieldErrors({ [e.field]: e.message });
      } else {
        setError(
          t("login.signInError")
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("login.title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("login.subtitle")}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {location.state?.message && (
          <div className="mb-4">
            <Alert type="success" message={location.state.message} />
          </div>
        )}
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
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email", email)}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />
          <PasswordField
            label={t("login.passwordLabel")}
            placeholder={t("login.passwordPlaceholder")}
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password", password)}
            error={fieldErrors.password}
            autoComplete="current-password"
            required
          />

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            {loading ? t("login.signingIn") : t("login.signIn")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("login.noAccount")}
          <Link
            to="/register"
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
          >
            {t("login.createOne")}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
        {t("login.termsPrefix")}
        <span className="underline cursor-pointer">
          {t("login.termsLink")}
        </span>
        .
      </p>
    </div>
  );
}