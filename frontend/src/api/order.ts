import { BASE } from "./base";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type OrderType = "delivery" | "pickup";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "online" | "cash_on_delivery" | "cash_on_pickup";

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
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  order_type: OrderType;
  delivery_address: string;
  order_notes: string;
  subtotal: string;
  delivery_charge: string;
  discount_amount: string;
  total: string;
  created_at: string;
  updated_at: string;
  scheduled_pickup_time: string | null;
  items: OrderItemRead[];
}

// ─── Write types ──────────────────────────────────────────────────────────────

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
  // Guest fields — omit when logged in
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  // Order info
  order_type: OrderType;
  payment_method: PaymentMethod;
  delivery_address?: string;
  order_notes?: string;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total: number;
  scheduled_pickup_time?: string;
  items: CreateOrderItem[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Request helper ───────────────────────────────────────────────────────────

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
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers ?? {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const b = body as Record<string, unknown>;
    // Extract the most useful error message from DRF response shapes
    const message =
      (b.detail as string) ||
      (b.error as string) ||
      (Array.isArray(b.non_field_errors) ? (b.non_field_errors[0] as string) : null) ||
      (() => {
        const first = Object.keys(b)[0];
        if (!first) return null;
        const msgs = b[first];
        return Array.isArray(msgs) ? (msgs[0] as string) : String(msgs);
      })() ||
      `Order API error: ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    request<Order>("/orders/create/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getByNumber: (orderNumber: string) =>
    request<Order>(`/orders/${orderNumber}/`),

  list: (params?: { guest_phone?: string; guest_email?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<PaginatedResponse<Order>>(`/orders/${qs}`).then(
      (res) => res.results,
    );
  },

  getStatus: (orderNumber: string) =>
    request<{ status: OrderStatus }>(`/orders/${orderNumber}/status/`),

  cancel: (orderNumber: string, guestCredentials?: { guest_phone?: string; guest_email?: string }) =>
  request<Order>(`/orders/${orderNumber}/cancel/`, {
    method: "PATCH",
    body: JSON.stringify(guestCredentials ?? {}),
  }),

  initiatePayment: (orderNumber: string) =>
    request<{ payment_url: string }>(`/payments/${orderNumber}/initiate/`, {
      method: "POST",
    }),
};