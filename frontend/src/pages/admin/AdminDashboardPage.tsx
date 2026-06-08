// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet } from "../../api/admin";
import { Package, DollarSign, Utensils, Users, MessageCircle, Star, Settings, Bell } from "lucide-react";
interface Stats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  total_revenue: string;
  today_revenue: string;
  total_users: number;
  total_menu_items: number;
  total_categories: number;
  unread_messages: number;
  pending_reviews: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  guest_name: string;
  total: string;
  status: string;
  created_at: string;
  order_type: string;
  items: { menu_item_name: string; quantity: number }[];
}

interface PaginatedOrders {
  count: number;
  results: RecentOrder[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  on_the_way: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  to,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
  to?: string;
}) {
  const inner = (
    <div
      className={`relative rounded-2xl p-4 overflow-hidden border transition-all ${accent ? "bg-amber-500 border-amber-400" : "bg-[#0a0f1e] border-white/5 hover:border-white/10"}`}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${accent ? "text-amber-900" : "text-gray-500"}`}
      >
        {label}
      </div>
      <div
        className={`text-3xl font-black tracking-tight leading-none mb-1 ${accent ? "text-gray-900" : "text-white"}`}
      >
        {value}
      </div>
      <div
        className={`text-[10px] ${accent ? "text-amber-800" : "text-gray-600"}`}
      >
        {sub}
      </div>
      <div
        className={`absolute right-3 top-3 w-9 h-9 rounded-xl flex items-center justify-center text-base ${accent ? "bg-black/10" : "bg-white/5"}`}
      >
        {icon}
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const t = token;

    function fetchData(isInitial = false) {
      Promise.all([
        adminGet<Stats>(`${ADMIN}/stats/`, t),
        adminGet<PaginatedOrders>(`${ADMIN}/orders/?page_size=10`, t),
      ])
        .then(([statsData, ordersData]) => {
          setStats(statsData);
          setRecentOrders(ordersData.results ?? []);
        })
        .catch(console.error)
        .finally(() => { if (isInitial) setLoading(false); });
    }

    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30_000);
    return () => clearInterval(interval);
  }, [token]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-4 animate-pulse h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-xl tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">{today}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Orders"
          accent
          value={stats?.total_orders ?? 0}
          sub={`${stats?.pending_orders ?? 0} pending`}
          icon={<Package />}
          to="/admin/orders"
        />
        <StatCard
          label="New Orders"
          value={stats?.confirmed_orders ?? 0}
          sub="confirmed, not yet started"
          icon={<Bell />}
          to="/admin/orders"
        />
        <StatCard
          label="Total Revenue"
          value={`€${Number(stats?.total_revenue ?? 0).toFixed(2)}`}
          sub={`€${Number(stats?.today_revenue ?? 0).toFixed(2)} today`}
          icon={<DollarSign />}
        />
        <StatCard
          label="Menu Items"
          value={stats?.total_menu_items ?? 0}
          sub={`${stats?.total_categories ?? 0} categories`}
          icon={<Utensils />}
          to="/admin/menu"
        />
        <StatCard
          label="Customers"
          value={stats?.total_users ?? 0}
          sub="registered accounts"
          icon={<Users />}
          to="/admin/users"
        />
      </div>

      {/* Secondary badges */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Link
          to="/admin/messages"
          className="flex items-center gap-3 bg-[#0a0f1e] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all"
        >
          <span className="text-xl">
            <MessageCircle />
          </span>
          <div>
            <p className="text-white text-sm font-bold">
              {stats?.unread_messages ?? 0} unread
            </p>
            <p className="text-gray-500 text-xs">Contact messages</p>
          </div>
        </Link>
        <Link
          to="/admin/reviews"
          className="flex items-center gap-3 bg-[#0a0f1e] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all"
        >
          <span className="text-xl">
            <Star />
          </span>
          <div>
            <p className="text-white text-sm font-bold">
              {stats?.pending_reviews ?? 0} pending
            </p>
            <p className="text-gray-500 text-xs">Reviews to approve</p>
          </div>
        </Link>
        <Link
          to="/admin/restaurant"
          className="flex items-center gap-3 bg-[#0a0f1e] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all"
        >
          <span className="text-xl">
            <Settings/>
          </span>
          <div>
            <p className="text-white text-sm font-bold">Settings</p>
            <p className="text-gray-500 text-xs">Restaurant & hours</p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-sm">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-amber-400 text-xs hover:text-amber-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-[#0a0f1e] border border-white/5 rounded-xl overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {recentOrders.map((order) => (
                <div
                  key={order.order_number}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3"
                >
                  {/* Order number */}
                  <span className="text-amber-400 font-mono text-xs shrink-0">
                    #{order.order_number}
                  </span>

                  {/* Customer + items */}
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {order.customer_name || order.guest_name || "Guest"}
                    </p>
                    <p className="text-gray-500 text-[10px] truncate">
                      {order.items
                        .map((i) => `${i.menu_item_name} ×${i.quantity}`)
                        .join(", ")}
                    </p>
                  </div>

                  {/* Price */}
                  <span className="text-white text-xs font-semibold shrink-0">
                    €{Number(order.total).toFixed(2)}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
