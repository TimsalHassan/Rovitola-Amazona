import { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { restaurantApi, type PickupSlot } from "../api/restaurant";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function PickupTimeSelector({ value, onChange, error }: Props) {
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(false);

    restaurantApi
      .getPickupSlots()
      .then((res) => {
        if (!cancelled) setSlots(res.slots ?? []);
      })
      .catch((err) => {
        console.error("Failed to load pickup slots:", err);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Backend se slots already din-order mein aate hain — grouping sirf display ke liye
  const grouped = new Map<string, PickupSlot[]>();
  for (const s of slots) {
    if (!grouped.has(s.date_label)) grouped.set(s.date_label, []);
    grouped.get(s.date_label)!.push(s);
  }

  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 size={15} className="text-gray-500 animate-spin" />
          ) : (
            <Clock size={15} className="text-gray-500" />
          )}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className={`w-full bg-gray-900 border rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? "border-red-500/60"
              : "border-white/10 focus:border-amber-500/50"
          }`}
        >
          <option value="" disabled>
            {loading ? "Loading pickup times…" : "Select pickup time…"}
          </option>
          {!loading && loadError ? (
            <option value="" disabled>
              Couldn't load pickup times — please try again
            </option>
          ) : !loading && grouped.size === 0 ? (
            <option value="" disabled>
              No available slots in the next 7 days
            </option>
          ) : (
            Array.from(grouped.entries()).map(([dayLabel, daySlots]) => (
              <optgroup key={dayLabel} label={dayLabel}>
                {daySlots.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {loadError && (
        <p className="text-red-400 text-xs mt-1">
          Couldn't load pickup times. Please refresh the page and try again.
        </p>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      {value && (
        <p className="text-amber-400 text-xs mt-1.5 flex items-center gap-1">
          <Clock size={11} />
          {new Date(value).toLocaleString("fi-FI", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}