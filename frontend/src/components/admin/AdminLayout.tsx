// src/components/admin/AdminLayout.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import Logo from "../Logo";
import { LayoutDashboard, Package, Utensils, Ticket, Users, Stars, MessageCircle, Settings, Menu, Globe, LogOut } from "lucide-react"

const NAV = [
  { label: "Dashboard",   path: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Orders",      path: "/admin/orders",       icon: Package },
  { label: "Menu Items",  path: "/admin/menu",         icon: Utensils },
  { label: "Categories",  path: "/admin/categories",   icon: Ticket },
  { label: "Users",       path: "/admin/users",        icon: Users },
  { label: "Reviews",     path: "/admin/reviews",      icon: Stars },
  { label: "Messages",    path: "/admin/messages",     icon: MessageCircle },
  { label: "Restaurant",  path: "/admin/restaurant",   icon: Settings },
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
          <div className="space-y-2.5">
            <Logo/>
            <div>
              <p className="text-gray-600 text-[9px] mt-0.5 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
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
                <span className="text-sm"><Icon /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 12px" }} />

        {/* Footer */}
        <div className="p-3">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-base text-gray-900 shrink-0">
              <span className="text-xs uppercase">{admin?.name ? admin.name[0] : "A"}</span>
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
            <span className="text-base">
              <Globe className='size-4'/></span> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          >
            <span className="text-sm">
              <LogOut className='size-4'/></span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center px-5 gap-3 sticky top-0 z-10"
          style={{ height: "52px", background: "#0a0f1e", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className='size-6'/>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">{currentLabel}</span>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
