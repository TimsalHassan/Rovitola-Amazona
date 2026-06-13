import { BASE } from "./base";

// ─── Types (mirror Django cart serializers) ───────────────────────────────────

export interface CartItemSelectedOption {
  id: number;
  extra_option: number;
  extra_name: string;
  extra_name_fi: string;
  option_name: string;
  option_name_fi: string;
  additional_price: string; // DecimalField → string from DRF
}

export interface CartItem {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  menu_item_name_fi: string;
  menu_item_image: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  special_instruction: string;
  selected_options: CartItemSelectedOption[];
}

export interface Cart {
  id: number;
  total_items: number;
  subtotal: string;
  items: CartItem[];
  updated_at: string;
}

// ─── Write payloads ───────────────────────────────────────────────────────────

export interface AddToCartPayload {
  menu_item_id: number;
  quantity?: number;
  special_instruction?: string;
  selected_option_ids?: number[]; // ExtraOption PKs
}

export interface UpdateCartItemPayload {
  quantity: number;
  special_instruction?: string;
  selected_option_ids?: number[];
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include", // needed for guest session cookie
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      "ngrok-skip-browser-warning": "true",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { detail?: string }).detail ?? `Cart API error: ${res.status}`,
    );
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const cartApi = {
  /** GET /api/cart/ — fetch current cart */
  get: () => request<Cart>("/cart/"),

  /** DELETE /api/cart/ — clear entire cart */
  clear: () => request<void>("/cart/", { method: "DELETE" }),

  /** POST /api/cart/add/ — add item (or increment if same combo exists) */
  addItem: (payload: AddToCartPayload) =>
    request<Cart>("/cart/add/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** PATCH /api/cart/items/:id/ — update qty / options / note */
  updateItem: (id: number, payload: UpdateCartItemPayload) =>
    request<Cart>(`/cart/items/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /** DELETE /api/cart/items/:id/ — remove one line item */
  removeItem: (id: number) =>
    request<Cart>(`/cart/items/${id}/`, { method: "DELETE" }),

  /** POST /api/cart/merge/ — merge guest cart into user cart after login */
  merge: () => request<Cart>("/cart/merge/", { method: "POST" }),
};