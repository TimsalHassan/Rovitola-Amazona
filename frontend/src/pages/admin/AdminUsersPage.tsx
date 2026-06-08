// src/pages/admin/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet } from "../../api/admin";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_staff: boolean;
  is_email_verified: boolean;
  date_joined: string;
  orders_count: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  async function fetchUsers(pageNum = 1) {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), page_size: String(PAGE_SIZE) });
      if (search.trim()) params.set("search", search.trim());

      const data = await adminGet<PaginatedResponse>(`${ADMIN}/users/?${params}`, token);
      setUsers(data.results ?? []);
      setCount(data.count ?? 0);
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm bg-gray-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
        />
        <span className="text-gray-500 text-xs ml-auto">{count} users</span>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Phone", "Joined", "Orders", "Status"].map((h) => (
                    <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-amber-400 text-xs font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate max-w-[180px]">
                            {user.name || "—"}
                          </p>
                          <p className="text-gray-500 text-xs truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-400 text-xs">{user.phone || "—"}</td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(user.date_joined).toLocaleDateString("fi-FI")}
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{user.orders_count}</span>
                      <span className="text-gray-600 text-xs ml-1">orders</span>
                    </td>

                    {/* Status badges */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {user.is_email_verified ? (
                          <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20">
                            Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-700/50 text-gray-500 text-[10px] rounded border border-white/5">
                            Unverified
                          </span>
                        )}
                        {user.is_staff && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded border border-amber-500/20">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs">Page {page} of {totalPages}</p>
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
