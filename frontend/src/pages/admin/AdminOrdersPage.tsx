import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { BASE } from "../../api/base";

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  total: string;
  status: string;
  payment_status: string;
  payment_method: string;
  order_type: string;
  delivery_address: string;
  order_notes: string;
  created_at: string;
  items: OrderItem[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

const STATUSES = ["all", "pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  on_the_way: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

const NEXT_STATUS: Record<string, string> = {
  pending:    "confirmed",
  confirmed:  "preparing",
  preparing:  "on_the_way",
  on_the_way: "delivered",
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid:   "text-red-400",
  paid:     "text-green-400",
  refunded: "text-blue-400",
};

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  async function fetchOrders(pageNum = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum) });
      // Backend OrderListView filters by authenticated user — admin uses IsAdminUser
      // to get all orders we need the admin endpoint; since that doesn't exist,
      // we use IsAdminUser check: admin token returns all orders via the standard endpoint
      const res = await fetch(`${BASE}/orders/?${params}`, {
        headers: {
          Authorization: `Token ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data: PaginatedResponse = await res.json();
      setOrders(data.results ?? []);
      setCount(data.count ?? 0);
    } catch {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [filter]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  async function updateStatus(orderNumber: string, newStatus: string) {
    setUpdating(orderNumber);
    try {
      await fetch(`${BASE}/orders/${orderNumber}/status/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, status: newStatus } : o))
      );
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === s
                ? "bg-amber-500 text-gray-900"
                : "bg-gray-900 border border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-xs self-center">{count} total</span>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order #", "Customer", "Type", "Total", "Payment", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((order) => (
                  <>
                    <tr
                      key={order.order_number}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order.order_number ? null : order.order_number)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-amber-400 font-mono text-xs">#{order.order_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{order.customer_name || order.guest_name || "Guest"}</p>
                        {order.guest_phone && <p className="text-gray-500 text-xs">{order.guest_phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{order.order_type}</td>
                      <td className="px-4 py-3 text-white font-semibold">€{Number(order.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium capitalize ${PAYMENT_STYLES[order.payment_status] ?? "text-gray-400"}`}>
                          {order.payment_status}
                        </span>
                        <p className="text-gray-600 text-[10px] capitalize">{order.payment_method?.replace(/_/g, " ")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("fi-FI")}
                        <br />
                        <span className="text-gray-600">{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {NEXT_STATUS[order.status] ? (
                          <button
                            onClick={() => updateStatus(order.order_number, NEXT_STATUS[order.status])}
                            disabled={updating === order.order_number}
                            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs rounded-lg capitalize transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {updating === order.order_number ? "..." : `→ ${NEXT_STATUS[order.status].replace("_", " ")}`}
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded === order.order_number && (
                      <tr key={`${order.order_number}-expanded`}>
                        <td colSpan={8} className="px-4 pb-4 bg-gray-800/40">
                          <div className="grid grid-cols-2 gap-4 pt-3">
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Items</p>
                              <div className="space-y-1">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-xs">
                                    <span className="text-gray-300">{item.menu_item_name} ×{item.quantity}</span>
                                    <span className="text-gray-400">€{Number(item.total_price).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                              {order.delivery_address && (
                                <p className="text-gray-400"><span className="text-gray-600">Address: </span>{order.delivery_address}</p>
                              )}
                              {order.order_notes && (
                                <p className="text-gray-400"><span className="text-gray-600">Notes: </span>{order.order_notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {count > 10 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500 text-xs">Page {page} of {Math.ceil(count / 10)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-900 border border-white/5 text-gray-400 text-xs rounded-lg disabled:opacity-30 hover:text-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(count / 10)}
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