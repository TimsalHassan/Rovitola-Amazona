// src/pages/admin/AdminOrdersPage.tsx
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { ADMIN, adminGet, adminPatch } from "../../api/admin";
import { useAdminStats } from "../../context/admin/AdminStatsContext";

type OrderStatus = "all"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "on_the_way"
  | "delivered"
  | "completed"
  | "cancelled";

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  total_price: string;
  special_instruction: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  total: string;
  subtotal: string;
  delivery_charge: string;
  status: string;
  payment_status: string;
  payment_method: string;
  order_type: string;
  delivery_address: string;
  order_notes: string;
  created_at: string;
  scheduled_pickup_time: string | null;
  items: OrderItem[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

const STATUSES: OrderStatus[] = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "on_the_way",
  "delivered",
  "completed",
  "cancelled",
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ready_for_pickup:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  on_the_way: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid: "text-red-400",
  paid: "text-green-400",
  refunded: "text-blue-400",
};
function getNextStatus(order: Order): string | null {
  if (order.order_type === "pickup") {
    switch (order.status) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "preparing";
      case "preparing":
        return "ready_for_pickup";
      case "ready_for_pickup":
        return "completed";
      default:
        return null;
    }
  }

  // Delivery flow
  switch (order.status) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "preparing";
    case "preparing":
      return "on_the_way";
    case "on_the_way":
      return "delivered";
    default:
      return null;
  }
}

const PAGE_SIZE = 20;

// Restaurant is in Finland, so all order timestamps should always be shown
// in Helsinki local time — regardless of the admin's own device/browser
// timezone (this is what caused the time-mismatch vs the Django admin,
// which renders using the server's Europe/Helsinki TIME_ZONE setting).
const RESTAURANT_TZ = "Europe/Helsinki";

const formatDateHelsinki = (iso: string) =>
  new Date(iso).toLocaleDateString("fi-FI", { timeZone: RESTAURANT_TZ });

const formatTimeHelsinki = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: RESTAURANT_TZ,
  });

const formatStatus = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const { addToast } = useToast();
  const { adjustConfirmedOrders } = useAdminStats();

  async function fetchOrders(pageNum = 1) {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        page_size: String(PAGE_SIZE),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const data = await adminGet<PaginatedResponse>(
        `${ADMIN}/orders/?${params}`,
        token,
      );
      setOrders(data.results ?? []);
      setCount(data.count ?? 0);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function updateStatus(orderNumber: string, newStatus: string) {
    if (!token) return;
    setUpdating(orderNumber);
    try {
      await adminPatch(`${ADMIN}/orders/${orderNumber}/status/`, token, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => {
          if (o.order_number !== orderNumber) return o;
          // Track confirmed-order count changes for the dashboard stat card:
          // pending → confirmed: new confirmed order (+1)
          if (o.status === "pending" && newStatus === "confirmed") {
            adjustConfirmedOrders(+1);
          }
          // confirmed → anything else: it's no longer a "new" order (-1)
          if (o.status === "confirmed" && newStatus !== "confirmed") {
            adjustConfirmedOrders(-1);
          }
          return { ...o, status: newStatus };
        }),
      );
      addToast({ type: "success", title: `Status updated to ${formatStatus(newStatus)}`, duration: 3000 });
    } catch (err) {
      console.error("Failed to update status", err);
      addToast({ type: "error", title: `Failed to update status to ${formatStatus(newStatus)}`, duration: 3000 });
    } finally {
      setUpdating(null);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-amber-500 text-gray-900"
                  : "bg-gray-900 border border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search order #, name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:ml-auto w-full sm:w-64 bg-gray-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-1.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
        />
        <span className="text-gray-500 text-xs self-center shrink-0">
          {count} total
        </span>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Order #",
                    "Customer",
                    "Type",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {orders.map((order) => {
                const nextStatus = getNextStatus(order);
                return (
                  <tbody key={order.order_number}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpanded(
                          expanded === order.order_number
                            ? null
                            : order.order_number,
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        <span className="text-amber-400 font-mono text-xs">
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">
                          {order.customer_name || order.guest_name || "Guest"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {order.customer_email || order.guest_email}
                        </p>
                        {(order.customer_phone || order.guest_phone) && (
                          <p className="text-gray-600 text-xs">
                            {order.customer_phone || order.guest_phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">
                        {order.order_type}
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">
                        €{Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium capitalize ${PAYMENT_STYLES[order.payment_status] ?? "text-gray-400"}`}
                        >
                          {formatStatus(order.payment_status)}
                        </span>
                        <p className="text-gray-600 text-[10px] capitalize">
                          {order.payment_method?.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDateHelsinki(order.created_at)}
                        <br />
                        <span className="text-gray-600">
                          {formatTimeHelsinki(order.created_at)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {nextStatus ? (
                          <button
                            onClick={() =>
                              updateStatus(order.order_number, nextStatus)
                            }
                            disabled={updating === order.order_number}
                            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs rounded-lg capitalize transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {updating === order.order_number
                              ? "…"
                              : `→ ${formatStatus(nextStatus)}`}
                          </button>
                        ) : order.status !== "cancelled" ? (
                          <span className="text-gray-600 text-xs">Final</span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === order.order_number && (
                      <tr key={`${order.order_number}-expanded`}>
                        <td colSpan={8} className="px-4 pb-4 bg-gray-800/40">
                          <div className="grid grid-cols-2 gap-6 pt-3">
                            {/* Items */}
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                                Items
                              </p>
                              <div className="space-y-1">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-gray-300">
                                      {item.menu_item_name} ×{item.quantity}
                                    </span>
                                    <span className="text-gray-400">
                                      €{Number(item.total_price).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                                <div className="border-t border-white/5 pt-1 mt-1 flex justify-between text-xs">
                                  <span className="text-gray-500">
                                    Subtotal
                                  </span>
                                  <span className="text-gray-300">
                                    €{Number(order.subtotal).toFixed(2)}
                                  </span>
                                </div>
                                {Number(order.delivery_charge) > 0 && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">
                                      Delivery
                                    </span>
                                    <span className="text-gray-300">
                                      €
                                      {Number(order.delivery_charge).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-gray-300">Total</span>
                                  <span className="text-white">
                                    €{Number(order.total).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Order info */}
                            <div className="space-y-2 text-xs">
                              {order.order_type === "pickup" && order.scheduled_pickup_time && (
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                                    Pickup Date &amp; Time
                                  </p>
                                  <p className="text-amber-400 font-medium">
                                    {formatDateHelsinki(order.scheduled_pickup_time)}{" "}
                                    {formatTimeHelsinki(order.scheduled_pickup_time)}
                                  </p>
                                </div>
                              )}
                              {order.delivery_address && (
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                                    Delivery Address
                                  </p>
                                  <p className="text-gray-300">
                                    {order.delivery_address}
                                  </p>
                                </div>
                              )}
                              {order.order_notes && (
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                                    Notes
                                  </p>
                                  <p className="text-gray-300">
                                    {order.order_notes}
                                  </p>
                                </div>
                              )}
                              {order.items.some(
                                (i) => i.special_instruction,
                              ) && (
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                                    Special Instructions
                                  </p>
                                  {order.items
                                    .filter((i) => i.special_instruction)
                                    .map((i) => (
                                      <p key={i.id} className="text-gray-300">
                                        <span className="text-gray-500">
                                          {i.menu_item_name}:
                                        </span>{" "}
                                        {i.special_instruction}
                                      </p>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500 text-xs">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-900 border border-white/5 text-gray-400 text-xs rounded-lg disabled:opacity-30 hover:text-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-gray-900 border border-white/5 text-gray-400 text-xs rounded-lg disabled:opacity-30 hover:text-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}