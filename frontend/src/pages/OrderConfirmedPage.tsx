import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Home, User, ArrowRight, RefreshCw, ShoppingBag } from "lucide-react";
import { ordersApi, type Order } from "../api/order";

export default function OrderConfirmedPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const payment = searchParams.get("payment"); // "success" | "cancel"
  const isSuccess = payment === "success";

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    ordersApi.getByNumber(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  return (
    <main className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 transition-colors duration-1000 ${
            isSuccess ? "bg-green-400" : "bg-red-500"
          }`}
        />
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Icon */}
              <div className="relative flex items-center justify-center mb-8">
                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-green-400/30"
                    initial={{ width: 80, height: 80, opacity: 0.6 }}
                    animate={{ width: 80 + (i + 1) * 40, height: 80 + (i + 1) * 40, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Circle */}
                <motion.div
                  className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Animated SVG checkmark */}
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-400"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.path
                      d="M21.801 10A10 10 0 1 1 17 3.335"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    />
                    <motion.path
                      d="m9 11 3 3L22 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
                    />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  Payment Successful
                </h1>
                <p className="text-gray-400 text-sm mb-1">
                  Your order has been confirmed and is being prepared.
                </p>
                {orderId && (
                  <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 mt-2">
                    <span className="text-green-400 text-xs uppercase tracking-widest font-semibold">Order</span>
                    <span className="text-white font-mono font-bold">{orderId}</span>
                  </div>
                )}
              </motion.div>

              {/* Order summary pill */}
              {order && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.4 }}
                  className="mt-6 bg-gray-900 border border-white/5 rounded-xl p-4 text-left"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Summary</p>
                    <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                      Paid
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-300">
                        <span className="truncate mr-4">
                          <span className="text-gray-500 mr-1.5">×{item.quantity}</span>
                          {item.menu_item_name}
                        </span>
                        <span className="shrink-0">€{parseFloat(item.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold text-white">
                      <span>Total</span>
                      <span className="text-amber-400">€{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="mt-5 flex flex-col sm:flex-row gap-3"
              >
                <Link
                  to="/my-orders"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <User size={16} />
                  My Orders
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <Home size={16} />
                  Back Home
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="cancel"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <motion.line
                    x1="18" y1="6" x2="6" y2="18"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  />
                  <motion.line
                    x1="6" y1="6" x2="18" y2="18"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  />
                </motion.svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  Payment Cancelled
                </h1>
                <p className="text-gray-400 text-sm mb-1">
                  Your payment was not completed. Your order has not been confirmed.
                </p>
                {orderId && (
                  <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mt-2">
                    <span className="text-red-400 text-xs uppercase tracking-widest font-semibold">Order</span>
                    <span className="text-white font-mono font-bold">{orderId}</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.4 }}
                className="mt-5 flex flex-col sm:flex-row gap-3"
              >
                <Link
                  to={`/confirm/order/${orderId}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Link>
                <Link
                  to="/menu"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <ShoppingBag size={16} />
                  Back to Menu
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}