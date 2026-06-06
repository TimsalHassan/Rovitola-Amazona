import { useState, useEffect, type FormEvent } from "react";
import { MapPin, Star, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import type { Address } from "../api/auth";
import { FormField, Button, Alert } from "./FormElements";

// ─── Address Card ──────────────────────────────────────────────────────────

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const { deleteAddress, setDefaultAddress } = useAuth();
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto-cancel
      return;
    }
    setDeleting(true);
    try {
      await deleteAddress(address.id);
    } catch {
      setDeleting(false);
    }
  }

  async function handleSetDefault() {
    if (address.is_default) return;
    setSettingDefault(true);
    try {
      await setDefaultAddress(address.id);
    } finally {
      setSettingDefault(false);
    }
  }

  return (
    <div
      className={[
        "group relative rounded-2xl border p-4 transition-all duration-150",
        address.id < 0
          ? "opacity-60 border-dashed border-gray-200 dark:border-gray-700"
          : address.is_default
          ? "border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600",
      ].join(" ")}
    >
      {/* Default badge */}
      {address.is_default && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-current" />
          {t("account.addresses.defaultBadge")}
        </span>
      )}

      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {address.street_address}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {address.postal_code} {address.city}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {address.country}
          </p>
        </div>
      </div>

      {/* Actions */}
      {address.id > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {!address.is_default && (
            <button
              onClick={handleSetDefault}
              disabled={settingDefault}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
            >
              {settingDefault ? (
                <Check className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <Star className="w-3.5 h-3.5" />
              )}
              {t("account.addresses.setDefault")}
            </button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => onEdit(address)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label={t("account.addresses.editAria")}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={[
                "p-1.5 rounded-lg transition-colors",
                confirmDelete
                  ? "text-red-600 bg-red-50 dark:bg-red-900/30"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
              ].join(" ")}
              aria-label={confirmDelete ? t("account.addresses.confirmDeleteAria") : t("account.addresses.deleteAria")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Optimistic loading shimmer */}
      {address.id < 0 && (
        <div className="mt-2 text-xs text-gray-400 italic">{t("account.addresses.saving")}</div>
      )}
    </div>
  );
}

// ─── Address Modal ─────────────────────────────────────────────────────────

interface AddressModalProps {
  address?: Address | null; // null = creating new
  onClose: () => void;
}

type FormData = {
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const EMPTY_FORM: FormData = {
  street_address: "",
  city: "",
  postal_code: "",
  country: "Finland",
  is_default: false,
};

export function AddressModal({ address, onClose }: AddressModalProps) {
  const { addAddress, updateAddress } = useAuth();
  const { t } = useLanguage();
  const isEdit = !!address;

  const [form, setForm] = useState<FormData>(
    address
      ? {
          street_address: address.street_address,
          city: address.city,
          postal_code: address.postal_code,
          country: address.country,
          is_default: address.is_default,
        }
      : EMPTY_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      setFieldErrors((fe) => {
        const next = { ...fe };
        delete next[field];
        return next;
      });
    };
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.street_address.trim())
      errors.street_address = t("account.addresses.modal.streetRequired");
    if (!form.city.trim()) errors.city = t("account.addresses.modal.cityRequired");
    if (!form.postal_code.trim()) errors.postal_code = t("account.addresses.modal.postalRequired");
    if (!form.country.trim()) errors.country = t("account.addresses.modal.countryRequired");
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
      if (isEdit && address) {
        await updateAddress(address.id, form);
      } else {
        await addAddress(form);
      }
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || t("account.addresses.modal.saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2
            id="address-modal-title"
            className="text-base font-semibold text-gray-900 dark:text-white"
          >
            {isEdit ? t("account.addresses.modal.editTitle") : t("account.addresses.modal.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}

          <FormField
            label={t("account.addresses.modal.streetLabel")}
            type="text"
            placeholder="Aleksanterinkatu 3"
            value={form.street_address}
            onChange={set("street_address")}
            error={fieldErrors.street_address}
            autoComplete="street-address"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={t("account.addresses.modal.cityLabel")}
              type="text"
              placeholder="Lahti"
              value={form.city}
              onChange={set("city")}
              error={fieldErrors.city}
              autoComplete="address-level2"
              required
            />
            <FormField
              label={t("account.addresses.modal.postalLabel")}
              type="text"
              placeholder="15110"
              value={form.postal_code}
              onChange={set("postal_code")}
              error={fieldErrors.postal_code}
              autoComplete="postal-code"
              required
            />
          </div>
          <FormField
            label={t("account.addresses.modal.countryLabel")}
            type="text"
            placeholder="Finland"
            value={form.country}
            onChange={set("country")}
            error={fieldErrors.country}
            autoComplete="country-name"
            required
          />

          {/* Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.is_default}
                onChange={set("is_default")}
              />
              <div
                className={[
                  "w-10 h-5.5 rounded-full transition-colors duration-200",
                  form.is_default
                    ? "bg-amber-500"
                    : "bg-gray-200 dark:bg-gray-700",
                ].join(" ")}
              />
              <div
                className={[
                  "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200",
                  form.is_default ? "translate-x-4.5" : "translate-x-0",
                ].join(" ")}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t("account.addresses.modal.defaultLabel")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("account.addresses.modal.defaultHelp")}
              </p>
            </div>
          </label>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              {t("account.addresses.modal.cancel")}
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {loading ? t("account.addresses.saving") : isEdit ? t("account.addresses.modal.saveChanges") : t("account.addresses.modal.addAddress")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Address Button ────────────────────────────────────────────────────

export function AddAddressButton({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-600 dark:hover:text-amber-400 transition-all duration-150 group"
    >
      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
      {t("account.addresses.addNew")}
    </button>
  );
}