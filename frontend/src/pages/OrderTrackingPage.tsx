import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  MapPin,
  Truck,
  ShoppingBag,
  Home,
  XCircle,
  ChefHat,
  Package,
  CreditCard,
} from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { OrderStatus } from "../api/order";
import { useOrders } from "../context/OrderContext";

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

const STATUS_CONFIG = {
  pending: {
    labelKey: "orderStatus.pending",
    icon: CheckCircle,
    color: "text-amber-400",
    bg: "bg-amber-400",
  },
  confirmed: {
    labelKey: "orderStatus.confirmed",
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-400",
  },
  preparing: {
    labelKey: "orderStatus.preparing",
    icon: ChefHat,
    color: "text-amber-400",
    bg: "bg-amber-400",
  },
  on_the_way: {
    labelKey: "orderStatus.onTheWay",
    icon: Truck,
    color: "text-green-400",
    bg: "bg-green-400",
  },
  delivered: {
    labelKey: "orderStatus.delivered",
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400",
  },
  cancelled: {
    labelKey: "orderStatus.cancelled",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400",
  },
};

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t, language } = useLanguage();

  const {
    currentOrder,
    fetchOrder,
    refreshOrder,
    clearCurrentOrder,
    cancelOrder,
    isCancelling,
    isLoading,
  } = useOrders();

  useEffect(() => {
    if (!orderId) return;

    fetchOrder(orderId);

    const interval = setInterval(() => {
      refreshOrder(orderId);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearCurrentOrder();
    };
  }, [orderId, fetchOrder, refreshOrder, clearCurrentOrder]);

  if (isLoading && !currentOrder) {
    return (
      <main className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading order...</div>
      </main>
    );
  }

  if (!currentOrder) {
    return (
      <main className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-white">Order not found</div>
      </main>
    );
  }

  const currentStatus = currentOrder.status;
  const cancelled = currentStatus === "cancelled";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const canCancel =
    currentStatus === "pending" || currentStatus === "confirmed";

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mb-4">
            <span className="text-gray-400 text-sm">
              {t("orderTracking.orderNumber")}
            </span>
            <span className="text-amber-400 font-bold">{orderId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {cancelled
              ? t("orderTracking.orderCancelled")
              : t("orderTracking.trackOrder")}
          </h1>
        </div>
        {canCancel ? (
          <button
            onClick={() => cancelOrder(currentOrder.order_number)}
            disabled={isCancelling}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle size={17} />
            {isCancelling
              ? t("orderTracking.cancelling")
              : t("orderTracking.cancelOrder")}
          </button>
        ) : (
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-5">
            <h2 className="text-white font-semibold mb-6">
              {t("orderTracking.orderStatusTitle")}
            </h2>

            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-800" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-amber-400 transition-all duration-700"
                style={{
                  height: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%`,
                }}
              />

              <div className="space-y-6">
                {STATUS_ORDER.map((status: OrderStatus, idx) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div
                      key={status}
                      className="flex items-start gap-4 relative"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500/20 border border-green-500/40"
                            : isCurrent
                              ? "bg-amber-500/20 border border-amber-500/40"
                              : "bg-gray-800 border border-white/10"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : isCurrent ? (
                          <Icon size={20} className="text-amber-400" />
                        ) : (
                          <Circle size={20} className="text-gray-600" />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`font-semibold text-sm ${
                            isCompleted
                              ? "text-green-400"
                              : isCurrent
                                ? "text-amber-400"
                                : "text-gray-600"
                          }`}
                        >
                          {t(config.labelKey)}
                        </p>
                        {isCurrent && (
                          <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            {t("orderTracking.currentStatus")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-5">
          <h2 className="text-white font-semibold mb-4">
            {t("orderTracking.deliveryInfo")}
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-400">
              {currentOrder.order_type === "pickup" ? (
                <ShoppingBag size={15} className="text-amber-400" />
              ) : (
                <Truck size={15} className="text-amber-400" />
              )}
              <span>
                {currentOrder.order_type === "pickup"
                  ? t("orderTracking.pickupFromRestaurant")
                  : t("orderTracking.delivery")}
              </span>
            </div>
            {currentOrder.order_type === "delivery" &&
              currentOrder.delivery_address && (
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin
                    size={15}
                    className="text-amber-400 mt-0.5 shrink-0"
                  />
                  <span>{currentOrder.delivery_address}</span>
                </div>
              )}
            <div className="flex items-center gap-3 text-gray-400">
              <CreditCard size={15} className="text-amber-400" />
              <span>
                {t(
                  `orderTracking.paymentMethod.${currentOrder.payment_method}`,
                )}
              </span>
            </div>
          </div>
        </div>
        {currentOrder.items.length > 0 && (
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-5">
            <h2 className="text-white font-semibold mb-4">
              {t("orderTracking.orderedItems")}
            </h2>
            <div className="space-y-3">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {language === "fi"
                        ? item.menu_item_name_fi
                        : item.menu_item_name}
                    </p>
                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">
                    €{parseFloat(item.total_price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-3 flex justify-between text-white font-bold">
              <span>{t("orderTracking.total")}</span>
              <span>€{parseFloat(currentOrder.total).toFixed(2)}</span>
            </div>
          </div>
        )}
        {!cancelled && (
          <div className="mb-5">
            {canCancel ? (
              <button
                onClick={() => {
                  /* wire up your cancel handler here */
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3.5 rounded-xl transition-colors"
              >
                <XCircle size={17} />
                {t("orderTracking.cancelOrder")}
              </button>
            ) : (
              <div className="flex items-start gap-3 bg-gray-900 border border-white/5 rounded-xl px-4 py-3.5">
                <XCircle size={16} className="text-gray-600 mt-0.5 shrink-0" />
                <p className="text-gray-500 text-sm">
                  {t("orderTracking.cancelNotAllowed")}
                </p>
              </div>
            )}
          </div>
        )}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          <Home size={17} />
          {t("orderTracking.backHome")}
        </Link>
      </div>
    </main>
  );
}
