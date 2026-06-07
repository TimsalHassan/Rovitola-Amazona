import { BASE as BASE_URL } from "./base";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_staff: boolean;
}

export interface Address {
  id: number;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface AuthTokens {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  field?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...(options.headers as Record<string, string>),
    "ngrok-skip-browser-warning": "true",
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    let fieldError: string | undefined;

    try {
      const data = await res.json();
      if (typeof data === "object" && data !== null) {
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors[0];
        } else {
          const firstField = Object.keys(data)[0];
          if (firstField) {
            const msgs = data[firstField];
            errorMessage = Array.isArray(msgs) ? msgs[0] : String(msgs);
            fieldError = firstField;
          }
        }
      }
    } catch {
      // not JSON
    }

    const err = new Error(errorMessage) as Error & { field?: string; status: number };
    err.field = fieldError;
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const authApi = {
  // Returns { detail } — no token, user must verify email
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
  }) =>
    request<{ detail: string }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthTokens>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    request<{ detail: string }>("/auth/logout/", { method: "POST" }, token),

  getProfile: (token: string) =>
    request<User>("/auth/profile/", { method: "GET" }, token),

  updateProfile: (token: string, data: { name?: string; phone?: string }) =>
    request<User>(
      "/auth/profile/",
      { method: "PATCH", body: JSON.stringify(data) },
      token,
    ),

  changePassword: (
    token: string,
    data: { current_password: string; new_password: string },
  ) =>
    request<{ detail: string; token: string }>(
      "/auth/change-password/",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { uid: string; token: string; new_password: string }) =>
    request<{ message: string }>("/auth/reset-password/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Backend VerifyEmailView is a GET
  verifyEmail: (uid: string, token: string) =>
    request<{ detail: string }>(`/auth/verify-email/${uid}/${token}/`, {
      method: "GET",
    }),

  resendVerification: (email: string) =>
    request<{ detail: string }>("/auth/resend-verification/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

export const addressApi = {
  list: (token: string) =>
    request<PaginatedResponse<Address>>("/auth/addresses/", { method: "GET" }, token)
      .then((res) => res.results),

  create: (token: string, data: Omit<Address, "id" | "created_at">) =>
    request<Address>(
      "/auth/addresses/",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  update: (
    token: string,
    id: number,
    data: Partial<Omit<Address, "id" | "created_at">>,
  ) =>
    request<Address>(
      `/auth/addresses/${id}/`,
      { method: "PATCH", body: JSON.stringify(data) },
      token,
    ),

  delete: (token: string, id: number) =>
    request<void>(`/auth/addresses/${id}/`, { method: "DELETE" }, token),

  setDefault: (token: string, id: number) =>
    request<Address>(
      `/auth/addresses/${id}/`,
      { method: "PATCH", body: JSON.stringify({ is_default: true }) },
      token,
    ),
};