const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  customer: number;
  customer_name: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}

export interface CreateReviewPayload {
  rating: number;
  text: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Reviews API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.detail || error.non_field_errors?.[0] || `API error: ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

export const reviewsApi = {
  getAll: () => get<Review[]>("/reviews/"),

  create: (payload: CreateReviewPayload, token: string) =>
    post<Review>("/reviews/create/", payload, token),
};
