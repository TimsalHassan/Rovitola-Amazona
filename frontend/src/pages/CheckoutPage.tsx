import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Truck,
  ShoppingBag,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth";
import { ordersApi, type CreateOrderPayload } from "../api/order";
import { addressApi, type Address } from "../api/auth";
import { cartItemToOrderPayload } from "../utils/cartItemToOrderPayload";

// ─── State passed from CartPage via navigate() ────────────────────────────────

interface CartState {
  orderType: "delivery" | "pickup";
  address: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  orderNotes?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as CartState) ?? {
    orderType: "delivery",
    address: "",
    subtotal: 0,
    deliveryCharge: 0,
    discountAmount: 0,
    total: 0,
    orderNotes: "",
  };

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: state.orderType === "delivery" ? (state.address || "") : "",
    notes: state.orderNotes || "",
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Only logged-in users reach this page
  if (!user) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  if (items.length === 0) return <Navigate to="/menu" replace />;

  // ── Fetch saved addresses ────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!token) return;
    addressApi
      .list(token)
      .then((addresses) => {
        setSavedAddresses(addresses);
        // Pre-fill if address is empty
        if (!form.address && state.orderType === "delivery") {
          const defaultAddr =
            addresses.find((a) => a.is_default) ?? addresses[0];
          if (defaultAddr) {
            const formatted = [
              defaultAddr.street_address,
              defaultAddr.city,
              defaultAddr.postal_code,
              defaultAddr.country,
            ]
              .filter(Boolean)
              .join(", ");
            setForm((f) => ({ ...f, address: formatted }));
          }
        }
      })
      .catch(() => {});
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      const payload: CreateOrderPayload = {
        order_type: state.orderType,
        delivery_address:
          state.orderType === "delivery" ? form.address : "",
        order_notes: form.notes,
        subtotal: state.subtotal,
        delivery_charge: state.deliveryCharge,
        discount_amount: state.discountAmount,
        total: state.total,
        items: items.map(cartItemToOrderPayload),
        // Logged-in user — backend reads request.user; no guest fields needed
      };

      const order = await ordersApi.create(payload);
      clearCart();
      navigate(`/order/${order.order_number}`, { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("cart.placeOrderFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="bg-gray-950 min-h-screen pt-16 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={14} />
            {t("checkout.back")}
          </Link>
          <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Left column ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Customer details — read-only from profile */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
                <h2 className="font-bold">{t("checkout.customerDetails")}</h2>
                <div className="space-y-3">
                  {/* Name */}
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                    <UserIcon size={15} className="text-gray-500 shrink-0" />
                    {user.name ? (
                      <span className="text-white text-sm">{user.name}</span>
                    ) : (
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder={t("checkout.name")}
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                      />
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                    <Phone size={15} className="text-gray-500 shrink-0" />
                    {user.phone ? (
                      <span className="text-white text-sm">{user.phone}</span>
                    ) : (
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder={t("checkout.phone")}
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery / Pickup */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
                <h2 className="font-bold flex items-center gap-2">
                  {state.orderType === "delivery" ? (
                    <Truck size={18} className="text-amber-400" />
                  ) : (
                    <ShoppingBag size={18} className="text-amber-400" />
                  )}
                  {state.orderType === "delivery"
                    ? t("checkout.delivery")
                    : t("checkout.pickup")}
                </h2>

                {state.orderType === "delivery" ? (
                  <div className="space-y-2">
                    {/* Saved address chips */}
                    {savedAddresses.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {savedAddresses.map((addr) => {
                          const formatted = [
                            addr.street_address,
                            addr.city,
                            addr.postal_code,
                            addr.country,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({ ...f, address: formatted }))
                              }
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                form.address === formatted
                                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                  : "border-white/10 bg-gray-800 text-gray-400 hover:border-white/20"
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

                    <div className="relative">
                      <MapPin
                        size={15}
                        className="absolute left-3 top-3 text-gray-500"
                      />
                      <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, address: e.target.value }))
                        }
                        placeholder={t("checkout.address")}
                        className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">
                      Ravintola Amazona
                    </p>
                    <p className="text-gray-400 text-xs">
                      Aleksanterinkatu 3, 15110 Lahti
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    {t("checkout.orderNotes")}{" "}
                    <span className="text-gray-600">
                      ({t("checkout.optional")})
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <CreditCard size={20} className="text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">Paytrail</p>
                  <p className="text-gray-400 text-xs">
                    {t("checkout.paymentViaPaytrail")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right column: summary ────────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <h2 className="font-bold text-base mb-4">
                  {t("checkout.summary")}
                </h2>

                <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1">
                  {items.map((ci) => {
                    const name =
                      (language === "fi"
                        ? ci.menuItem.name_fi
                        : ci.menuItem.name) || ci.menuItem.name;
                    return (
                      <div key={ci.cartKey} className="flex gap-2 items-start">
                        {ci.menuItem.image ? (
                          <img
                            src={ci.menuItem.image}
                            alt={name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-800 shrink-0 flex items-center justify-center text-base">
                            🍽️
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs truncate">{name}</p>
                          <p className="text-gray-500 text-[10px]">
                            ×{ci.quantity}
                          </p>
                        </div>
                        <p className="text-gray-300 text-xs shrink-0">
                          €{ci.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
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
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                    <span>{t("checkout.total")}</span>
                    <span className="text-amber-400">
                      €{state.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p className="mt-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    loading
                      ? "bg-amber-500/50 text-gray-700 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-400 text-gray-900"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full" />
                      {t("checkout.processing")}
                    </>
                  ) : (
                    <>
                      {t("checkout.placeOrder")}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </main>
  );
}