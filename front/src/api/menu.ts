import { BASE } from "./base";

export interface ExtraOption {
  id: number;
  name: string;
  name_fi: string;
  additional_price: string;
  sale_price: string | null;
  display_price: string;
  is_on_sale: boolean;
  order: number;
}

export interface Extra {
  id: number;
  category: number;
  // NOTE: category_slug not in ExtraSerializer — removed
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
  category_description: string;
  category_deal_label: string;
  category_has_deal: boolean;
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type Lang = "en" | "fi";

async function get<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error(`Menu API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const menuApi = {
  getCategories: (language: Lang = "en") =>
    get<Category[]>("/menu/categories/", { language }),

  // FIX: items endpoint is paginated — unwrap results
  getItems: (
    params: {
      language?: Lang;
      category?: string;
      is_lunch_item?: boolean;
      is_available?: boolean;
      page?: number;
      page_size?: number;
    } = {},
  ) => {
    const {
      language = "en",
      category,
      is_lunch_item,
      is_available,
      page,
      page_size,
    } = params;
    const p: Record<string, string> = { language };
    if (category) p.category = category;
    if (is_lunch_item !== undefined) p.is_lunch_item = String(is_lunch_item);
    if (is_available !== undefined) p.is_available = String(is_available);
    if (page !== undefined) p.page = String(page);
    if (page_size !== undefined) p.page_size = String(page_size);
    return get<PaginatedResponse<MenuItem>>("/menu/items/", p).then(
      (res) => res.results,
    );
  },

  // For infinite scroll / pagination — returns full paginated response
  getItemsPaginated: (
    params: {
      language?: Lang;
      category?: string;
      is_lunch_item?: boolean;
      is_available?: boolean;
      page?: number;
      page_size?: number;
    } = {},
  ) => {
    const {
      language = "en",
      category,
      is_lunch_item,
      is_available,
      page,
      page_size,
    } = params;
    const p: Record<string, string> = { language };
    if (category) p.category = category;
    if (is_lunch_item !== undefined) p.is_lunch_item = String(is_lunch_item);
    if (is_available !== undefined) p.is_available = String(is_available);
    if (page !== undefined) p.page = String(page);
    if (page_size !== undefined) p.page_size = String(page_size);
    return get<PaginatedResponse<MenuItem>>("/menu/items/", p);
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
