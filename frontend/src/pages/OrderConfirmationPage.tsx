import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  ArrowRight,
  Truck,
  ShoppingBag,
  MapPin,
  Clock,
  Receipt,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ordersApi, type Order } from "../api/order";
import { useLanguage } from "../hooks/useLanguage";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { language } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    ordersApi
      .getByNumber(orderId)
      .then(setOrder)
      .catch((err) => setFetchError(err.message ?? "Failed to load order."))
      .finally(() => setFetching(false));
  }, [orderId]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setPayError(null);
    try {
      const { payment_url } = await ordersApi.initiatePayment(order.order_number);
      window.location.href = payment_url;
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Payment gateway error. Please try again."
      );
      setPaying(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (fetching) {
    return (
      <main className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="text-sm">Loading your order…</p>
        </div>
      </main>
    );
  }

  if (fetchError || !order) {
    return (
      <main className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <p className="text-white font-bold text-lg">Order not found</p>
          <p className="text-gray-400 text-sm">{fetchError}</p>
          <Link
            to="/menu"
            className="inline-block mt-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-colors"
          >
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = parseFloat(order.subtotal);
  const delivery = parseFloat(order.delivery_charge);
  const discount = parseFloat(order.discount_amount);
  const total = parseFloat(order.total);
  const isDelivery = order.order_type === "delivery";

  return (
    <main className="bg-gray-950 min-h-screen pt-16 text-white">
      {/* Hero banner */}
      <div className="bg-gray-900 border-b border-white/5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
          <p className="text-gray-400 text-sm">
            Order{" "}
            <span className="text-amber-400 font-mono font-semibold">
              #{order.order_number}
            </span>{" "}
            has been received. Complete payment below to confirm it.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Order meta */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={16} className="text-amber-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-300">
              Order Details
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Order number</p>
              <p className="text-white font-mono font-semibold">{order.order_number}</p>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Placed at</p>
              <p className="text-white font-semibold">
                {new Date(order.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 flex items-start gap-2">
              {isDelivery ? (
                <Truck size={14} className="text-amber-400 mt-0.5 shrink-0" />
              ) : (
                <ShoppingBag size={14} className="text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Order type</p>
                <p className="text-white font-semibold capitalize">{order.order_type}</p>
              </div>
            </div>
            {isDelivery && order.delivery_address && (
              <div className="bg-gray-800/60 rounded-lg p-3 flex items-start gap-2">
                <MapPin size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs mb-0.5">Deliver to</p>
                  <p className="text-white font-semibold text-xs leading-snug truncate">
                    {order.delivery_address}
                  </p>
                </div>
              </div>
            )}
          </div>
          {order.order_notes && (
            <div className="mt-3 bg-gray-800/60 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Notes</p>
              <p className="text-white text-sm">{order.order_notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-300">
              Items
            </h2>
          </div>
          <div className="space-y-3">
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
                      <p className="text-white text-sm font-medium truncate">{name}</p>
                    </div>
                    {item.selected_options.length > 0 && (
                      <p className="text-gray-500 text-xs mt-1 ml-7">
                        {item.selected_options.map((o) =>
                          language === "fi" && o.option_name_fi
                            ? o.option_name_fi
                            : o.option_name
                        ).join(", ")}
                      </p>
                    )}
                    {item.special_instruction && (
                      <p className="text-gray-600 text-xs mt-0.5 ml-7 italic">
                        "{item.special_instruction}"
                      </p>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm font-semibold shrink-0">
                    €{parseFloat(item.total_price).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-white/10 mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span>
                  {delivery === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    `€${delivery.toFixed(2)}`
                  )}
                </span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-€{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-amber-400">€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment CTA */}
        <div className="bg-gray-900 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-amber-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-300">
              Payment
            </h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Your order is reserved. Complete payment via Paytrail to confirm it.
          </p>

          {payError && (
            <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-red-400 text-sm">{payError}</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all"
          >
            {paying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Redirecting to Paytrail…
              </>
            ) : (
              <>
                Pay €{total.toFixed(2)} now
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-gray-600 text-xs mt-3">
            You'll be redirected to Paytrail's secure payment page
          </p>
        </div>

      </div>
    </main>
  );
}