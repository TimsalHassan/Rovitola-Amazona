import { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  StickyNote,
  Trash2,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { type CartItem } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useLanguage } from "../hooks/useLanguage";
import { addressApi, type Address } from "../api/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_CHARGE = 3.9;
const FREE_DELIVERY_THRESHOLD = 30;

// ─── CartItemRow ──────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity, updateInstruction } = useCart();
  const { language, t } = useLanguage();
  const [showNote, setShowNote] = useState(false);

  const name =
    (language === "fi" ? item.menuItem.name_fi : item.menuItem.name) ||
    item.menuItem.name ||
    item.menuItem.name_fi;

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
      <div className="flex gap-4">
        {item.menuItem.image ? (
          <img
            src={item.menuItem.image}
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
            <h3 className="text-white font-semibold text-sm leading-snug">{name}</h3>
            <button
              onClick={() => removeItem(item.cartKey)}
              className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
              aria-label={t("cart.removeItem")}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {item.selectedOptions.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {item.selectedOptions.map((opt) => {
                const optName =
                  (language === "fi" ? opt.option_name_fi : opt.option_name) || opt.option_name;
                const extraName =
                  (language === "fi" ? opt.extra_name_fi : opt.extra_name) || opt.extra_name;
                return (
                  <p key={`${opt.extra_id}-${opt.option_id}`} className="text-xs text-gray-400">
                    <span className="text-gray-500">{extraName}:</span> {optName}
                    {opt.additional_price > 0 && (
                      <span className="text-gray-500"> (+€{opt.additional_price.toFixed(2)})</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-amber-400 font-bold text-sm">
              €{item.totalPrice.toFixed(2)}
            </span>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-1 py-0.5">
              <button
                onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="text-white text-sm font-semibold w-5 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
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
            <textarea
              value={item.specialInstruction}
              onChange={(e) => updateInstruction(item.cartKey, e.target.value)}
              placeholder={t("cart.itemNotePlaceholder")}
              className="mt-2 w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/50"
              rows={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutFormData {
  orderType: "delivery" | "pickup";
  deliveryAddress: string;
  orderNotes: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { items, subtotal, totalItems } = useCart();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutFormData>({
    orderType: "delivery",
    deliveryAddress: "",
    orderNotes: "",
    guestName: user?.name ?? "",
    guestPhone: user?.phone ?? "",
    guestEmail: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  // ── Fetch saved addresses ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) return;
    addressApi
      .list(token)
      .then((addresses) => {
        setSavedAddresses(addresses);
        const def = addresses.find((a) => a.is_default) ?? addresses[0];
        if (def) {
          const formatted = [def.street_address, def.city, def.postal_code, def.country]
            .filter(Boolean)
            .join(", ");
          setForm((f) => ({ ...f, deliveryAddress: formatted }));
        }
      })
      .catch(() => {});
  }, [user, token]);

  const deliveryCharge =
    form.orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD
      ? DELIVERY_CHARGE
      : 0;
  const total = subtotal + deliveryCharge;

  const patch = useCallback((field: keyof CheckoutFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!user && !form.guestName.trim()) e.guestName = t("cart.errors.nameRequired");
    if (!user && !form.guestPhone.trim()) e.guestPhone = t("cart.errors.phoneRequired");
    if (form.orderType === "delivery" && !form.deliveryAddress.trim())
      e.deliveryAddress = t("cart.errors.deliveryAddressRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Proceed to checkout — NO API call here ─────────────────────────────────
  const handleProceed = () => {
    if (!validate()) return;
    navigate("/checkout", {
      state: {
        orderType: form.orderType,
        deliveryAddress: form.deliveryAddress,
        orderNotes: form.orderNotes,
        subtotal,
        deliveryCharge,
        discountAmount: 0,
        total,
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        guestEmail: form.guestEmail,
      },
    });
  };

  // ── Empty state ────────────────────────────────────────────────────────────
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

  // ── Main layout ────────────────────────────────────────────────────────────
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
                  <CartItemRow key={item.cartKey} item={item} />
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
                    {type === "delivery" ? <Truck size={16} /> : <Package size={16} />}
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

                {user && savedAddresses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {savedAddresses.map((addr) => {
                      const formatted = [addr.street_address, addr.city, addr.postal_code, addr.country]
                        .filter(Boolean).join(", ");
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => patch("deliveryAddress", formatted)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            form.deliveryAddress === formatted
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-white/10 bg-gray-900 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          {addr.street_address}
                          {addr.is_default && <span className="ml-1 text-amber-500/60">★</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <textarea
                    value={form.deliveryAddress}
                    onChange={(e) => patch("deliveryAddress", e.target.value)}
                    placeholder={t("cart.addressPlaceholder")}
                    rows={2}
                    className={`w-full bg-gray-900 border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none transition-colors ${
                      errors.deliveryAddress
                        ? "border-red-500/60"
                        : "border-white/10 focus:border-amber-500/50"
                    }`}
                  />
                </div>
                {errors.deliveryAddress && (
                  <p className="text-red-400 text-xs mt-1">{errors.deliveryAddress}</p>
                )}
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
                        errors.guestName ? "border-red-500/60" : "border-white/10 focus:border-amber-500/50"
                      }`}
                    />
                    {errors.guestName && (
                      <p className="text-red-400 text-xs mt-1">{errors.guestName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={form.guestPhone}
                      onChange={(e) => patch("guestPhone", e.target.value)}
                      placeholder={t("cart.phonePlaceholder")}
                      className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                        errors.guestPhone ? "border-red-500/60" : "border-white/10 focus:border-amber-500/50"
                      }`}
                    />
                    {errors.guestPhone && (
                      <p className="text-red-400 text-xs mt-1">{errors.guestPhone}</p>
                    )}
                  </div>
                  <input
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) => patch("guestEmail", e.target.value)}
                    placeholder={t("cart.emailPlaceholder")}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <p className="text-xs text-gray-500">{t("cart.guestEmailNote")}</p>
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
                {items.map((item) => {
                  const name = item.menuItem.name || item.menuItem.name_fi;
                  return (
                    <div key={item.cartKey} className="flex justify-between text-gray-400">
                      <span className="truncate max-w-[180px]">
                        {item.quantity}× {name}
                      </span>
                      <span>€{item.totalPrice.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t("cart.subtotal")}</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t("cart.delivery")}</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-green-400">{t("cart.free")}</span>
                    ) : (
                      `€${deliveryCharge.toFixed(2)}`
                    )}
                  </span>
                </div>
                {form.orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD && (
                  <p className="text-xs text-gray-500">
                    {t("cart.freeDeliveryHint", {
                      amount: (FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2),
                    })}
                  </p>
                )}
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