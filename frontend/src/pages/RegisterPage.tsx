import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FormField,
  PasswordField,
  Button,
  Alert,
} from "../components/FormElements";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      // Clear error on change
      setFieldErrors((fe) => {
        const next = { ...fe };
        delete next[field];
        return next;
      });
    };
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address.";
    if (form.phone && !/^\+?[\d\s\-()]{7,20}$/.test(form.phone))
      errors.phone = "Enter a valid phone number.";
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validate();
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
        setError(e.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 text-white text-2xl font-bold mb-4 shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Order from Amazona in minutes
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormField
              label="Full name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={set("name")}
              error={fieldErrors.name}
              autoComplete="name"
              required
            />
            <FormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />
            <FormField
              label="Phone number"
              type="tel"
              placeholder="+358 40 000 0000"
              value={form.phone}
              onChange={set("phone")}
              error={fieldErrors.phone}
              autoComplete="tel"
              hint="Optional — needed for delivery updates"
            />
            <PasswordField
              label="Password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              error={fieldErrors.password}
              autoComplete="new-password"
              required
            />
            <PasswordField
              label="Confirm password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}