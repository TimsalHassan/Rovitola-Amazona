import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface Category {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  order: number;
  items_count: number;
}

export default function AdminCategoriesPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", name_en: "", order: "0" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchCategories() {
    try {
      const res = await fetch(`${BASE_URL}/admin/categories/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setCategories(data.results ?? data);
    } catch {
      console.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openAdd() {
    setEditItem(null);
    setForm({ name: "", name_en: "", order: "0" });
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditItem(cat);
    setForm({ name: cat.name, name_en: cat.name_en ?? "", order: String(cat.order) });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editItem
        ? `${BASE_URL}/admin/categories/${editItem.id}/`
        : `${BASE_URL}/admin/categories/`;
      const method = editItem ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, order: Number(form.order) }),
      });

      setShowForm(false);
      fetchCategories();
    } catch {
      console.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category? All menu items in it will be unassigned.")) return;
    setDeletingId(id);
    try {
      await fetch(`${BASE_URL}/admin/categories/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      console.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-all"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-gray-900 border border-amber-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">
            {editItem ? "Edit Category" : "New Category"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (Finnish)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (English)</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-gray-400 text-xs mb-1.5">Sort order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all"
            >
              {saving ? "Saving..." : editItem ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No categories yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Name", "English", "Slug", "Items", "Order", "Actions"].map((h) => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-400">{cat.name_en}</td>
                  <td className="px-4 py-3">
                    <code className="text-amber-400 text-xs bg-amber-500/5 px-2 py-0.5 rounded">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{cat.items_count ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{cat.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === cat.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}