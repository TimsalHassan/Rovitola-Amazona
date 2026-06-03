import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "../../context/admin/AdminAuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface Category {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  price: string;
  category: string;
  is_available: boolean;
  is_lunch_item: boolean;
}

const EMPTY: FormData = {
  name: "",
  name_en: "",
  description: "",
  description_en: "",
  price: "",
  category: "",
  is_available: true,
  is_lunch_item: false,
};

export default function AdminMenuFormPage() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/menu/categories/`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);

    if (isEdit) {
      fetch(`${BASE_URL}/admin/menu/items/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name ?? "",
            name_en: data.name_en ?? "",
            description: data.description ?? "",
            description_en: data.description_en ?? "",
            price: data.price ?? "",
            category: data.category?.id?.toString() ?? "",
            is_available: data.is_available ?? true,
            is_lunch_item: data.is_lunch_item ?? false,
          });
          if (data.image) setImagePreview(data.image);
        })
        .catch(console.error);
    }
  }, [id]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
      if (imageFile) body.append("image", imageFile);

      const url = isEdit
        ? `${BASE_URL}/admin/menu/items/${id}/`
        : `${BASE_URL}/admin/menu/items/`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Token ${token}` },
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }

      navigate("/admin/menu");
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function set(key: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">
          {isEdit ? "Edit Menu Item" : "Add Menu Item"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Image upload */}
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
            <label className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 text-sm rounded-xl transition-colors">
              {imagePreview ? "Change image" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Details</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (Finnish)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Name (English)</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => set("name_en", e.target.value)}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Description (Finnish)</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Description (English)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => set("description_en", e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Price (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition-colors"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-3">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Settings</p>

          {[
            { key: "is_available" as const, label: "Available", desc: "Show this item on the menu" },
            { key: "is_lunch_item" as const, label: "Lunch item", desc: "Show in the lunch menu section" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => set(key, !form[key])}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  form[key] ? "bg-amber-500" : "bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    form[key] ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 font-medium text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}