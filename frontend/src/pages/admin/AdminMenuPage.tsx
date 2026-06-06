import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { BASE } from "../../api/base";

interface ExtraOption {
  id: number;
  name: string;
  name_fi: string;
  additional_price: string;
  sale_price: string | null;
  display_price: number;
  is_on_sale: boolean;
  order: number;
}

interface Extra{
  id: number;
  category: number;
  name: string;
  name_fi: string;
  extra_type: string;
  is_required: boolean;
  max_selections: number | null;
  order: number;
  options: ExtraOption[];
}
interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  category_slug: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  base_price: string;
  sale_price: string | null;
  current_price: number;
  is_on_sale: boolean;
  image: string | null;
  is_available: boolean;
  is_lunch_item: boolean;
  created_at: string;
  extras: Extra[];
}

export default function AdminMenuPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchItems = useCallback(async function fetchItems() {
    try {
      const res = await fetch(`${BASE}/menu/items/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      console.log("Fetched items:", data);
      setItems(data.results ?? data);
    } catch {
      console.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [token]);  

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function toggleAvailability(item: MenuItem) {
    setTogglingId(item.id);
    try {
      await fetch(`${BASE}/menu/items/${item.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_available: !item.is_available }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_available: !i.is_available } : i
        )
      );
    } catch {
      console.error("Failed to toggle");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;
    setDeletingId(id);
    try {
      await fetch(`${BASE}/menu/items/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      console.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      i.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
        />
        <Link
          to="/admin/menu/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-all whitespace-nowrap"
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
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Item", "Category", "Price", "Lunch", "Available", "Actions"].map((h) => (
                    <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-800"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                            <span className="text-gray-600 text-lg">🍽️</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          {item.name_en && (
                            <p className="text-gray-500 text-xs">{item.name_en}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-lg">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      €{Number(item.base_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {item.is_lunch_item ? (
                        <span className="text-amber-400 text-xs">✓ Yes</span>
                      ) : (
                        <span className="text-gray-600 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAvailability(item)}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/menu/${item.id}/edit`}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? "..." : "Delete"}
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
    </div>
  );
}