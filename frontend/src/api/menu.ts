import { BASE } from "./base";
// ─── Types (mirror your Django serializers exactly) ───────────────────────────

export interface ExtraOption {
  id: number;
  name: string;
  name_fi: string;
  additional_price: string; // DecimalField comes back as string from DRF
  sale_price: string | null;
  display_price: string;
  is_on_sale: boolean;
  order: number;
}

export interface Extra {
  id: number;
  category: number;
  category_slug: string;
  name: string;
  name_fi: string;
  extra_type: "choice" | "extra";
  is_required: boolean;
  max_selections: number | null;
  order: number;
  options: ExtraOption[];
}

export interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  category_slug: string;
  name: string;
  name_fi: string;
  description: string;
  description_fi: string;
  base_price: string;
  sale_price: string | null;
  current_price: string;
  is_on_sale: boolean;
  image: string | null;
  is_available: boolean;
  is_lunch_item: boolean;
  created_at: string;
  extras: Extra[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  order: number;
  has_deal: boolean;
  deal_label: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

type Lang = "en" | "fi";

async function get<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`Menu API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const menuApi = {
  getCategories: (language: Lang = "en") =>
    get<Category[]>("/menu/categories/", { language }),

  getItems: (
    params: {
      language?: Lang;
      category?: string;
      is_lunch_item?: boolean;
      is_available?: boolean;
    } = {},
  ) => {
    const { language = "en", category, is_lunch_item, is_available } = params;
    const p: Record<string, string> = { language };
    if (category) p.category = category;
    if (is_lunch_item !== undefined) p.is_lunch_item = String(is_lunch_item);
    if (is_available !== undefined) p.is_available = String(is_available);
    return get<MenuItem[]>("/menu/items/", p);
  },

  getItem: (id: number, language: Lang = "en") =>
    get<MenuItem>(`/menu/items/${id}/`, { language }),

  getExtras: (params: { language?: Lang; category?: string } = {}) => {
    const { language = "en", category } = params;
    const p: Record<string, string> = { language };
    if (category) p.category = category;
    return get<Extra[]>("/menu/extras/", p);
  },
};
