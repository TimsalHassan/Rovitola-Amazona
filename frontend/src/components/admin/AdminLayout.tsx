// src/components/admin/AdminLayout.tsx
import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import Logo from "../Logo";
import {
  LayoutDashboard,
  Package,
  Utensils,
  Ticket,
  Users,
  Stars,
  MessageCircle,
  Settings,
  Menu,
  Globe,
  LogOut,
  Layers,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { ToastProvider } from "../../context/admin/ToastContext";
import ToastContainer from "./ToastContainer";
import { ADMIN, adminGet } from "../../api/admin";
import { AdminStatsProvider } from "../../context/admin/AdminStatsContext";

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", path: "/admin/orders", icon: Package },
  { label: "Menu Items", path: "/admin/menu", icon: Utensils },
  { label: "Categories", path: "/admin/categories", icon: Ticket },
  { label: "Extras", path: "/admin/extras", icon: Layers },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Reviews", path: "/admin/reviews", icon: Stars },
  { label: "Messages", path: "/admin/messages", icon: MessageCircle },
  { label: "Restaurant", path: "/admin/restaurant", icon: Settings },
];

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

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { admin, token, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Toast system ────────────────────────────────────────────────────────────
  const { toasts, addToast, removeToast } = useToast();

  // Previous stats refs — to detect changes between polls
  const prevOrders   = useRef<number | null>(null);
  const prevMessages = useRef<number | null>(null);
  const prevReviews  = useRef<number | null>(null);
  const isFirstPoll  = useRef(true);

  // ── Poll stats every 30s, fire toasts on new activity ──────────────────────
  useEffect(() => {
    if (!token) return;

    async function pollStats() {
      try {
        const stats = await adminGet<Stats>(`${ADMIN}/stats/`, token!);

        if (isFirstPoll.current) {
          // Seed the refs on first load — don't fire toasts for existing data
          prevOrders.current   = stats.pending_orders;
          prevMessages.current = stats.unread_messages;
          prevReviews.current  = stats.pending_reviews;
          isFirstPoll.current  = false;
          return;
        }

        // New pending orders → sticky (user must close)
        if (
          prevOrders.current !== null &&
          stats.pending_orders > prevOrders.current
        ) {
          const diff = stats.pending_orders - prevOrders.current;
          addToast({
            type: "order",
            title: `${diff} New Order${diff > 1 ? "s" : ""}!`,
            body: `${stats.pending_orders} pending order${stats.pending_orders > 1 ? "s" : ""} awaiting confirmation.`,
            // No duration → sticky
          });
          prevOrders.current = stats.pending_orders;
        }

        // New unread messages → 8s auto-dismiss
        if (
          prevMessages.current !== null &&
          stats.unread_messages > prevMessages.current
        ) {
          const diff = stats.unread_messages - prevMessages.current;
          addToast({
            type: "message",
            title: `${diff} New Message${diff > 1 ? "s" : ""}`,
            body: "You have unread contact messages.",
            duration: 8000,
          });
          prevMessages.current = stats.unread_messages;
        }

        // New pending reviews → 8s auto-dismiss
        if (
          prevReviews.current !== null &&
          stats.pending_reviews > prevReviews.current
        ) {
          const diff = stats.pending_reviews - prevReviews.current;
          addToast({
            type: "review",
            title: `${diff} New Review${diff > 1 ? "s" : ""}`,
            body: "New review(s) waiting for your approval.",
            duration: 8000,
          });
          prevReviews.current = stats.pending_reviews;
        }
      } catch {
        // Silently ignore poll errors
      }
    }

    pollStats(); // immediate first check
    const interval = setInterval(pollStats, 30_000);
    return () => clearInterval(interval);
  }, [token, addToast]);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const currentLabel =
    NAV.find((n) => location.pathname.startsWith(n.path))?.label ?? "Admin";

  return (
    <AdminStatsProvider>
    <div className="h-screen overflow-hidden bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-52 flex flex-col h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "#0a0f1e",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Brand */}
        <div
          className="px-4 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="space-y-2.5">
            <Link to="/">
              <Logo />
            </Link>
            <p className="text-gray-600 text-[9px] mt-0.5 font-medium uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-base font-semibold transition-all ${
                  active
                    ? "bg-amber-500 text-gray-900"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-sm">
                  <Icon />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          className="shrink-0"
          style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 12px" }}
        />

        {/* Footer */}
        <div className="p-3 shrink-0">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-base text-gray-900 shrink-0">
              <span className="text-xs uppercase">
                {admin?.name ? admin.name[0] : "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold truncate">{admin?.name ?? "Admin"}</p>
              <p className="text-gray-600 text-sm truncate">{admin?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <Globe className="size-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-52">
        {/* Topbar */}
        <header
          className="flex items-center px-5 gap-3 shrink-0"
          style={{
            height: "52px",
            background: "#0a0f1e",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="size-6" />
          </button>
          <span className="text-white font-bold text-xl">{currentLabel}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>

      {/* ── Toast notifications ─────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    </AdminStatsProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ToastProvider>
  );
}