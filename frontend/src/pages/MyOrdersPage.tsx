import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ChevronDown,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  MapPin,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Loader2,
  Phone,
  Search,
} from "lucide-react";
import { ordersApi, type Order, type OrderStatus } from "../api/order";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth";
import { useOrders } from "../context/OrderContext";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    Icon: React.ElementType;
  }
> = {
  pending:    { label: "Pending",    color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", Icon: Clock        },
  confirmed:  { label: "Confirmed",  color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   Icon: CheckCircle2 },
  preparing:  { label: "Preparing",  color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  Icon: ChefHat      },
  on_the_way: { label: "On the way", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", Icon: Truck        },
  delivered:  { label: "Delivered",  color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  Icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    Icon: XCircle      },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Payment CTA ──────────────────────────────────────────────────────────────

function PaymentCta({ order }: { order: Order }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (
    order.payment_method !== "online" ||
    order.payment_status !== "unpaid" ||
    order.status === "cancelled"
  ) {
    return null;
  }

  const handlePay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPaying(true);
    setError(null);
    try {
      const { payment_url } = await ordersApi.initiatePayment(order.order_number);
      window.location.href = payment_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error. Try again.");
      setPaying(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-gray-900 font-bold text-sm rounded-xl transition-all"
      >
        {paying ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Redirecting to Paytrail…
          </>
        ) : (
          <>
            <CreditCard size={14} />
            Complete Payment — €{parseFloat(order.total).toFixed(2)}
            <ArrowRight size={14} />
          </>
        )}
      </button>
      <p className="text-[10px] text-gray-600 text-center">
        Payment is pending — complete it to confirm your order.
      </p>
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order, language }: { order: Order; language: string }) {
  const [open, setOpen] = useState(false);
  const total = parseFloat(order.total);
  const date = new Date(order.created_at);
  const navigate = useNavigate();

  const isPendingPayment =
    order.status === "pending" &&
    order.payment_method === "online" &&
    order.payment_status === "unpaid";

  useEffect(() => {
    if (isPendingPayment) setOpen(true);
  }, [isPendingPayment]);

  return (
    <motion.div
      layout
      className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${
        isPendingPayment ? "border-amber-500/30" : "border-white/5"
      }`}
    >
      {isPendingPayment && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <Clock size={12} className="text-amber-400 shrink-0" />
          <p className="text-amber-400 text-xs font-medium">
            Payment required to confirm this order
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center shrink-0">
            {order.order_type === "delivery" ? (
              <Truck size={15} className="text-amber-400" />
            ) : (
              <Package size={15} className="text-amber-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold font-mono">
              #{order.order_number}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {date.toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" · "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={order.status} />
          <span className="text-amber-400 font-bold text-sm">
            €{total.toFixed(2)}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-500" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
              {order.order_type === "delivery" && order.delivery_address && (
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin size={13} className="text-gray-600 mt-0.5 shrink-0" />
                  <span>{order.delivery_address}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {order.items.map((item) => {
                  const name =
                    language === "fi" && item.menu_item_name_fi
                      ? item.menu_item_name_fi
                      : item.menu_item_name;
                  return (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {item.quantity}
                          </span>
                          <p className="text-white text-sm truncate">{name}</p>
                        </div>
                        {item.selected_options.length > 0 && (
                          <p className="text-gray-600 text-xs mt-0.5 ml-7">
                            {item.selected_options
                              .map((o) =>
                                language === "fi" && o.option_name_fi
                                  ? o.option_name_fi
                                  : o.option_name,
                              )
                              .join(", ")}
                          </p>
                        )}
                        {item.special_instruction && (
                          <p className="text-gray-600 text-xs mt-0.5 ml-7 italic">
                            "{item.special_instruction}"
                          </p>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm shrink-0">
                        €{parseFloat(item.total_price).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/5 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>€{parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                {order.order_type === "delivery" && (
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>
                      {parseFloat(order.delivery_charge) === 0 ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        `€${parseFloat(order.delivery_charge).toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-€{parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-amber-400">€{total.toFixed(2)}</span>
                </div>
              </div>

              {order.order_notes && (
                <p className="text-gray-600 text-xs italic border-t border-white/5 pt-3">
                  Note: {order.order_notes}
                </p>
              )}

              {["confirmed", "preparing", "on_the_way"].includes(order.status) && (
                <button
                  onClick={() =>
                    navigate(`/order/${order.order_number}/track`, {
                      state: { address: order.delivery_address },
                    })
                  }
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Truck size={14} className="text-amber-400" />
                  Track Order
                  <ArrowRight size={13} className="text-gray-400" />
                </button>
              )}

              <PaymentCta order={order} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Guest lookup form ────────────────────────────────────────────────────────

function GuestLookupForm({
  onSearch,
  loading,
}: {
  onSearch: (phone: string) => void;
  loading: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = phone.trim().length >= 6;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSearch(phone.trim());
  };

  return (
    <div className="max-w-sm mx-auto text-center py-10 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
        <Phone size={24} className="text-amber-400" />
      </div>

      <div>
        <h2 className="text-white font-bold text-lg">Find your orders</h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter the phone number you used when ordering
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setTouched(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="+358 40 123 4567"
            className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
              touched && !isValid
                ? "border-red-500/60"
                : "border-white/10 focus:border-amber-500/50"
            }`}
          />
        </div>
        {touched && !isValid && (
          <p className="text-red-400 text-xs text-left">
            Please enter a valid phone number.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-gray-900 font-bold text-sm rounded-xl transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search size={14} />
              Find Orders
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-600">
        Have an account?{" "}
        <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
          Sign in
        </Link>{" "}
        to see all your orders.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { orders, isLoading, error, fetchOrders } = useOrders();

  // Guest state
  const [searched, setSearched] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");

  const isGuest = !user;

  // Fetch on mount for authenticated users only
  useEffect(() => {
    if (!isGuest) {
      fetchOrders();
    }
  }, [isGuest]);

  const handleGuestSearch = (phone: string) => {
    setGuestPhone(phone);
    setSearched(true);
    fetchOrders({ guest_phone: phone });
  };

  const handleRefresh = () => {
    if (isGuest && guestPhone) {
      fetchOrders({ guest_phone: guestPhone });
    } else if (!isGuest) {
      fetchOrders();
    }
  };

  const pendingPaymentCount = orders.filter(
    (o) =>
      o.status === "pending" &&
      o.payment_method === "online" &&
      o.payment_status === "unpaid",
  ).length;

  // Guests who haven't searched yet — show lookup form
  if (isGuest && !searched) {
    return (
      <main className="bg-gray-950 min-h-screen pt-16 text-white">
        <div className="bg-gray-900 border-b border-white/5 pt-8 pb-5">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-bold">My Orders</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <GuestLookupForm onSearch={handleGuestSearch} loading={isLoading} />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-950 min-h-screen pt-16 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-5">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {!isLoading && !error && (
                <>
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                  {isGuest && guestPhone && (
                    <span className="ml-2 text-gray-600">· {guestPhone}</span>
                  )}
                  {pendingPaymentCount > 0 && (
                    <span className="ml-2 text-amber-400 font-medium">
                      · {pendingPaymentCount} awaiting payment
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Guests can search a different number */}
            {isGuest && (
              <button
                onClick={() => {
                  setSearched(false);
                  setGuestPhone("");
                }}
                className="text-xs text-gray-500 hover:text-amber-400 transition-colors border border-white/10 hover:border-amber-500/30 px-3 py-1.5 rounded-lg"
              >
                Change number
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-40"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900 border border-white/5 rounded-xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-800 rounded w-1/4" />
                  </div>
                  <div className="h-6 w-20 bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-16 space-y-3">
            <XCircle size={36} className="text-red-400 mx-auto" />
            <p className="text-white font-semibold">Failed to load orders</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty — guest with no results */}
        {!isLoading && !error && orders.length === 0 && isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/5 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} className="text-gray-600" />
            </div>
            <p className="text-white font-semibold">No orders found</p>
            <p className="text-gray-500 text-sm">
              No orders found for{" "}
              <span className="text-gray-300">{guestPhone}</span>.
            </p>
            <button
              onClick={() => {
                setSearched(false);
                setGuestPhone("");
              }}
              className="mt-2 px-5 py-2 border border-white/10 hover:border-white/20 text-gray-300 text-sm rounded-xl transition-colors"
            >
              Try a different number
            </button>
          </motion.div>
        )}

        {/* Empty — logged in user */}
        {!isLoading && !error && orders.length === 0 && !isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/5 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} className="text-gray-600" />
            </div>
            <p className="text-white font-semibold">No orders yet</p>
            <p className="text-gray-500 text-sm">Your order history will appear here.</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
            >
              Browse Menu
            </Link>
          </motion.div>
        )}

        {/* Orders list */}
        {!isLoading && !error && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <OrderCard order={order} language={language} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}