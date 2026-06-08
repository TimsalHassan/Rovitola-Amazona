
import { BASE } from "./base";

export const ADMIN = `${BASE}/admin`;

export function adminHeaders(token: string): HeadersInit {
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
}

export function adminFormHeaders(token: string): HeadersInit {
  return {
    Authorization: `Token ${token}`,
    "ngrok-skip-browser-warning": "true",
  };
}

// ── Generic helpers ───────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = Object.values(data).flat().join(" ") || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function adminGet<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: adminHeaders(token) });
  return handleResponse<T>(res);
}

export async function adminPost<T>(url: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function adminPatch<T>(url: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function adminPut<T>(url: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: adminHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function adminDelete(url: string, token: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`);
}

export async function adminPostForm<T>(url: string, token: string, body: FormData): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: adminFormHeaders(token),
    body,
  });
  return handleResponse<T>(res);
}

export async function adminPatchForm<T>(url: string, token: string, body: FormData): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: adminFormHeaders(token),
    body,
  });
  return handleResponse<T>(res);
}
