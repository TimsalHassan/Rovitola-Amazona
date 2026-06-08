import { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Save,
  ShoppingCart,
  StickyNote,
  Trash2,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { type CartItem } from "../api/cart";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { addressApi, type Address } from "../api/auth";
import { useRestaurant } from "../context/RestaurantContext";

// ─── CartItemRow ──────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateItem } = useCart();
  const { language, t } = useLanguage();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(item.special_instruction);
  const [saving, setSaving] = useState(false);

  const name =
    (language === "fi" ? item.menu_item_name_fi : item.menu_item_name) ||
    item.menu_item_name;
  const lineTotal = parseFloat(item.line_total);

  async function handleQty(delta: number) {
    const next = item.quantity + delta;
    if (next <= 0) {
      await removeItem(item.id);
    } else {
      await updateItem(item.id, { quantity: next });
    }
  }

  async function handleNoteSave() {
    if (note === item.special_instruction) return;
    setSaving(true);
    try {
      await updateItem(item.id, {
        quantity: item.quantity,
        special_instruction: note,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
      <div className="flex gap-4">
        {item.menu_item_image ? (
          <img
            src={item.menu_item_image}
            alt={name}
            className="w-20 h-20 object-cover rounded-xl shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center shrink-0 text-2xl">
            🍽️
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-sm leading-snug">
              {name}
            </h3>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {item.selected_options.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {item.selected_options.map((opt) => {
                const optName =
                  (language === "fi" ? opt.option_name_fi : opt.option_name) ||
                  opt.option_name;
                const extraName =
                  (language === "fi" ? opt.extra_name_fi : opt.extra_name) ||
                  opt.extra_name;
                const price = parseFloat(opt.additional_price);
                return (
                  <p key={opt.id} className="text-xs text-gray-400">
                    <span className="text-gray-500">{extraName}:</span>{" "}
                    {optName}
                    {price > 0 && (
                      <span className="text-gray-500">
                        {" "}
                        (+€{price.toFixed(2)})
                      </span>
                    )}
                  </p>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-amber-400 font-bold text-sm">
              €{lineTotal.toFixed(2)}
            </span>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-1 py-0.5">
              <button
                onClick={() => handleQty(-1)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="text-white text-sm font-semibold w-5 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQty(1)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowNote((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <StickyNote size={12} />
            {showNote ? t("cart.itemNoteHide") : t("cart.itemNoteAdd")}
            {showNote ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showNote && (
            <div className="mt-2 space-y-1">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleNoteSave}
                placeholder={t("cart.itemNotePlaceholder")}
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/50"
                rows={2}
              />
              {saving && <p className="text-xs text-gray-500">Saving…</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Address form with structured fields + manual save ──────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AddressFields {
  street: string;
  city: string;
  postal: string;
  country: string;
}

const EMPTY_ADDRESS: AddressFields = {
  street: "",
  city: "",
  postal: "",
  country: "Finland",
};

interface AddressInputProps {
  value: AddressFields;
  onChange: (v: AddressFields) => void;
  onError: (msg: string) => void;
  savedAddresses: Address[];
  token: string | null;
  onAddressSaved: (addr: Address) => void;
  isLoggedIn: boolean;
  errorMsg?: string;
}

function AddressInput({
  value,
  onChange,
  onError,
  savedAddresses,
  token,
  onAddressSaved,
  isLoggedIn,
  errorMsg,
}: AddressInputProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<string>("");

  // Format fields → single string for comparison & API
  const toFormatted = (a: AddressFields) =>
    [a.street, a.city, a.postal, a.country]
      .filter((s) => s && s !== "-")
      .join(", ");

  const formatted = toFormatted(value);

  const patchField = (field: keyof AddressFields, v: string) => {
    onChange({ ...value, [field]: v });
    if (saveStatus === "saved" || saveStatus === "error") setSaveStatus("idle");
  };

  // Select a saved address chip → populate all fields
  const selectSaved = (addr: Address) => {
    onChange({
      street: addr.street_address,
      city: addr.city === "-" ? "" : addr.city,
      postal: addr.postal_code === "-" ? "" : addr.postal_code,
      country: addr.country || "Finland",
    });
    setSaveStatus("idle");
    isSavingRef.current = false;
  };

  // Already saved if the full formatted string matches any existing address
  const isAlreadySaved = savedAddresses.some((a) => {
    const f = [a.street_address, a.city, a.postal_code, a.country]
      .filter((s) => s && s !== "-")
      .join(", ");
    return f === formatted || a.street_address === value.street.trim();
  });

  const showSaveButton =
    isLoggedIn &&
    value.street.trim() &&
    !isAlreadySaved &&
    saveStatus !== "saving";

  const handleManualSave = async () => {
    const trimmed = value.street.trim();
    if (
      !token ||
      !trimmed ||
      formatted === lastSavedRef.current ||
      isSavingRef.current
    )
      return;

    isSavingRef.current = true;
    lastSavedRef.current = formatted;
    setSaveStatus("saving");

    try {
      const saved = await addressApi.create(token, {
        street_address: trimmed,
        city: value.city.trim() || "-",
        postal_code: value.postal.trim() || "-",
        country: value.country.trim() || "Finland",
        is_default: savedAddresses.length === 0,
      });
      onAddressSaved(saved);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      lastSavedRef.current = "";
      setSaveStatus("error");
      onError(err instanceof Error ? err.message : "Failed to save address");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      isSavingRef.current = false;
    }
  };

  return (
    <div className="space-y-3">
      {/* Saved address chips */}
      {savedAddresses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedAddresses.map((addr) => {
            const chipFormatted = [
              addr.street_address,
              addr.city,
              addr.postal_code,
              addr.country,
            ]
              .filter((s) => s && s !== "-")
              .join(", ");
            const isSelected =
              value.street === addr.street_address ||
              formatted === chipFormatted;
            return (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectSaved(addr)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-white/10 bg-gray-900 text-gray-400 hover:border-white/20"
                }`}
              >
                {addr.street_address}
                {addr.is_default && (
                  <span className="ml-1 text-amber-500/60">★</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Street address */}
      <div className="relative">
        <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-500" />
        <input
          type="text"
          value={value.street}
          onChange={(e) => patchField("street", e.target.value)}
          placeholder="Street address *"
          className={`w-full bg-gray-900 border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
            errorMsg && !value.street.trim()
              ? "border-red-500/60"
              : "border-white/10 focus:border-amber-500/50"
          }`}
        />
      </div>

      {/* City + Postal in a row */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={value.city}
          onChange={(e) => patchField("city", e.target.value)}
          placeholder="City"
          className="w-full bg-gray-900 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
        />
        <input
          type="text"
          value={value.postal}
          onChange={(e) => patchField("postal", e.target.value)}
          placeholder="Postal code"
          className="w-full bg-gray-900 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
        />
      </div>

      {/* Country */}
      <input
        type="text"
        value={value.country}
        onChange={(e) => patchField("country", e.target.value)}
        placeholder="Country"
        className="w-full bg-gray-900 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
      />

      {/* Bottom row: validation error / save status / save button */}
      <div className="flex items-center justify-between min-h-[20px]">
        <div className="flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <>
              <Loader2 size={11} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-400">Saving…</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check size={11} className="text-green-400" />
              <span className="text-xs text-green-400">Address saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-400">
              Failed to save — try again
            </span>
          )}
          {errorMsg && saveStatus === "idle" && (
            <span className="text-red-400 text-xs">{errorMsg}</span>
          )}
        </div>

        {showSaveButton && (
          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 bg-gray-900 hover:bg-amber-500/5 px-3 py-1.5 rounded-lg transition-all"
          >
            <Save size={11} />
            Save address
          </button>
        )}

        {isLoggedIn && value.street.trim() && isAlreadySaved && (
          <div className="flex items-center gap-1.5">
            <Check size={11} className="text-gray-600" />
            <span className="text-xs text-gray-600">Saved</span>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutFormData {
  orderType: "delivery" | "pickup";
  deliveryAddress: AddressFields;
  orderNotes: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { items, subtotal, totalItems, isLoading } = useCart();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const restaurant = useRestaurant();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutFormData>({
    orderType: "delivery",
    deliveryAddress: { ...EMPTY_ADDRESS },
    orderNotes: "",
    guestName: user?.name ?? "",
    guestPhone: user?.phone ?? "",
    guestEmail: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressError, setAddressError] = useState<string | undefined>();
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutFormData, string>>
  >({});

  // ── Fetch saved addresses ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) return;
    addressApi
      .list(token)
      .then((addresses) => {
        setSavedAddresses(addresses);
        const def = addresses.find((a) => a.is_default) ?? addresses[0];
        if (def) {
          setForm((f) => ({
            ...f,
            deliveryAddress: {
              street: def.street_address,
              city: def.city === "-" ? "" : def.city,
              postal: def.postal_code === "-" ? "" : def.postal_code,
              country: def.country || "Finland",
            },
          }));
        }
      })
      .catch(() => {});
  }, [user, token]);

  const handleAddressSaved = useCallback((addr: Address) => {
    setSavedAddresses((prev) => {
      const exists = prev.find((a) => a.id === addr.id);
      if (exists) return prev;
      return [...prev, addr];
    });
  }, []);

  // Round at source so navigate() state never carries a floating-point artifact
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const total = round2(subtotal + Number(restaurant.deliveryFee));

  const patch = useCallback((field: keyof CheckoutFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!user && !form.guestName.trim())
      e.guestName = t("cart.errors.nameRequired");
    if (!user && !form.guestPhone.trim())
      e.guestPhone = t("cart.errors.phoneRequired");
    if (form.orderType === "delivery" && !form.deliveryAddress.street.trim())
      e.deliveryAddress = t("cart.errors.deliveryAddressRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    // Format structured address fields into a clean string for the order payload

    // Store the email and password of the guest account to session storage
    
    const deliveryAddressStr = [
      form.deliveryAddress.street,
      form.deliveryAddress.city,
      form.deliveryAddress.postal,
      form.deliveryAddress.country,
    ]
      .filter((s) => s && s.trim() && s !== "-")
      .join(", ");

    navigate("/checkout", {
      state: {
        orderType: form.orderType,
        deliveryAddress: deliveryAddressStr,
        orderNotes: form.orderNotes,
        subtotal,
        deliveryCharge: restaurant.deliveryFee ? round2(Number(restaurant.deliveryFee)) : 0,
        discountAmount: 0,
        total,
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        guestEmail: form.guestEmail,
      },
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (totalItems === 0) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("cart.emptyTitle")}</h1>
          <p className="text-gray-400 text-sm mb-6">{t("cart.emptyBody")}</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            {t("cart.browseMenu")}
          </Link>
        </div>
      </main>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/menu"
            className="w-9 h-9 bg-gray-900 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("cart.title")}</h1>
            <p className="text-gray-500 text-sm">
              {totalItems} {t("cart.items")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ── Left ──────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Items */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t("cart.yourOrder")}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Order type */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t("cart.orderType")}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(["delivery", "pickup"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => patch("orderType", type)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      form.orderType === type
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-white/10 bg-gray-900 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {type === "delivery" ? (
                      <Truck size={16} />
                    ) : (
                      <Package size={16} />
                    )}
                    {t(`cart.${type}`)}
                  </button>
                ))}
              </div>
            </section>

            {/* Delivery address */}
            {form.orderType === "delivery" && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  {t("cart.deliveryAddress")}
                </h2>
                <AddressInput
                  value={form.deliveryAddress}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, deliveryAddress: v }))
                  }
                  onError={(msg) => setAddressError(msg)}
                  savedAddresses={savedAddresses}
                  token={token}
                  onAddressSaved={handleAddressSaved}
                  isLoggedIn={!!user}
                  errorMsg={errors.deliveryAddress || addressError}
                />
              </section>
            )}

            {/* Contact info */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t("cart.contactInfo")}
              </h2>
              {user ? (
                <div className="bg-gray-900 border border-white/5 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <UserIcon size={14} className="text-gray-500 shrink-0" />
                    <span>{user.name}</span>
                  </div>
                  {user.phone ? (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone size={14} className="text-gray-500 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  ) : (
                    <input
                      type="tel"
                      value={form.guestPhone}
                      onChange={(e) => patch("guestPhone", e.target.value)}
                      placeholder={t("cart.phonePlaceholder")}
                      className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={form.guestName}
                      onChange={(e) => patch("guestName", e.target.value)}
                      placeholder={t("cart.namePlaceholder")}
                      className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                        errors.guestName
                          ? "border-red-500/60"
                          : "border-white/10 focus:border-amber-500/50"
                      }`}
                    />
                    {errors.guestName && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.guestName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={form.guestPhone}
                      onChange={(e) => patch("guestPhone", e.target.value)}
                      placeholder={t("cart.phonePlaceholder")}
                      className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                        errors.guestPhone
                          ? "border-red-500/60"
                          : "border-white/10 focus:border-amber-500/50"
                      }`}
                    />
                    {errors.guestPhone && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.guestPhone}
                      </p>
                    )}
                  </div>
                  <input
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) => patch("guestEmail", e.target.value)}
                    placeholder={t("cart.emailPlaceholder")}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <p className="text-xs text-gray-500">
                    {t("cart.guestEmailNote")}
                  </p>
                </div>
              )}
            </section>

            {/* Order notes */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t("cart.orderNotes")}
              </h2>
              <textarea
                value={form.orderNotes}
                onChange={(e) => patch("orderNotes", e.target.value)}
                placeholder={t("cart.notesPlaceholder")}
                rows={2}
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </section>
          </div>

          {/* ── Right: summary ────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
              <h2 className="font-bold text-base mb-4">{t("cart.summary")}</h2>

              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-gray-400"
                  >
                    <span className="truncate max-w-[180px]">
                      {item.quantity}× {item.menu_item_name}
                    </span>
                    <span>€{parseFloat(item.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t("cart.subtotal")}</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t("cart.delivery")}</span>
                  <span>
                    {Number(restaurant.deliveryFee) === 0 ? (
                      <span className="text-green-400">{t("cart.free")}</span>
                    ) : (
                      `€${Number(restaurant.deliveryFee).toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>{t("cart.total")}</span>
                <span className="text-amber-400">€{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceed}
                className="mt-5 w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {t("cart.proceedToCheckout")}
                <ArrowRight size={15} />
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                {t("cart.choosePaymentNext")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
