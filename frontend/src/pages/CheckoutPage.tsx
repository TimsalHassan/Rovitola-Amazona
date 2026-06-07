import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Truck,
  ShoppingBag,
  Phone,
  User as UserIcon,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth";
import {
  ordersApi,
  type CreateOrderPayload,
  type CreateOrderItem,
  type CreateSelectedOption,
} from "../api/order";

// ─── State from CartPage ──────────────────────────────────────────────────────

interface CartLocationState {
  orderType: "delivery" | "pickup";
  deliveryAddress: string;
  orderNotes: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CartLocationState | null;

  const [paymentMethod, setPaymentMethod] = useState<
    "online" | "cash_on_delivery" | "card_on_delivery"
  >("online");
  const [notes, setNotes] = useState(state?.orderNotes || "");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Payment method options (labels from i18n) ─────────────────────────────

  const PAYMENT_METHODS = [
    {
      id: "online" as const,
      label: t("checkout.payOnline"),
      desc: t("checkout.payOnlineDesc"),
    },
    {
      id: "cash_on_delivery" as const,
      label: t("checkout.cashOnDelivery"),
      desc: t("checkout.cashOnDeliveryDesc"),
    }
  ];

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (!state || state.total == null) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <AlertCircle size={36} className="text-amber-400 mx-auto" />
          <p className="text-white font-bold">{t("checkout.nothingToCheckout")}</p>
          <p className="text-gray-400 text-sm">{t("checkout.addItemsFirst")}</p>
          <Link
            to="/menu"
            className="inline-block mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
          >
            {t("cart.browseMenu")}
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    navigate("/menu", { replace: true });
    return null;
  }

  const customerName = user?.name || state.guestName || "";
  const customerPhone = user?.phone || state.guestPhone || "";

  // ── Build order items ─────────────────────────────────────────────────────

  function buildOrderItems(): CreateOrderItem[] {
    return items.map((ci) => {
      const selectedOptions: CreateSelectedOption[] = ci.selected_options.map(
        (opt) => ({
          extra_name: opt.extra_name,
          extra_name_fi: opt.extra_name_fi,
          option_name: opt.option_name,
          option_name_fi: opt.option_name_fi,
          additional_price: parseFloat(opt.additional_price),
        }),
      );
      return {
        menu_item_name: ci.menu_item_name,
        menu_item_name_fi: ci.menu_item_name_fi || "",
        quantity: ci.quantity,
        base_price: parseFloat(ci.unit_price),
        total_price: parseFloat(ci.line_total),
        special_instruction: ci.special_instruction || "",
        selected_options: selectedOptions,
      };
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      // Round to 2 decimal places — floating-point arithmetic produces values like
      // 3.9 + 12.45 = 16.349999999999998 which Django's DecimalField rejects.
      const round2 = (n: number) => Math.round(n * 100) / 100;

      // Strip the "-" city/postal placeholders injected when saving a freeform
      // address from CartPage (e.g. "Street, -, -, Finland" → "Street, Finland")
      const cleanAddress = (state.deliveryAddress || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "-" && s !== "")
        .join(", ");

      const payload: CreateOrderPayload = {
        order_type: state.orderType,
        payment_method: paymentMethod,
        delivery_address: state.orderType === "delivery" ? cleanAddress : "",
        order_notes: notes,
        subtotal: round2(state.subtotal),
        delivery_charge: round2(state.deliveryCharge),
        discount_amount: round2(state.discountAmount),
        total: round2(state.total),
        items: buildOrderItems(),
        ...(state.guestName && { guest_name: state.guestName }),
        ...(state.guestPhone && { guest_phone: state.guestPhone }),
        ...(state.guestEmail && { guest_email: state.guestEmail }),
      };

      const order = await ordersApi.create(payload);
      clearCart();

      if (paymentMethod === "online") {
        const { payment_url } = await ordersApi.initiatePayment(
          order.order_number,
        );
        window.location.href = payment_url;
        // No setLoading(false) — browser is leaving the page
      } else {
        navigate(`/order/${order.order_number}`, { replace: true });
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("cart.placeOrderFailed"),
      );
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="bg-gray-950 min-h-screen pt-16 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-5">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            {t("checkout.back")}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {t("checkout.reviewAndPay")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              <Lock size={13} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium">
                {t("checkout.secureCheckout")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Left ────────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Order details — read-only */}
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400">
                  {t("checkout.customerDetails")}
                </h2>

                {customerName && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                      <UserIcon size={15} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t("checkout.name")}</p>
                      <p className="text-white text-sm font-medium">{customerName}</p>
                    </div>
                  </div>
                )}

                {customerPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={15} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t("checkout.phone")}</p>
                      <p className="text-white text-sm">{customerPhone}</p>
                    </div>
                  </div>
                )}

                {/* Delivery address — read-only */}
                {state.orderType === "delivery" ? (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Truck size={15} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        {t("checkout.deliveringTo")}
                      </p>
                      <p className="text-white text-sm leading-snug">
                        {state.deliveryAddress || "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag size={15} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        {t("checkout.pickup")}
                      </p>
                      <p className="text-white text-sm font-medium">
                        Ravintola Amazona
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Aleksanterinkatu 3, 15110 Lahti
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes — editable */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    {t("checkout.orderNotes")}{" "}
                    <span className="text-gray-600">
                      ({t("checkout.optional")})
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("cart.notesPlaceholder")}
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-3">
                <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400">
                  {t("checkout.paymentMethod")}
                </h2>

                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      paymentMethod === method.id
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-white/[0.08] bg-gray-800 hover:border-white/[0.15]"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        paymentMethod === method.id
                          ? "border-amber-500 bg-amber-500"
                          : "border-gray-600"
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">
                        {method.label}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{method.desc}</p>
                    </div>
                    {method.id === "online" && (
                      <CreditCard
                        size={16}
                        className={
                          paymentMethod === "online"
                            ? "text-amber-400 shrink-0"
                            : "text-gray-600 shrink-0"
                        }
                      />
                    )}
                  </button>
                ))}

                {paymentMethod === "online" && (
                  <p className="text-xs text-gray-600 pt-1 leading-relaxed">
                    {t("checkout.paytrailRedirectNote")}
                  </p>
                )}
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}
            </div>

            {/* ── Right: summary ───────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">
                  {t("checkout.summary")}
                </h2>

                {/* Items */}
                <div className="max-h-52 overflow-y-auto space-y-3 mb-4 pr-1">
                  {items.map((ci) => {
                    const name =
                      (language === "fi"
                        ? ci.menu_item_name_fi
                        : ci.menu_item_name) || ci.menu_item_name;
                    return (
                      <div key={ci.id} className="flex items-start gap-2.5">
                        {ci.menu_item_image ? (
                          <img
                            src={ci.menu_item_image}
                            alt={name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-800 shrink-0 flex items-center justify-center text-sm">
                            🍽️
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {name}
                          </p>
                          <p className="text-gray-500 text-[10px]">
                            ×{ci.quantity}
                          </p>
                        </div>
                        <p className="text-gray-300 text-xs shrink-0 font-medium">
                          €{parseFloat(ci.line_total).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-white/5 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>{t("checkout.subtotal")}</span>
                    <span>€{state.subtotal.toFixed(2)}</span>
                  </div>
                  {state.orderType === "delivery" && (
                    <div className="flex justify-between text-gray-400">
                      <span>{t("checkout.delivery")}</span>
                      <span>
                        {state.deliveryCharge === 0 ? (
                          <span className="text-green-400">
                            {t("cart.free")}
                          </span>
                        ) : (
                          `€${state.deliveryCharge.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  )}
                  {state.discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>{t("checkout.discount")}</span>
                      <span>-€{state.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/5">
                    <span className="text-white">{t("checkout.total")}</span>
                    <span className="text-amber-400">
                      €{state.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    loading
                      ? "bg-amber-500/50 text-gray-700 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-gray-900"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      {paymentMethod === "online"
                        ? t("checkout.redirectingToPayment")
                        : t("checkout.processing")}
                    </>
                  ) : paymentMethod === "online" ? (
                    <>
                      {t("checkout.payViaPaytrail", {
                        amount: state.total.toFixed(2),
                      })}
                      <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      {t("checkout.placeOrder")}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-600 text-center mt-3 leading-relaxed">
                  {paymentMethod === "online"
                    ? t("checkout.paytrailFootnote")
                    : t("checkout.offlinePaymentNote")}
                </p>
              </div>
            </div>

          </div>
        </div>
      </form>
    </main>
  );
}