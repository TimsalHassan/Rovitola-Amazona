import { BASE } from "./base";
// ─── Types (mirror your Django serializers exactly) ───────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type OrderType = "delivery" | "pickup";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface SelectedOptionRead {
  extra_name: string;
  extra_name_fi: string;
  option_name: string;
  option_name_fi: string;
  additional_price: string;
}

export interface OrderItemRead {
  id: number;
  menu_item_name: string;
  menu_item_name_fi: string;
  quantity: number;
  base_price: string;
  total_price: string;
  special_instruction: string;
  selected_options: SelectedOptionRead[];
}

export interface Order {
  id: number;
  order_number: string;
  customer: number | null;
  customer_name: string;
  guest_name: string;
  guest_phone: string;
  status: OrderStatus;
  order_type: OrderType;
  delivery_address: string;
  order_notes: string;
  subtotal: string;
  delivery_charge: string;
  discount_amount: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: OrderItemRead[];
}

// ─── Write payloads ───────────────────────────────────────────────────────────

export interface CreateSelectedOption {
  extra_name: string;
  extra_name_fi?: string;
  option_name: string;
  option_name_fi?: string;
  additional_price: number;
}

export interface CreateOrderItem {
  menu_item_name: string;
  menu_item_name_fi?: string;
  quantity: number;
  base_price: number;
  total_price: number;
  special_instruction?: string;
  selected_options?: CreateSelectedOption[];
}

export interface CreateOrderPayload {
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  order_type: OrderType;
  delivery_address?: string;
  order_notes?: string;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total: number;
  items: CreateOrderItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // ✅ Must be "Token <token>" to match DRF TokenAuthentication / Knox
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { detail?: string }).detail ??
        `Order API error: ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const ordersApi = {
  /** Create a new order (auth optional — guests allowed) */
  create: (payload: CreateOrderPayload) =>
    request<Order>("/orders/create/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Retrieve a single order by order_number */
  getByNumber: (orderNumber: string) =>
    request<Order>(`/orders/${orderNumber}/`),

  /** List orders for the current user (or by guest_phone/guest_email) */
  list: (params?: { guest_phone?: string; guest_email?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<Order[]>(`/orders/${qs}`);
  },

  /** Initiate Paytrail payment for an order */
  initiatePayment: (orderNumber: string) =>
    request<{ payment_url: string }>(
      `/orders/payment/${orderNumber}/initiate/`,
      { method: "POST" },
    ),
};