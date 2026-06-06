import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface User {
  id: number;
  name: string;
  email: string;
  is_staff: boolean;
  date_joined: string;
  orders_count: number;
}

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/admin/users/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsers(d.results ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm bg-gray-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
      />

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["User", "Email", "Role", "Orders", "Joined"].map((h) => (
                    <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <span className="text-amber-400 text-xs font-bold">
                            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.is_staff ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.orders_count}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.date_joined).toLocaleDateString("fi-FI")}
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