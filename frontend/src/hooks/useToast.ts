// src/hooks/useToast.ts
// Re-export everything from the context so existing imports keep working
export type { Toast, ToastType } from "../context/admin/ToastContext";
export { useToast, ToastProvider } from "../context/admin/ToastContext";
