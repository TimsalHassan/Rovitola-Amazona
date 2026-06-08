// src/pages/admin/AdminMenuFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPostForm, adminPatchForm } from "../../api/admin";
import { BASE } from "../../api/base";

interface Category {
  id: number;
  name: string;
  name_fi: string;
  slug: string;
}

interface FormState {
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  base_price: string;
  sale_price: string;
  category: string;
  is_available: boolean;
  is_lunch_item: boolean;
}

const EMPTY: FormState = {
  name: "", name_fi: "", description: "", description_fi: "",
  base_price: "", sale_price: "", category: "",
  is_available: true, is_lunch_item: false,
};

export default function AdminMenuFormPage() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Load categories from admin endpoint
    adminGet<{ results?: Category[]; } | Category[]>(`${ADMIN}/categories/?page_size=100`, token)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any).results ?? [];
        setCategories(list);
      })
      .catch(console.error);

    if (isEdit) {
      setFetching(true);
      adminGet<any>(`${ADMIN}/menu-items/${id}/`, token)
        .then((data) => {
          setForm({
            name: data.name ?? "",
            name_fi: data.name_fi ?? "",
            description: data.description ?? "",
            description_fi: data.description_fi ?? "",
            base_price: data.base_price ?? "",
            sale_price: data.sale_price ?? "",
            category: data.category != null ? String(data.category) : "",
            is_available: data.is_available ?? true,
            is_lunch_item: data.is_lunch_item ?? false,
          });
          if (data.image) setImagePreview(data.image);
        })
        .catch((err) => setError(`Failed to load item: ${err.message}`))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, token]);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);

    try {
      const body = new FormData();
      if (form.name)         body.append("name", form.name);
      if (form.name_fi)      body.append("name_fi", form.name_fi);
      if (form.description)  body.append("description", form.description);
      if (form.description_fi) body.append("description_fi", form.description_fi);
      if (form.base_price)   body.append("base_price", form.base_price);
      if (form.category)     body.append("category", form.category);
      // sale_price: empty string clears it
      body.append("sale_price", form.sale_price);
      body.append("is_available", String(form.is_available));
      body.append("is_lunch_item", String(form.is_lunch_item));
      if (imageFile) body.append("image", imageFile);

      if (isEdit) {
        await adminPatchForm(`${ADMIN}/menu-items/${id}/`, token, body);
      } else {
        await adminPostForm(`${ADMIN}/menu-items/`, token, body);
      }

      navigate("/admin/menu");
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              <div className="h-9 bg-gray-800 rounded-xl" />
              <div className="h-9 bg-gray-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition-colors">
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">{isEdit ? "Edit Menu Item" : "Add Menu Item"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {/* Image */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Image</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-3xl">🍽️</span>
              )}
            </div>
            <div className="space-y-1">
              <label className="cursor-pointer inline-flex px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 text-sm rounded-xl transition-colors">
                {imagePreview ? "Change image" : "Upload image"}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="block text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Names */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Name</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">English</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Margherita Pizza"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Finnish</label>
              <input type="text" value={form.name_fi} onChange={(e) => set("name_fi", e.target.value)}
                placeholder="e.g. Margherita Pizza"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Description</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">English</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={3} placeholder="Describe the item…"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Finnish</label>
              <textarea value={form.description_fi} onChange={(e) => set("description_fi", e.target.value)}
                rows={3} placeholder="Kuvaile tuotetta…"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors resize-none placeholder:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Pricing + category */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Pricing & Category</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Base price (€) <span className="text-red-400">*</span></label>
              <input type="number" step="0.01" min="0" value={form.base_price}
                onChange={(e) => set("base_price", e.target.value)} required placeholder="0.00"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">
                Sale price (€) <span className="text-gray-600 text-[10px]">optional</span>
              </label>
              <input type="number" step="0.01" min="0" value={form.sale_price}
                onChange={(e) => set("sale_price", e.target.value)} placeholder="Leave blank if no sale"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Category <span className="text-red-400">*</span></label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} required
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors">
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name || c.name_fi}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-3">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Settings</p>
          {(
            [
              { key: "is_available" as const, label: "Available", desc: "Show this item on the menu" },
              { key: "is_lunch_item" as const, label: "Lunch item", desc: "Show in the lunch menu section" },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => set(key, !form[key])}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form[key] ? "bg-amber-500" : "bg-gray-700"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form[key] ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 font-medium text-sm rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</>
            ) : isEdit ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </div>
  );
}
