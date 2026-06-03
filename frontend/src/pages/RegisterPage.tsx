import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { FormField, PasswordField, Button, Alert } from "../components/FormElements";

type FormKey = "name" | "email" | "phone" | "password" | "confirmPassword";
type T = (fi: string, en: string) => string;

function validateSingle(field: FormKey, value: string, form: Record<FormKey, string>, t: T): string | null {
  switch (field) {
    case "name":
      return !value.trim() ? t("Koko nimi vaaditaan.", "Full name is required.") : null;
    case "email":
      if (!value.trim()) return t("Sähköposti vaaditaan.", "Email is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return t(
          "Sähköpostiosoite ei ole kelvollinen. Kokeile muotoa sinä@esimerkki.com",
          "That doesn't look like a valid email. Try something like you@example.com"
        );
      return null;
    case "phone":
      if (value && !/^\+?[\d\s\-()]{7,20}$/.test(value))
        return t("Syötä kelvollinen puhelinnumero.", "Enter a valid phone number.");
      return null;
    case "password":
      if (!value) return t("Salasana vaaditaan.", "Password is required.");
      if (value.length < 8)
        return t(
          "Salasanan täytyy olla vähintään 8 merkkiä.",
          "Password must be at least 8 characters."
        );
      return null;
    case "confirmPassword":
      if (!value) return t("Vahvista salasanasi.", "Please confirm your password.");
      if (value !== form.password)
        return t("Salasanat eivät täsmää.", "Passwords do not match.");
      return null;
  }
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<FormKey, string>>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
      // Keep confirm password in sync when password changes
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
      });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const e = err as Error & { field?: string };
      if (e.field) {
        setFieldErrors({ [e.field]: e.message });
      } else {
        setError(t("Jokin meni pieleen. Yritä uudelleen.", "Something went wrong. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("Luo tili", "Create your account")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("Tilaa Amazonasta minuuteissa", "Order from Amazona in minutes")}
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
            label={t("Koko nimi", "Full name")}
            type="text"
            placeholder={t("Nimesi", "Your name")}
            value={form.name}
            onChange={handleChange("name")}
            onBlur={() => handleBlur("name")}
            error={fieldErrors.name}
            autoComplete="name"
            required
          />
          <FormField
            label={t("Sähköposti", "Email")}
            type="email"
            placeholder={t("sinä@esimerkki.com", "you@example.com")}
            value={form.email}
            onChange={handleChange("email")}
            onBlur={() => handleBlur("email")}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />
          <FormField
            label={t("Puhelinnumero", "Phone number")}
            type="tel"
            placeholder="+358 40 000 0000"
            value={form.phone}
            onChange={handleChange("phone")}
            onBlur={() => handleBlur("phone")}
            error={fieldErrors.phone}
            autoComplete="tel"
            hint={t(
              "Valinnainen — tarvitaan toimitusilmoituksiin",
              "Optional — needed for delivery updates"
            )}
          />
          <PasswordField
            label={t("Salasana", "Password")}
            placeholder={t("Väh. 8 merkkiä", "Min. 8 characters")}
            value={form.password}
            onChange={handleChange("password")}
            onBlur={() => handleBlur("password")}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
          />
          <PasswordField
            label={t("Vahvista salasana", "Confirm password")}
            placeholder={t("Toista salasanasi", "Repeat your password")}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            onBlur={() => handleBlur("confirmPassword")}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            {loading ? t("Luodaan tiliä…", "Creating account…") : t("Luo tili", "Create account")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("Onko sinulla jo tili? ", "Already have an account? ")}
          <Link
            to="/login"
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
          >
            {t("Kirjaudu sisään", "Sign in")}
          </Link>
        </p>
      </div>
    </div>
  );
}