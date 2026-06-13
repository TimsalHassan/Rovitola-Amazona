import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import { FormField, PasswordField, Button, Alert } from "../components/FormElements";

type FormKey = "name" | "email" | "phone" | "password" | "confirmPassword";
type T = (field: string) => string;

function validateSingle(field: FormKey, value: string, form: Record<FormKey, string>, t: T): string | null {
  switch (field) {
    case "name":
      return !value.trim() ? t("register.nameRequired") : null;
    case "email":
      if (!value.trim()) return t("register.emailRequired");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t("register.emailInvalid");
      return null;
    case "phone":
      if (value && !/^\+?[\d\s\-()]{7,20}$/.test(value)) return t("register.phoneInvalid");
      return null;
    case "password":
      if (!value) return t("register.passwordRequired");
      if (value.length < 8) return t("register.passwordMinLength");
      return null;
    case "confirmPassword":
      if (!value) return t("register.confirmPasswordRequired");
      if (value !== form.password) return t("register.passwordMismatch");
      return null;
  }
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<FormKey, string>>({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function updateFieldError(field: FormKey, value: string, latestForm: Record<FormKey, string>) {
    const msg = validateSingle(field, value, latestForm, t);
    setFieldErrors((prev) => {
      if (msg) return { ...prev, [field]: msg };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleChange(field: FormKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const newForm = { ...form, [field]: value };
      setForm(newForm);
      if (touched[field]) updateFieldError(field, value, newForm);
      if (field === "password" && touched.confirmPassword) {
        updateFieldError("confirmPassword", newForm.confirmPassword, newForm);
      }
    };
  }

  function handleBlur(field: FormKey) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    updateFieldError(field, form[field], form);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    setTouched(Object.fromEntries((Object.keys(form) as FormKey[]).map((k) => [k, true])));

    const errors: Record<string, string> = {};
    (Object.keys(form) as FormKey[]).forEach((field) => {
      const msg = validateSingle(field, form[field], form, t);
      if (msg) errors[field] = msg;
    });
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
      });
      addToast({ type: "success", title: "Account created! Please verify your email.", duration: 4000 });
      // Backend returns { detail } — redirect to check-email page with email in state
      navigate("/verify-email", { replace: true, state: { email: form.email.trim() } });
    } catch (err: unknown) {
      const e = err as Error & { field?: string };
      if (e.field) {
        setFieldErrors({ [e.field]: e.message });
      } else {
        setError(e.message || t("register.errorGeneric"));
        addToast({ type: "error", title: "Registration failed", duration: 4000 });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("register.title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("register.subtitle")}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label={t("register.fullNameLabel")}
            type="text"
            placeholder={t("register.namePlaceholder")}
            value={form.name}
            onChange={handleChange("name")}
            onBlur={() => handleBlur("name")}
            error={fieldErrors.name}
            autoComplete="name"
            required
          />
          <FormField
            label={t("register.emailLabel")}
            type="email"
            placeholder={t("register.emailPlaceholder")}
            value={form.email}
            onChange={handleChange("email")}
            onBlur={() => handleBlur("email")}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />
          <FormField
            label={t("register.phoneLabel")}
            type="tel"
            placeholder="+358 40 000 0000"
            value={form.phone}
            onChange={handleChange("phone")}
            onBlur={() => handleBlur("phone")}
            error={fieldErrors.phone}
            autoComplete="tel"
            hint={t("register.phoneHint")}
          />
          <PasswordField
            label={t("register.passwordLabel")}
            placeholder={t("register.passwordPlaceholder")}
            value={form.password}
            onChange={handleChange("password")}
            onBlur={() => handleBlur("password")}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
          />
          <PasswordField
            label={t("register.confirmPasswordLabel")}
            placeholder={t("register.confirmPasswordPlaceholder")}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            onBlur={() => handleBlur("confirmPassword")}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            {loading ? t("register.creatingAccount") : t("register.createAccount")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("register.haveAccount")}
          <Link
            to="/login"
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
          >
            {t("register.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}