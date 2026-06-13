// src/components/admin/ToastContainer.tsx
import { useEffect, useState } from "react";
import { X, Package, MessageCircle, Star, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { Toast, ToastType } from "../../hooks/useToast";

// ── Config per type ───────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; border: string; iconBg: string; iconColor: string; label: string }
> = {
  order: {
    icon: <Package size={16} />,
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    label: "New Order",
  },
  message: {
    icon: <MessageCircle size={16} />,
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    label: "Message",
  },
  review: {
    icon: <Star size={16} />,
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    label: "Review",
  },
  success: {
    icon: <CheckCircle size={16} />,
    border: "border-green-500/30",
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
    label: "Success",
  },
  error: {
    icon: <AlertCircle size={16} />,
    border: "border-red-500/30",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    label: "Error",
  },
  info: {
    icon: <Info size={16} />,
    border: "border-gray-500/30",
    iconBg: "bg-gray-500/15",
    iconColor: "text-gray-400",
    label: "Info",
  },
};

// ── Single toast item ─────────────────────────────────────────────────────────
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[toast.type];

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar for timed toasts
  const hasDuration = !!toast.duration;

  function handleClose() {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      className={`relative flex items-start gap-3 w-80 rounded-xl border bg-[#0d1221] px-4 py-3 shadow-2xl transition-all duration-300 ${
        cfg.border
      } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-white text-xs font-bold leading-snug">{toast.title}</p>
        {toast.body && (
          <p className="text-gray-400 text-[11px] mt-0.5 leading-snug truncate">
            {toast.body}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors mt-0.5"
      >
        <X size={13} />
      </button>

      {/* Progress bar — only for timed toasts */}
      {hasDuration && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${cfg.iconColor.replace("text-", "bg-")} origin-left`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Container — renders all toasts ───────────────────────────────────────────
export default function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <>
      {/* Progress bar keyframe */}
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* Fixed bottom-right stack */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}