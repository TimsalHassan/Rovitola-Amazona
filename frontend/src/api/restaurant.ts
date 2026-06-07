import { BASE } from "./base";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpeningHours {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  is_closed: boolean;
  open_time: string | null;   // "HH:MM:SS"
  close_time: string | null;
  lunch_open: string | null;
  lunch_close: string | null;
}

export interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  phone_2: string;
  email: string;
  is_delivery_enabled: boolean;
  free_delivery_radius_km: number;
  paid_delivery_radius_km: number;
  delivery_fee: string;  // DecimalField → string from DRF
  min_order: string;
  opening_hours: OpeningHours[];
  is_open_now: boolean;
  open_status_message: string;
}

export interface DeliveryCheckPayload {
  latitude: number;
  longitude: number;
}

export interface DeliveryCheckResponse {
  is_eligible: boolean;
  delivery_fee: number | null;
  distance_km: number | null;
  message: string;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`Restaurant API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Restaurant API error: ${res.status}`);
  return res.json();
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const restaurantApi = {
  getInfo: () => get<RestaurantInfo>("/restaurant/info/"),

  checkDelivery: (payload: DeliveryCheckPayload) =>
    post<DeliveryCheckResponse>("/restaurant/delivery-check/", payload),
};