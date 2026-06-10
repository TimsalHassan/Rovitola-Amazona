// src/pages/admin/AdminExtrasPage.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPost, adminPatch, adminDelete } from "../../api/admin";
import { ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";

export interface Extra {
  id: number;
  category: number;
  category_name: string;
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  selection_type: "single" | "multiple";
  extra_type: "choice" | "extra";
  is_required: boolean;
  is_active: boolean;
  min_selections: number;
  max_selections: number | null;
  order: number;
  options_count: number;
}

interface Category {
  id: number;
  name: string;
  name_fi: string;
}

interface FormState {
  category: string;
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  min_selections: string;
  max_selections: string;
  is_active: boolean;
  order: string;
}

const EMPTY: FormState = {
  category: "",
  name: "",
  name_fi: "",
  description: "",
  description_fi: "",
  selection_type: "multiple",
  is_required: false,
  min_selections: "0",
  max_selections: "",
  is_active: true,
  order: "0",
};

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        value ? "bg-amber-500" : "bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          value ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminExtrasPage() {
  const { token } = useAdminAuth();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Extra | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [extrasData, catsData] = await Promise.all([
        adminGet<{ results?: Extra[] } | Extra[]>(`${ADMIN}/extras/`, token),
        adminGet<{ results?: Category[] } | Category[]>(`${ADMIN}/categories/`, token),
      ]);
      setExtras(Array.isArray(extrasData) ? extrasData : (extrasData.results ?? []));
      setCategories(Array.isArray(catsData) ? catsData : (catsData.results ?? []));
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openNew() {
    setEditItem(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: Extra) {
    setEditItem(item);
    setForm({
      category: String(item.category),
      name: item.name,
      name_fi: item.name_fi,
      description: item.description ?? "",
      description_fi: item.description_fi ?? "",
      selection_type: item.selection_type,
      is_required: item.is_required,
      min_selections: String(item.min_selections),
      max_selections: item.max_selections != null ? String(item.max_selections) : "",
      is_active: item.is_active,
      order: String(item.order),
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditItem(null);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      category: parseInt(form.category),
      name: form.name,
      name_fi: form.name_fi,
      description: form.description,
      description_fi: form.description_fi,
      selection_type: form.selection_type,
      is_required: form.is_required,
      min_selections: parseInt(form.min_selections) || 0,
      max_selections: form.max_selections ? parseInt(form.max_selections) : null,
      is_active: form.is_active,
      order: parseInt(form.order) || 0,
    };
    try {
      if (editItem) {
        const updated = await adminPatch<Extra>(
          `${ADMIN}/extras/${editItem.id}/`,
          token,
          payload
        );
        setExtras((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await adminPost<Extra>(`${ADMIN}/extras/`, token, payload);
        setExtras((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this extra group? All its options will also be deleted.")) return;
    if (!token) return;
    setDeletingId(id);
    try {
      await adminDelete(`${ADMIN}/extras/${id}/`, token);
      setExtras((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete extra.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-gray-500 text-xs">{extras.length} extra groups</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Extra Group
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : extras.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm mb-2">No extra groups yet.</p>
            <p className="text-gray-600 text-xs">
              Create groups like "Toppings", "Sauces", "Size Upgrades" — then add options inside each.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Name", "Category", "Type", "Required", "Options", "Active", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-gray-500 text-xs font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {extras.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{item.name || item.name_fi}</p>
                      {item.name && item.name_fi && (
                        <p className="text-gray-500 text-xs">{item.name_fi}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[10px] rounded border font-medium bg-gray-700/50 text-gray-300 border-white/10">
                        {item.category_name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded border font-medium capitalize ${
                          item.selection_type === "single"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {item.selection_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded border font-medium ${
                          item.is_required
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {item.is_required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/extras/${item.id}/options`}
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                      >
                        {item.options_count ?? 0} options
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          item.is_active ? "bg-green-400" : "bg-gray-600"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/extras/${item.id}/options`}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                        >
                          Options
                        </Link>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Slide-in Form Panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={closeForm} />
          <div className="w-full max-w-lg bg-gray-950 border-l border-white/5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <h2 className="text-white font-bold">
                {editItem ? "Edit Extra Group" : "New Extra Group"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Category */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-2">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Category</p>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors"
                >
                  <option value="" disabled>Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.name_fi ? ` / ${c.name_fi}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-gray-600 text-xs">
                  These extras will apply to all items in this category.
                </p>
              </div>

              {/* Names */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Name</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">English</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Toppings"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Finnish</label>
                    <input
                      type="text"
                      value={form.name_fi}
                      onChange={(e) => set("name_fi", e.target.value)}
                      placeholder="e.g. Lisätäytteet"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Description</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">English</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={2}
                      placeholder="Optional description…"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Finnish</label>
                    <textarea
                      value={form.description_fi}
                      onChange={(e) => set("description_fi", e.target.value)}
                      rows={2}
                      placeholder="Valinnainen kuvaus…"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Selection Settings */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-4">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Selection Rules</p>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Selection Type</label>
                  <select
                    value={form.selection_type}
                    onChange={(e) => set("selection_type", e.target.value as "single" | "multiple")}
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors"
                  >
                    <option value="single">Single — customer picks one option</option>
                    <option value="multiple">Multiple — customer can pick many</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Min selections</label>
                    <input
                      type="number"
                      min="0"
                      value={form.min_selections}
                      onChange={(e) => set("min_selections", e.target.value)}
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Max selections{" "}
                      <span className="text-gray-600 text-[10px]">blank = unlimited</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.max_selections}
                      onChange={(e) => set("max_selections", e.target.value)}
                      placeholder="∞"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Display order</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => set("order", e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Settings</p>
                {(
                  [
                    { key: "is_required" as const, label: "Required", desc: "Customer must make a selection" },
                    { key: "is_active" as const, label: "Active", desc: "Show this group on the menu" },
                  ] as const
                ).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                    <Toggle value={form[key]} onChange={(v) => set(key, v)} />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 font-medium text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editItem ? (
                    "Save changes"
                  ) : (
                    "Create group"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}