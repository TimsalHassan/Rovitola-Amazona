// src/pages/admin/AdminCategoriesPage.tsx
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPost, adminPut, adminDelete } from "../../api/admin";

interface Category {
  id: number;
  name: string;
  name_fi: string;
  slug: string;
  order: number;
  items_count: number;
  has_deal: boolean;
  deal_label: string;
  deal_label_fi: string;
}

interface FormState {
  name: string;
  name_fi: string;
  order: string;
  has_deal: boolean;
  deal_label: string;
  deal_label_fi: string;
}

const EMPTY: FormState = {
  name: "", name_fi: "", order: "0",
  has_deal: false, deal_label: "", deal_label_fi: "",
};

export default function AdminCategoriesPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchCategories() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGet<{ results?: Category[] } | Category[]>(
        `${ADMIN}/categories/`,
        token
      );
      const list = Array.isArray(data) ? data : data.results ?? [];
      setCategories(list);
    } catch {
      console.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditItem(cat);
    setForm({
      name: cat.name ?? "",
      name_fi: cat.name_fi ?? "",
      order: String(cat.order),
      has_deal: cat.has_deal ?? false,
      deal_label: cat.deal_label ?? "",
      deal_label_fi: cat.deal_label_fi ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        name_fi: form.name_fi,
        order: Number(form.order),
        has_deal: form.has_deal,
        deal_label: form.deal_label,
        deal_label_fi: form.deal_label_fi,
      };

      if (editItem) {
        await adminPut(`${ADMIN}/categories/${editItem.id}/`, token, payload);
      } else {
        await adminPost(`${ADMIN}/categories/`, token, payload);
      }

      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError((err as Error).message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category? All menu items in it will be unassigned.")) return;
    if (!token) return;
    setDeletingId(id);
    try {
      await adminDelete(`${ADMIN}/categories/${id}/`, token);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  function setField(key: keyof FormState, value: string | boolean) {
    setForm((p) => ({ ...p, [key]: value }));
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              <p className="text-red-400 text-xs font-mono">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (Finnish)</label>
              <input
                type="text"
                value={form.name_fi}
                onChange={(e) => setField("name_fi", e.target.value)}
                placeholder="e.g. Pizzat"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (English)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Pizzas"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="w-32">
            <label className="block text-gray-400 text-xs mb-1.5">Sort order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setField("order", e.target.value)}
              className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* Deal toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Has deal label</p>
              <p className="text-gray-500 text-xs">Show a badge on this category (e.g. "Lunch special")</p>
            </div>
            <button
              type="button"
              onClick={() => setField("has_deal", !form.has_deal)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.has_deal ? "bg-amber-500" : "bg-gray-700"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.has_deal ? "translate-x-4" : "translate-x-1"}`} />
            </button>
          </div>

          {form.has_deal && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Deal label (Finnish)</label>
                <input
                  type="text"
                  value={form.deal_label_fi}
                  onChange={(e) => setField("deal_label_fi", e.target.value)}
                  placeholder="e.g. Lounastarjous"
                  className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Deal label (English)</label>
                <input
                  type="text"
                  value={form.deal_label}
                  onChange={(e) => setField("deal_label", e.target.value)}
                  placeholder="e.g. Lunch special"
                  className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                />
              </div>
            </div>
          )}

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
              {saving ? (
                <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</>
              ) : editItem ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
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
                {["Name (EN)", "Name (FI)", "Slug", "Items", "Order", "Deal", "Actions"].map((h) => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-400">{cat.name_fi}</td>
                  <td className="px-4 py-3">
                    <code className="text-amber-400 text-xs bg-amber-500/5 px-2 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{cat.items_count ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{cat.order}</td>
                  <td className="px-4 py-3">
                    {cat.has_deal ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded border border-amber-500/20">
                        {cat.deal_label || "Deal"}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
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
                        {deletingId === cat.id ? "…" : "Delete"}
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
