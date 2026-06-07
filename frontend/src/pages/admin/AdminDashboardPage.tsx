import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { BASE } from "../../api/base";

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

interface MenuItem {
  id: number;
  name: string;
  is_available: boolean;
}

interface PaginatedItems {
  count: number;
  results: MenuItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  on_the_way: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: string | number; sub: string; icon: string; accent?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-4 overflow-hidden border ${accent ? "bg-amber-500 border-amber-400" : "bg-[#0a0f1e] border-white/5"}`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${accent ? "text-amber-900" : "text-gray-500"}`}>{label}</div>
      <div className={`text-3xl font-black tracking-tight leading-none mb-1 ${accent ? "text-gray-900" : "text-white"}`}>{value}</div>
      <div className={`text-[10px] ${accent ? "text-amber-800" : "text-gray-600"}`}>{sub}</div>
      <div className={`absolute right-3 top-3 w-9 h-9 rounded-xl flex items-center justify-center text-base ${accent ? "bg-black/10" : "bg-white/5"}`}>
        {icon}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalMenuItems, setTotalMenuItems] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {
      Authorization: `Token ${token}`,
      "ngrok-skip-browser-warning": "true",
    };

    Promise.all([
      fetch(`${BASE}/orders/`, { headers }).then((r) => r.json() as Promise<PaginatedOrders>),
      fetch(`${BASE}/menu/items/?page_size=1`, { headers }).then((r) => r.json() as Promise<PaginatedItems>),
    ])
      .then(([ordersData, itemsData]) => {
        const results = ordersData.results ?? [];
        setOrders(results.slice(0, 5));
        setTotalOrders(ordersData.count ?? 0);
        setPendingCount(results.filter((o) => o.status === "pending").length);
        setTotalMenuItems(itemsData.count ?? 0);
        // Sum revenue from loaded orders (approximation — no dedicated stats endpoint)
        const rev = results.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
        setTotalRevenue(rev);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">
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

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-4 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard accent label="Total Orders" value={totalOrders} sub="All time" icon="📦" />
          <StatCard label="Revenue (recent)" value={`€${totalRevenue.toFixed(0)}`} sub="From loaded orders" icon="💶" />
          <StatCard label="Pending Orders" value={pendingCount} sub="Need attention" icon="⏳" />
          <StatCard label="Menu Items" value={totalMenuItems} sub="Total in database" icon="🍽️" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <h2 className="text-white font-bold text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-amber-400 hover:text-amber-300 text-xs font-semibold">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Order","Customer","Type","Total","Status"].map((h) => (
                      <th key={h} className="text-left text-gray-600 font-bold uppercase tracking-widest px-5 py-2.5 text-[9px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-mono text-amber-400 font-bold">#{o.order_number}</td>
                      <td className="px-5 py-3 text-gray-200 font-medium">{o.customer_name || o.guest_name || "Guest"}</td>
                      <td className="px-5 py-3 text-gray-500 capitalize">{o.order_type}</td>
                      <td className="px-5 py-3 text-white font-bold">€{Number(o.total).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${STATUS_STYLES[o.status] ?? STATUS_STYLES.pending}`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="text-white font-bold text-sm">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Add Menu Item", sub: "Create new dish", icon: "🍕", to: "/admin/menu/new" },
                { label: "Manage Orders", sub: `${pendingCount} pending`, icon: "📋", to: "/admin/orders" },
                { label: "View Categories", sub: "Browse menu sections", icon: "🏷️", to: "/admin/categories" },
                { label: "Django Admin", sub: "Full database access", icon: "⚙️", to: "/admin/", external: true },
              ].map((a) =>
                a.external ? (
                  <a key={a.to} href={a.to} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-800/40 hover:bg-gray-800 rounded-xl p-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-base shrink-0 group-hover:bg-amber-500/20 transition-colors">{a.icon}</div>
                    <div>
                      <p className="text-gray-200 text-xs font-semibold group-hover:text-white transition-colors">{a.label}</p>
                      <p className="text-gray-600 text-[10px]">{a.sub}</p>
                    </div>
                  </a>
                ) : (
                  <Link key={a.to} to={a.to}
                    className="flex items-center gap-3 bg-gray-800/40 hover:bg-gray-800 rounded-xl p-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-base shrink-0 group-hover:bg-amber-500/20 transition-colors">{a.icon}</div>
                    <div>
                      <p className="text-gray-200 text-xs font-semibold group-hover:text-white transition-colors">{a.label}</p>
                      <p className="text-gray-600 text-[10px]">{a.sub}</p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}