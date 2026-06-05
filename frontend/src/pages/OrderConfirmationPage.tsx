import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  Truck,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { ordersApi, type Order, type OrderStatus } from "../api/order";
import { useLanguage } from "../hooks/useLanguage";

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  step: number; // 0-based index in the progress track
  description: string;
}

const STATUS_CONFIGS: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    icon: <Clock size={18} />,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    step: 0,
    description: "We've received your order and it's waiting to be confirmed.",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 size={18} />,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    step: 1,
    description: "Your order has been confirmed and will be prepared shortly.",
  },
  preparing: {
    label: "Preparing",
    icon: <ChefHat size={18} />,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    step: 2,
    description: "Our kitchen is preparing your delicious meal right now.",
  },
  on_the_way: {
    label: "On the Way",
    icon: <Truck size={18} />,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    step: 3,
    description: "Your order is on its way to you!",
  },
  delivered: {
    label: "Delivered",
    icon: <CheckCircle2 size={18} />,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    step: 4,
    description: "Your order has been delivered. Enjoy your meal!",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={18} />,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    step: -1,
    description: "This order has been cancelled.",
  },
};

const DELIVERY_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
];

const PICKUP_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
];

// ─── Progress tracker ─────────────────────────────────────────────────────────

function ProgressTracker({
  status,
  orderType,
}: {
  status: OrderStatus;
  orderType: "delivery" | "pickup";
}) {
  const steps = orderType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentStep = STATUS_CONFIGS[status].step;
  const isCancelled = status === "cancelled";

  const stepLabels: Record<OrderStatus, string> = {
    pending: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    on_the_way: "On the Way",
    delivered: orderType === "pickup" ? "Ready" : "Delivered",
    cancelled: "Cancelled",
  };

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <XCircle size={20} className="text-red-400" />
        <span className="text-red-400 font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Track line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5 mx-8" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-amber-500 mx-8 transition-all duration-700"
        style={{
          width:
            currentStep === 0
              ? "0%"
              : `${(currentStep / (steps.length - 1)) * 100}%`,
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const cfg = STATUS_CONFIGS[step];
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-amber-500 border-amber-500 text-gray-900"
                    : isCurrent
                      ? `${cfg.bg} ${cfg.border} ${cfg.color} border-2`
                      : "bg-gray-900 border-white/10 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span className="scale-90">{cfg.icon}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight max-w-[56px] ${
                  isCurrent
                    ? cfg.color
                    : isCompleted
                      ? "text-amber-400/70"
                      : "text-gray-600"
                }`}
              >
                {stepLabels[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded-lg animate-pulse ${className ?? ""}`}
    />
  );
}

function OrderSkeleton() {
  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { language } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (silent = false) => {
    if (!orderId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await ordersApi.getByNumber(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Auto-refresh every 30s while order is active
  useEffect(() => {
    if (!order) return;
    const activeStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "preparing",
      "on_the_way",
    ];
    if (!activeStatuses.includes(order.status)) return;

    const interval = setInterval(() => fetchOrder(true), 30_000);
    return () => clearInterval(interval);
  }, [order?.status]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return <OrderSkeleton />;

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold">Order Not Found</h1>
          <p className="text-gray-400 text-sm">
            {error ?? "We couldn't find this order. It may have been removed."}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-3 rounded-xl transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  // ── Data helpers ───────────────────────────────────────────────────────────

  const cfg = STATUS_CONFIGS[order.status];
  const isDelivery = order.order_type === "delivery";
  const customerName = order.customer_name || order.guest_name || "Customer";
  const createdAt = new Date(order.created_at);

  const formattedDate = createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="w-9 h-9 bg-gray-900 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-500 text-xs">
                {formattedDate} · {formattedTime}
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="w-9 h-9 bg-gray-900 border border-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* ── Status card ─────────────────────────────────────────────── */}
        <div
          className={`rounded-2xl border p-5 space-y-5 ${cfg.bg} ${cfg.border}`}
        >
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${cfg.color}`}>
              {cfg.icon}
              <span className="font-bold text-base">{cfg.label}</span>
            </div>
            {/* Pulsing dot for active statuses */}
            {["pending", "confirmed", "preparing", "on_the_way"].includes(
              order.status,
            ) && (
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    order.status === "pending"
                      ? "bg-yellow-400"
                      : order.status === "on_the_way"
                        ? "bg-purple-400"
                        : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    order.status === "pending"
                      ? "bg-yellow-400"
                      : order.status === "on_the_way"
                        ? "bg-purple-400"
                        : "bg-amber-400"
                  }`}
                />
              </span>
            )}
          </div>

          <p className={`text-sm ${cfg.color} opacity-80`}>
            {cfg.description}
          </p>

          {/* Progress tracker */}
          {order.status !== "cancelled" && (
            <ProgressTracker
              status={order.status}
              orderType={order.order_type}
            />
          )}
        </div>

        {/* ── Delivery / Pickup info ───────────────────────────────────── */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-widest">
            {isDelivery ? "Delivery Details" : "Pickup Details"}
          </h2>

          <div className="space-y-3">
            {/* Customer */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <UtensilsCrossed size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Customer</p>
                <p className="text-white text-sm font-medium">
                  {customerName}
                </p>
              </div>
            </div>

            {/* Phone */}
            {order.guest_phone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-white text-sm">{order.guest_phone}</p>
                </div>
              </div>
            )}

            {/* Address or pickup location */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                {isDelivery ? (
                  <MapPin size={14} className="text-gray-400" />
                ) : (
                  <Package size={14} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  {isDelivery ? "Delivery Address" : "Pickup Location"}
                </p>
                <p className="text-white text-sm">
                  {isDelivery
                    ? order.delivery_address || "—"
                    : "Aleksanterinkatu 3, 15110 Lahti"}
                </p>
              </div>
            </div>

            {/* Order notes */}
            {order.order_notes && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <Receipt size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                  <p className="text-white text-sm">{order.order_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Items ───────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-widest">
            Your Order
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => {
              const name =
                language === "fi" && item.menu_item_name_fi
                  ? item.menu_item_name_fi
                  : item.menu_item_name;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  {/* Quantity badge */}
                  <div className="w-7 h-7 bg-amber-500/15 border border-amber-500/25 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs font-bold">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-snug">
                      {name}
                    </p>

                    {/* Options */}
                    {item.selected_options.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selected_options.map((opt, i) => {
                          const optName =
                            language === "fi" && opt.option_name_fi
                              ? opt.option_name_fi
                              : opt.option_name;
                          const extraName =
                            language === "fi" && opt.extra_name_fi
                              ? opt.extra_name_fi
                              : opt.extra_name;
                          return (
                            <p key={i} className="text-xs text-gray-500">
                              <span className="text-gray-600">{extraName}:</span>{" "}
                              {optName}
                              {parseFloat(opt.additional_price) > 0 && (
                                <span className="text-gray-600">
                                  {" "}
                                  (+€
                                  {parseFloat(opt.additional_price).toFixed(2)})
                                </span>
                              )}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {/* Special instruction */}
                    {item.special_instruction && (
                      <p className="mt-1 text-xs text-amber-400/70 italic">
                        "{item.special_instruction}"
                      </p>
                    )}
                  </div>

                  <span className="text-white text-sm font-semibold shrink-0">
                    €{parseFloat(item.total_price).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-white/5 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>€{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>

            {isDelivery && (
              <div className="flex justify-between text-sm text-gray-400">
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
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount</span>
                <span>-€{parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base pt-2 border-t border-white/5">
              <span className="text-white">Total</span>
              <span className="text-amber-400">
                €{parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <Link
          to="/menu"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 border border-white/5 hover:border-white/10 text-gray-300 hover:text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
        >
          <ArrowLeft size={15} />
          Back to Menu
        </Link>
      </div>
    </main>
  );
}