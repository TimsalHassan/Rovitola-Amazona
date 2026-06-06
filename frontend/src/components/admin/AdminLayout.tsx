import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { label: "Orders", path: "/admin/orders", icon: "📦", badge: true },
  { label: "Menu Items", path: "/admin/menu", icon: "🍽️" },
  { label: "Categories", path: "/admin/categories", icon: "🏷️" },
  { label: "Users", path: "/admin/users", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const currentLabel = NAV.find((n) => location.pathname.startsWith(n.path))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-52 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "#0a0f1e", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Brand */}
        <div className="px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-base shrink-0 font-bold text-gray-900">
              🍽
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none tracking-tight">Amazona</p>
              <p className="text-gray-600 text-[9px] mt-0.5 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-amber-500 text-gray-900"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 12px" }} />

        {/* Footer */}
        <div className="p-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-black text-gray-900 shrink-0">
              {admin?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{admin?.name ?? "Admin"}</p>
              <p className="text-gray-600 text-[9px] truncate">{admin?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <span className="text-sm">🌐</span> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          >
            <span className="text-sm">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-13 flex items-center px-5 gap-3 sticky top-0 z-10"
          style={{ height: "52px", background: "#0a0f1e", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">/</span>
            <span className="text-white font-bold text-sm">{currentLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-auto">{children}</main>
      </div>
    </div>
  );
}