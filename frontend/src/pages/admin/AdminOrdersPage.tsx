import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/admin/AdminAuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: string;
  status: string;
  order_type: string;
  created_at: string;
  items_count: number;
}

const STATUSES = ["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ready: "bg-green-500/10 text-green-400 border-green-500/20",
  delivered: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<number | null>(null);

  async function fetchOrders() {
    try {
      const url =
        filter === "all"
          ? `${BASE_URL}/admin/orders/`
          : `${BASE_URL}/admin/orders/?status=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setOrders(data.results ?? data);
    } catch {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [filter]);

  async function updateStatus(orderId: number, newStatus: string) {
    setUpdating(orderId);
    try {
      await fetch(`${BASE_URL}/admin/orders/${orderId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

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
            {s}
          </button>
        ))}
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
                  {["Order #", "Customer", "Type", "Items", "Total", "Status", "Date", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-amber-400 font-mono text-xs">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{order.customer_name}</p>
                      <p className="text-gray-500 text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{order.order_type}</td>
                    <td className="px-4 py-3 text-gray-300">{order.items_count}</td>
                    <td className="px-4 py-3 text-white font-semibold">
                      €{Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("fi-FI")}
                    </td>
                    <td className="px-4 py-3">
                      {NEXT_STATUS[order.status] ? (
                        <button
                          onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                          disabled={updating === order.id}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs rounded-lg capitalize transition-all disabled:opacity-50"
                        >
                          {updating === order.id ? "..." : `→ ${NEXT_STATUS[order.status]}`}
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}