import {
  useState,
  forwardRef,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// ─── FormField ────────────────────────────────────────────────────────────────

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden>*</span>
          )}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={[
            "w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-sm",
            "text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-600",
            "transition-all duration-150 outline-none",
            error
              ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
              : "border-gray-200 dark:border-gray-700 focus:border-amber-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          ].join(" ")}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${fieldId}-hint`}
            className="text-xs text-gray-500 dark:text-gray-500"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

// ─── PasswordField ────────────────────────────────────────────────────────────

type PasswordFieldProps = Omit<FormFieldProps, "type">;
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className = "", label, error, hint, required, id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const fieldId = id ?? (label as string).toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden>*</span>
          )}
        </label>

        {/* Input + toggle sit in a relative container */}
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={show ? "text" : "password"}
            className={[
              "w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 pr-12 text-sm",
              "text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-600",
              "transition-all duration-150 outline-none",
              error
                ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
                : "border-gray-200 dark:border-gray-700 focus:border-amber-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            ].join(" ")}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            required={required}
            {...props}
          />
          {/* Button is now relative to the input wrapper, not the whole field */}
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-gray-500 dark:text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
PasswordField.displayName = "PasswordField";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus-visible:ring-amber-400 shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 focus-visible:ring-gray-300",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus-visible:ring-gray-300",
    danger:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus-visible:ring-red-400 shadow-sm",
  };

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      ) : icon ? (
        <span aria-hidden>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

interface AlertProps {
  type: "error" | "success";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const styles = {
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${styles[type]}`}
    >
      {type === "error" ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-gray-200 dark:border-gray-700" />;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <Loader2
      className={`${sizes[size]} animate-spin text-amber-500`}
      aria-label="Loading"
    />
  );
}