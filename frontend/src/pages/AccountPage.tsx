import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { User, Lock, MapPin, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import {
  FormField,
  PasswordField,
  Button,
  Alert,
  Spinner,
} from "../components/FormElements";
import {
  AddressCard,
  AddressModal,
  AddAddressButton,
} from "../components/AddressComponents";
import type { Address } from "../api/auth";

type Tab = "profile" | "security" | "addresses";

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/account" }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t("account.title")}
        </h1>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl mb-6">
          {(
            [
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "addresses", label: "Addresses", icon: MapPin },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all duration-150",
                activeTab === id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {id === "profile"
                  ? t("account.tabs.profile")
                  : id === "security"
                  ? t("account.tabs.security")
                  : t("account.tabs.addresses")}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "addresses" && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  console.log(user);

  const isDirty = name !== user?.name || phone !== user?.phone;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: t("account.profile.nameRequired") });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as Error & { field?: string };
      if (e.field) setFieldErrors({ [e.field]: e.message });
      else setError(e.message || t("account.profile.updateError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("account.profile.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("account.profile.subtitle")}
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("account.profile.emailLabel")}
        </label>
        <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          {user?.email}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t("account.profile.emailHint")}
        </p>
      </div>

      {success && (
        <Alert type="success" message={t("account.profile.success")} />
      )}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label={t("account.profile.fullNameLabel")}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          autoComplete="name"
          required
        />
        <FormField
          label={t("account.profile.phoneLabel")}
          type="tel"
          placeholder="+358 40 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
          autoComplete="tel"
          hint={t("account.profile.phoneHint")}
        />
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            loading={loading}
            disabled={!isDirty}
            className="flex-shrink-0"
          >
            {loading ? "Saving…" : success ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {t("account.profile.saved")}
              </span>
            ) : t("account.profile.saveChanges")}
          </Button>
        </div>
      </form>

      {/* Logout */}
      <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          icon={<LogOut className="w-4 h-4" />}
          onClick={handleLogout}
          className="text-gray-500 dark:text-gray-400"
        >
          {t("account.profile.signOut")}
        </Button>
      </div>
    </div>
  );
}

// ─── Security Tab ────────────────────────────────────────────────────────

function SecurityTab() {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((fe) => {
        const next = { ...fe };
        delete next[field];
        return next;
      });
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const errors: Record<string, string> = {};
    if (!form.current_password)
      errors.current_password = t("account.security.errors.currentRequired");
    if (!form.new_password) errors.new_password = t("account.security.errors.newRequired");
    else if (form.new_password.length < 8)
      errors.new_password = t("account.security.errors.minLength");
    if (form.new_password !== form.confirm_password)
      errors.confirm_password = t("account.security.errors.mismatch");

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: unknown) {
      const e = err as Error & { field?: string };
      if (e.field) setFieldErrors({ [e.field]: e.message });
      else setError(e.message || t("account.security.updateError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("account.security.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("account.security.subtitle")}
        </p>
      </div>

      {success && (
        <Alert type="success" message={t("account.security.success")} />
      )}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordField
          label={t("account.security.currentPassword")}
          value={form.current_password}
          onChange={set("current_password")}
          error={fieldErrors.current_password}
          autoComplete="current-password"
          required
        />
        <PasswordField
          label={t("account.security.newPassword")}
          placeholder={t("account.security.newPasswordHint")}
          value={form.new_password}
          onChange={set("new_password")}
          error={fieldErrors.new_password}
          autoComplete="new-password"
          required
        />
        <PasswordField
          label={t("account.security.confirmPassword")}
          placeholder={t("account.security.confirmPasswordHint")}
          value={form.confirm_password}
          onChange={set("confirm_password")}
          error={fieldErrors.confirm_password}
          autoComplete="new-password"
          required
        />
        <Button type="submit" loading={loading} className="self-start">
          {loading ? t("account.security.updating") : t("account.security.update")}
        </Button>
      </form>
    </div>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────

function AddressesTab() {
  const { addresses } = useAuth();
  const { t } = useLanguage();
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [showModal, setShowModal] = useState(false);

  function openAdd() {
    setEditTarget(null);
    setShowModal(true);
  }

  function openEdit(address: Address) {
    setEditTarget(address);
    setShowModal(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("account.addresses.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("account.addresses.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} onEdit={openEdit} />
        ))}
        <AddAddressButton onClick={openAdd} />
      </div>

      {showModal && (
        <AddressModal
          address={editTarget}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}