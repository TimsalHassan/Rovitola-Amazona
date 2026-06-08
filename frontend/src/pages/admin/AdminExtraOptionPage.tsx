// src/pages/admin/AdminExtraOptionsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPost, adminPut, adminDelete } from "../../api/admin";
import type { Extra } from "./AdminExtrasPage";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

interface ExtraOption {
  id: number;
  extra: number;
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  price: string;
  is_default: boolean;
  is_active: boolean;
  order: number;
}

interface FormState {
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  price: string;
  is_default: boolean;
  is_active: boolean;
  order: string;
}

const EMPTY: FormState = {
  name: "",
  name_fi: "",
  description: "",
  description_fi: "",
  price: "0.00",
  is_default: false,
  is_active: true,
  order: "0",
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

export default function AdminExtraOptionsPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();

  const [extra, setExtra] = useState<Extra | null>(null);
  const [options, setOptions] = useState<ExtraOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ExtraOption | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [extraData, optionsData] = await Promise.all([
        adminGet<Extra>(`${ADMIN}/extras/${id}/`, token),
        adminGet<{ results?: ExtraOption[] } | ExtraOption[]>(
          `${ADMIN}/extras/${id}/options/`,
          token
        ),
      ]);
      setExtra(extraData);
      const list = Array.isArray(optionsData) ? optionsData : (optionsData.results ?? []);
      setOptions(list);
    } catch {
      console.error("Failed to load extra options");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openNew() {
    setEditItem(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: ExtraOption) {
    setEditItem(item);
    setForm({
      name: item.name,
      name_fi: item.name_fi,
      description: item.description ?? "",
      description_fi: item.description_fi ?? "",
      price: item.price,
      is_default: item.is_default,
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
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      name_fi: form.name_fi,
      description: form.description,
      description_fi: form.description_fi,
      price: parseFloat(form.price) || 0,
      is_default: form.is_default,
      is_active: form.is_active,
      order: parseInt(form.order) || 0,
      extra: parseInt(id),
    };
    try {
      if (editItem) {
        const updated = await adminPut<ExtraOption>(
          `${ADMIN}/extras/${id}/options/${editItem.id}/`,
          token,
          payload
        );
        setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } else {
        const created = await adminPost<ExtraOption>(
          `${ADMIN}/extras/${id}/options/`,
          token,
          payload
        );
        setOptions((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(optionId: number) {
    if (!confirm("Delete this option?")) return;
    if (!token || !id) return;
    setDeletingId(optionId);
    try {
      await adminDelete(`${ADMIN}/extras/${id}/options/${optionId}/`, token);
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } catch {
      alert("Failed to delete option.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/admin/extras"
          className="flex items-center gap-1.5 text-gray-500 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Extras
        </Link>
        <span className="text-gray-700">/</span>
        {loading || !extra ? (
          <span className="text-gray-400">Loading…</span>
        ) : (
          <span className="text-white font-medium">{extra.name || extra.name_fi}</span>
        )}
      </div>

      {/* Extra info banner */}
      {extra && (
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold">{extra.name || extra.name_fi}</p>
            {extra.name && extra.name_fi && (
              <p className="text-gray-500 text-xs">{extra.name_fi}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`px-2 py-0.5 rounded border font-medium capitalize ${
                extra.selection_type === "single"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/20"
              }`}
            >
              {extra.selection_type}
            </span>
            <span
              className={`px-2 py-0.5 rounded border font-medium ${
                extra.is_required
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              }`}
            >
              {extra.is_required ? "Required" : "Optional"}
            </span>
            {extra.min_selections > 0 && (
              <span className="text-gray-500">min {extra.min_selections}</span>
            )}
            {extra.max_selections != null && (
              <span className="text-gray-500">max {extra.max_selections}</span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-gray-500 text-xs">{options.length} options</p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : options.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm mb-1">No options yet.</p>
            <p className="text-gray-600 text-xs">Add options like "Mushrooms +€0.80" or "No onions (free)".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Option", "Price", "Default", "Active", "Order", "Actions"].map((h) => (
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
                {options
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((opt) => (
                    <tr key={opt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm">{opt.name || opt.name_fi}</p>
                        {opt.name && opt.name_fi && (
                          <p className="text-gray-500 text-xs">{opt.name_fi}</p>
                        )}
                        {opt.description && (
                          <p className="text-gray-600 text-xs mt-0.5 truncate max-w-[200px]">{opt.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {Number(opt.price) === 0 ? (
                          <span className="text-gray-500 text-xs">Free</span>
                        ) : (
                          <span className="text-green-400 font-semibold text-sm">
                            +€{Number(opt.price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {opt.is_default ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded font-medium">
                            Default
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            opt.is_active ? "bg-green-400" : "bg-gray-600"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-xs">{opt.order}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(opt)}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(opt.id)}
                            disabled={deletingId === opt.id}
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
                {editItem ? "Edit Option" : "New Option"}
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
                      placeholder="e.g. Mushrooms"
                      required
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Finnish</label>
                    <input
                      type="text"
                      value={form.name_fi}
                      onChange={(e) => set("name_fi", e.target.value)}
                      placeholder="e.g. Sienet"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Description <span className="text-gray-600 normal-case font-normal">(optional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">English</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={2}
                      placeholder="Short note…"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Finnish</label>
                    <textarea
                      value={form.description_fi}
                      onChange={(e) => set("description_fi", e.target.value)}
                      rows={2}
                      placeholder="Lyhyt kuvaus…"
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Order */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Pricing & Order</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Extra price (€) <span className="text-gray-600 text-[10px]">0 = free</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors"
                    />
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
              </div>

              {/* Toggles */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Settings</p>
                {(
                  [
                    { key: "is_default" as const, label: "Default selected", desc: "Pre-selected when the extra loads" },
                    { key: "is_active" as const, label: "Active", desc: "Show this option to customers" },
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
                    "Add option"
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