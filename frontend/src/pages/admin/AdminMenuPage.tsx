// src/pages/admin/AdminMenuPage.tsx
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast"; 
import { ADMIN, adminGet, adminDelete, adminPatch } from "../../api/admin";

interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  category_slug: string;
  name: string;
  name_fi: string;
  description: string;
  base_price: string;
  sale_price: string | null;
  current_price: string;
  is_on_sale: boolean;
  image: string | null;
  is_available: boolean;
  is_lunch_item: boolean;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MenuItem[];
}

const PAGE_SIZE = 20;

export default function AdminMenuPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  const fetchItems = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), page_size: String(PAGE_SIZE) });
      if (search.trim()) params.set("search", search.trim());

      const data = await adminGet<PaginatedResponse>(`${ADMIN}/menu-items/?${params}`, token);
      setItems(data.results ?? []);
      setCount(data.count ?? 0);
    } catch {
      console.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    setPage(1);
    fetchItems(1);
  }, [search, fetchItems]);

  useEffect(() => {
    fetchItems(page);
  }, [page, fetchItems]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this menu item? This cannot be undone.")) return;
    if (!token) return;
    setDeletingId(id);
    try {
      await adminDelete(`${ADMIN}/menu-items/${id}/`, token);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setCount((c) => c - 1);
      addToast({ type: "success", title: "Item deleted", duration: 3000 });
    } catch {
      addToast({ type: "error", title: "Failed to delete item", duration: 4000 });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(item: MenuItem) {
    if (!token) return;
    setTogglingId(item.id);
    try {
      const res = await adminPatch<{ id: number; is_available: boolean }>(
        `${ADMIN}/menu-items/${item.id}/toggle/`,
        token,
        {}
      );
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: res.is_available } : i))
      );
      addToast({ type: "success", title: `Item ${res.is_available ? "enabled" : "disabled"}`, duration: 3000 });
    } catch {
      addToast({ type: "error", title: "Failed to toggle availability", duration: 4000 });
    } finally {
      setTogglingId(null);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search menu items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0 max-w-sm bg-gray-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
        />
        <span className="text-gray-500 text-xs">{count} items</span>
        <Link
          to="/admin/menu/new"
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-all"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Item
        </Link>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No menu items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Item", "Category", "Price", "Tags", "Available", "Actions"].map((h) => (
                    <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🍽️</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm leading-tight truncate max-w-[160px]">{item.name || item.name_fi}</p>
                          {item.name_fi && item.name && (
                            <p className="text-gray-500 text-xs truncate max-w-[160px]">{item.name_fi}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <code className="text-amber-400 text-xs bg-amber-500/5 px-2 py-0.5 rounded">
                        {item.category_name}
                      </code>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      {item.is_on_sale ? (
                        <div>
                          <span className="text-green-400 font-semibold text-sm">€{Number(item.current_price).toFixed(2)}</span>
                          <span className="text-gray-600 line-through text-xs ml-1">€{Number(item.base_price).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-white font-semibold text-sm">€{Number(item.base_price).toFixed(2)}</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.is_lunch_item && (
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded border border-blue-500/20">
                            Lunch
                          </span>
                        )}
                        {item.is_on_sale && (
                          <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20">
                            Sale
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Available toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={togglingId === item.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                          item.is_available ? "bg-amber-500" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            item.is_available ? "translate-x-4" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/menu/${item.id}/edit`}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? "…" : "Delete"}
                        </button>
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
