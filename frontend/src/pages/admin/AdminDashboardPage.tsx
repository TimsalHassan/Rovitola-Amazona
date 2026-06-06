import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface DashboardStats {
  total_orders: number;
  today_orders: number;
  total_revenue: number;
  today_revenue: number;
  pending_orders: number;
  total_users: number;
  total_menu_items: number;
  recent_orders: RecentOrder[];
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total: string;
  status: string;
  created_at: string;
  order_type: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ready: "bg-green-500/10 text-green-400 border-green-500/20",
  delivered: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Mock data for UI preview ─────────────────────────────────────────────────
const MOCK_STATS: DashboardStats = {
  total_orders: 847,
  today_orders: 24,
  total_revenue: 14290,
  today_revenue: 386,
  pending_orders: 3,
  total_users: 128,
  total_menu_items: 42,
  recent_orders: [
    { id: 1, order_number: "ORD-1042", customer_name: "Mikael Virtanen", total: "28.50", status: "pending", created_at: new Date().toISOString(), order_type: "dine-in" },
    { id: 2, order_number: "ORD-1041", customer_name: "Sofia Mäkinen", total: "14.90", status: "preparing", created_at: new Date().toISOString(), order_type: "takeaway" },
    { id: 3, order_number: "ORD-1040", customer_name: "Janne Korhonen", total: "42.00", status: "ready", created_at: new Date().toISOString(), order_type: "delivery" },
    { id: 4, order_number: "ORD-1039", customer_name: "Aino Leinonen", total: "19.00", status: "confirmed", created_at: new Date().toISOString(), order_type: "dine-in" },
  ],
};

const MOCK_ACTIVITY = [
  { color: "bg-amber-500", text: "New order from Mikael", time: "2 min ago" },
  { color: "bg-green-500", text: "Order ready #ORD-1040", time: "8 min ago" },
  { color: "bg-blue-500", text: "New user registered", time: "15 min ago" },
  { color: "bg-red-500", text: "Item marked unavailable: Salmon", time: "32 min ago" },
];

const MOCK_CATEGORIES = [
  { name: "Mains", pct: 85 },
  { name: "Starters", pct: 60 },
  { name: "Desserts", pct: 40 },
  { name: "Drinks", pct: 25 },
];
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  trend,
  trendUp,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-4 overflow-hidden border ${
        accent
          ? "bg-amber-500 border-amber-400"
          : "bg-[#0a0f1e] border-white/5"
      }`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${accent ? "text-amber-900" : "text-gray-500"}`}>
        {label}
      </div>
      <div className={`text-3xl font-black tracking-tight leading-none mb-1 ${accent ? "text-gray-900" : "text-white"}`}>
        {value}
      </div>
      <div className={`text-[10px] mb-2 ${accent ? "text-amber-800" : "text-gray-600"}`}>{sub}</div>
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
          trendUp
            ? accent ? "bg-black/10 text-amber-900" : "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {trendUp ? "↑" : "↓"} {trend}
      </span>
      <div
        className={`absolute right-3 top-3 w-9 h-9 rounded-xl flex items-center justify-center text-base ${
          accent ? "bg-black/10" : "bg-white/5"
        }`}
      >
        {icon}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || token === "mock-token-123") return;
    setLoading(true);
    fetch(`${BASE_URL}/admin/stats/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Top greeting bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-xl tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">{today}</p>
        </div>
        <Link
          to="/admin/menu/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs rounded-xl transition-all"
        >
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Item
        </Link>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-4 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard accent label="Today's Orders" value={stats.today_orders} sub={`${stats.total_orders} total all time`} trend="18% vs yesterday" trendUp icon="📦" />
          <StatCard label="Today's Revenue" value={`€${Number(stats.today_revenue).toFixed(0)}`} sub={`€${Number(stats.total_revenue).toLocaleString()} total`} trend="12% vs yesterday" trendUp icon="💶" />
          <StatCard label="Pending Orders" value={stats.pending_orders} sub="Need attention" trend="1 since last hour" trendUp={false} icon="⏳" />
          <StatCard label="Total Users" value={stats.total_users} sub={`${stats.total_menu_items} menu items`} trend="5 new this week" trendUp icon="👥" />
        </div>
      )}

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent orders — takes 2 cols */}
        <div className="lg:col-span-2 bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <h2 className="text-white font-bold text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-amber-400 hover:text-amber-300 text-xs font-semibold">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {["Order","Customer","Type","Total","Status"].map(h => (
                    <th key={h} className="text-left text-gray-600 font-bold uppercase tracking-widest px-5 py-2.5 text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-amber-400 font-bold">#{o.order_number}</td>
                    <td className="px-5 py-3 text-gray-200 font-medium">{o.customer_name}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{o.order_type}</td>
                    <td className="px-5 py-3 text-white font-bold">€{Number(o.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${STATUS_STYLES[o.status] ?? STATUS_STYLES.pending}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Top categories */}
          <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="text-white font-bold text-sm">Top Categories</h2>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_CATEGORIES.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-16 shrink-0">{c.name}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-gray-300 text-xs font-bold w-8 text-right">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live activity */}
          <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-bold text-sm">Live Activity</h2>
              <span className="flex items-center gap-1.5 text-[9px] text-green-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${a.color}`} />
                  <div>
                    <p className="text-gray-300 text-xs leading-snug">{a.text}</p>
                    <p className="text-gray-600 text-[9px] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Add Menu Item", sub: "Create new dish", icon: "🍕", to: "/admin/menu/new" },
          { label: "Manage Orders", sub: `${stats.pending_orders} pending`, icon: "📋", to: "/admin/orders" },
          { label: "Categories", sub: "Edit menu sections", icon: "🏷️", to: "/admin/categories" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex items-center gap-3 bg-[#0a0f1e] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.03] rounded-2xl p-4 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg shrink-0 group-hover:bg-amber-500/20 transition-colors">
              {a.icon}
            </div>
            <div>
              <p className="text-gray-200 text-sm font-semibold group-hover:text-white transition-colors">{a.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}