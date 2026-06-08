// src/pages/admin/AdminRestaurantPage.tsx
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPatch, adminPut } from "../../api/admin";

interface OpeningHours {
  id: number;
  day: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  lunch_open: string | null;
  lunch_close: string | null;
}

interface RestaurantSettings {
  id: number;
  name: string;
  address: string;
  phone: string;
  phone_2: string;
  email: string;
  latitude: string;
  longitude: string;
  is_delivery_enabled: boolean;
  free_delivery_radius_km: string;
  paid_delivery_radius_km: string;
  delivery_fee: string;
  min_order: string;
  opening_hours: OpeningHours[];
}

// Shape the backend expects for each row in the bulk PUT
interface OpeningHoursPayload {
  id?: number;       // omit / undefined for new rows so backend creates them
  day: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  lunch_open: string | null;
  lunch_close: string | null;
}

interface BulkUpdateResponse {
  updated: OpeningHours[];
  errors: { id: number | null; error: string }[];
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Tab = "info" | "delivery" | "hours";

// Negative IDs mark rows that don't exist in the DB yet
let _tempId = -1;
function tempId() { return _tempId--; }
function isTemp(id: number) { return id < 0; }

export default function AdminRestaurantPage() {
  const { token } = useAdminAuth();
  const [, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tracks which day rows have the lunch section expanded
  const [lunchOpen, setLunchOpen] = useState<Record<number, boolean>>({});

  // Local editable copies
  const [info, setInfo] = useState({
    name: "", address: "", phone: "", phone_2: "", email: "",
    latitude: "", longitude: "",
  });
  const [delivery, setDelivery] = useState({
    is_delivery_enabled: true,
    free_delivery_radius_km: "",
    paid_delivery_radius_km: "",
    delivery_fee: "",
    min_order: "",
  });
  const [hours, setHours] = useState<OpeningHours[]>([]);

  useEffect(() => {
    if (!token) return;
    adminGet<RestaurantSettings>(`${ADMIN}/restaurant/`, token)
      .then((data) => {
        setSettings(data);
        setInfo({
          name: data.name ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          phone_2: data.phone_2 ?? "",
          email: data.email ?? "",
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
        });
        setDelivery({
          is_delivery_enabled: data.is_delivery_enabled ?? true,
          free_delivery_radius_km: data.free_delivery_radius_km ?? "",
          paid_delivery_radius_km: data.paid_delivery_radius_km ?? "",
          delivery_fee: data.delivery_fee ?? "",
          min_order: data.min_order ?? "",
        });
        const sorted = [...(data.opening_hours ?? [])].sort((a, b) => a.day - b.day);
        setHours(sorted);
        // Pre-expand lunch for days that already have lunch times set
        const openMap: Record<number, boolean> = {};
        sorted.forEach((h) => {
          if (h.lunch_open || h.lunch_close) openMap[h.id] = true;
        });
        setLunchOpen(openMap);
      })
      .catch(() => setError("Failed to load restaurant settings."))
      .finally(() => setLoading(false));
  }, [token]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  async function saveInfo() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await adminPatch(`${ADMIN}/restaurant/`, token, info);
      flash("Restaurant info saved.");
    } catch (err) {
      setError((err as Error).message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDelivery() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await adminPatch(`${ADMIN}/restaurant/`, token, delivery);
      flash("Delivery settings saved.");
    } catch (err) {
      setError((err as Error).message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function saveHours() {
    if (!token) return;
    setSavingHours(true);
    setError(null);
    try {
      // Build payload: real rows include their id; new (temp) rows omit it so
      // the backend knows to create them.
      const payload: OpeningHoursPayload[] = hours.map((h) => ({
        ...(isTemp(h.id) ? {} : { id: h.id }),
        day: Number(h.day),           // <select> gives strings; coerce to int
        is_closed: h.is_closed,
        open_time: h.is_closed ? null : (h.open_time || null),
        close_time: h.is_closed ? null : (h.close_time || null),
        lunch_open: h.is_closed ? null : (h.lunch_open || null),
        lunch_close: h.is_closed ? null : (h.lunch_close || null),
      }));

      const response = await adminPut<BulkUpdateResponse>(
        `${ADMIN}/restaurant/hours/`, token, payload
      );

      // If any rows errored, surface them
      if (response.errors && response.errors.length > 0) {
        const msgs = response.errors.map((e) => e.error).join(", ");
        setError(`Some rows failed to save: ${msgs}`);
      }

      // Merge the freshly-saved rows (which now have real DB ids) back into
      // local state so subsequent saves don't re-create them.
      if (response.updated && response.updated.length > 0) {
        setHours((prev) => {
          // Build a lookup of real id → updated record
          const byId = new Map(response.updated.map((r) => [r.id, r]));

          // Replace rows that were returned by the server
          const merged = prev.map((h) => byId.get(h.id) ?? h);

          // Append any created rows whose temp id isn't in prev
          // (shouldn't normally happen, but defensive)
          const existingIds = new Set(prev.map((h) => h.id));
          response.updated.forEach((r) => {
            if (!existingIds.has(r.id)) merged.push(r);
          });

          return merged.sort((a, b) => a.day - b.day);
        });

        // Re-sync lunchOpen keys: old temp ids → new real ids
        setLunchOpen((prev) => {
          const next: Record<number, boolean> = {};
          hours.forEach((h) => {
            const savedRow = response.updated.find(
              (r) => r.day === Number(h.day) && isTemp(h.id)
            );
            const realId = savedRow ? savedRow.id : h.id;
            if (prev[h.id]) next[realId] = true;
          });
          // Also keep existing non-temp entries
          response.updated.forEach((r) => {
            if (prev[r.id]) next[r.id] = prev[r.id];
          });
          return next;
        });

        if (!response.errors?.length) flash("Opening hours saved.");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to save hours.");
    } finally {
      setSavingHours(false);
    }
  }

  function updateHour(idx: number, key: keyof OpeningHours, value: string | boolean | null) {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [key]: value } : h));
  }

  function addDay() {
    const usedDays = new Set(hours.map((h) => Number(h.day)));
    const nextDay = [0, 1, 2, 3, 4, 5, 6].find((d) => !usedDays.has(d)) ?? 0;
    const newEntry: OpeningHours = {
      id: tempId(),
      day: nextDay,
      is_closed: false,
      open_time: "10:00",
      close_time: "22:00",
      lunch_open: null,
      lunch_close: null,
    };
    setHours((prev) => [...prev, newEntry].sort((a, b) => a.day - b.day));
  }

  function removeHour(idx: number) {
    setHours((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleLunch(id: number, enabled: boolean, idx: number) {
    setLunchOpen((prev) => ({ ...prev, [id]: enabled }));
    if (!enabled) {
      updateHour(idx, "lunch_open", null);
      updateHour(idx, "lunch_close", null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const inputCls = "w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-gray-600";
  const labelCls = "block text-gray-400 text-xs mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">✓ {success}</p>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1.5">
        {(["info", "delivery", "hours"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
              tab === t
                ? "bg-amber-500 text-gray-900"
                : "bg-gray-900 border border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {t === "info" ? "Restaurant Info" : t === "delivery" ? "Delivery" : "Opening Hours"}
          </button>
        ))}
      </div>

      {/* ── Tab: Info ── */}
      {tab === "info" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Basic Information</p>
            <div>
              <label className={labelCls}>Restaurant Name</label>
              <input type="text" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input type="text" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone 2 <span className="text-gray-600 text-[10px]">optional</span></label>
                <input type="text" value={info.phone_2} onChange={(e) => setInfo({ ...info, phone_2: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Location Coordinates</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Latitude</label>
                <input type="text" value={info.latitude} onChange={(e) => setInfo({ ...info, latitude: e.target.value })} placeholder="e.g. 60.9827" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Longitude</label>
                <input type="text" value={info.longitude} onChange={(e) => setInfo({ ...info, longitude: e.target.value })} placeholder="e.g. 25.6612" className={inputCls} />
              </div>
            </div>
          </div>

          <button onClick={saveInfo} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all">
            {saving ? <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</> : "Save Info"}
          </button>
        </div>
      )}

      {/* ── Tab: Delivery ── */}
      {tab === "delivery" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Delivery Settings</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Delivery enabled</p>
                <p className="text-gray-500 text-xs">Allow customers to order for delivery</p>
              </div>
              <button
                type="button"
                onClick={() => setDelivery({ ...delivery, is_delivery_enabled: !delivery.is_delivery_enabled })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${delivery.is_delivery_enabled ? "bg-amber-500" : "bg-gray-700"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${delivery.is_delivery_enabled ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Free delivery radius (km)</label>
                <input type="number" step="0.1" min="0" value={delivery.free_delivery_radius_km}
                  onChange={(e) => setDelivery({ ...delivery, free_delivery_radius_km: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max delivery radius (km)</label>
                <input type="number" step="0.1" min="0" value={delivery.paid_delivery_radius_km}
                  onChange={(e) => setDelivery({ ...delivery, paid_delivery_radius_km: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Delivery fee (€)</label>
                <input type="number" step="0.01" min="0" value={delivery.delivery_fee}
                  onChange={(e) => setDelivery({ ...delivery, delivery_fee: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Minimum order (€)</label>
                <input type="number" step="0.01" min="0" value={delivery.min_order}
                  onChange={(e) => setDelivery({ ...delivery, min_order: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
          </div>

          <button onClick={saveDelivery} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all">
            {saving ? <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</> : "Save Delivery Settings"}
          </button>
        </div>
      )}

      {/* ── Tab: Hours ── */}
      {tab === "hours" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Weekly Opening Hours</p>
              <button
                type="button"
                onClick={addDay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-xs font-medium rounded-lg transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Day
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {hours.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-gray-600 text-sm">No opening hours configured.</p>
                  <p className="text-gray-700 text-xs mt-1">Click "Add Day" to get started.</p>
                </div>
              )}

              {hours.map((h, idx) => {
                const hasLunch = !!lunchOpen[h.id];
                const isNew = isTemp(h.id);
                return (
                  <div key={h.id} className="px-5 py-4 space-y-3">

                    {/* ── Day header row ── */}
                    <div className="flex items-center gap-3">
                      {/* Day selector */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <select
                          value={h.day}
                          onChange={(e) => updateHour(idx, "day", e.target.value)}
                          className="bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-colors flex-1 min-w-0"
                        >
                          {DAY_NAMES.map((name, d) => (
                            <option key={d} value={d}>{name}</option>
                          ))}
                        </select>
                        {/* Badge for unsaved new rows */}
                        {isNew && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            New
                          </span>
                        )}
                      </div>

                      {/* Open / Closed toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium ${h.is_closed ? "text-gray-500" : "text-amber-400"}`}>
                          {h.is_closed ? "Closed" : "Open"}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateHour(idx, "is_closed", !h.is_closed)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${!h.is_closed ? "bg-amber-500" : "bg-gray-700"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${!h.is_closed ? "translate-x-4" : "translate-x-1"}`} />
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeHour(idx)}
                        className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove this day"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* ── Times (only when open) ── */}
                    {!h.is_closed && (
                      <div className="space-y-3 pl-0.5">

                        {/* Regular hours */}
                        <div className="bg-gray-800/50 rounded-xl p-3 space-y-2">
                          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">Regular Hours</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Opens</label>
                              <input
                                type="time"
                                value={h.open_time ?? ""}
                                onChange={(e) => updateHour(idx, "open_time", e.target.value)}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Closes</label>
                              <input
                                type="time"
                                value={h.close_time ?? ""}
                                onChange={(e) => updateHour(idx, "close_time", e.target.value)}
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lunch section */}
                        <div className={`rounded-xl border transition-all overflow-hidden ${hasLunch ? "border-amber-500/20 bg-amber-500/5" : "border-white/5 bg-gray-800/30"}`}>
                          {/* Lunch toggle header */}
                          <button
                            type="button"
                            onClick={() => toggleLunch(h.id, !hasLunch, idx)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <svg className={`w-3.5 h-3.5 transition-colors ${hasLunch ? "text-amber-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`text-xs font-semibold uppercase tracking-widest ${hasLunch ? "text-amber-400" : "text-gray-500"}`}>
                                Lunch Hours
                              </span>
                              {!hasLunch && (
                                <span className="text-[10px] text-gray-600 normal-case tracking-normal font-normal">optional</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {hasLunch && (
                                <span className="text-[10px] text-amber-500/70 font-medium">Enabled</span>
                              )}
                              <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${hasLunch ? "bg-amber-500" : "bg-gray-700"}`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasLunch ? "translate-x-3.5" : "translate-x-0.5"}`} />
                              </div>
                            </div>
                          </button>

                          {/* Lunch time inputs */}
                          {hasLunch && (
                            <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>Lunch opens</label>
                                <input
                                  type="time"
                                  value={h.lunch_open ?? ""}
                                  onChange={(e) => updateHour(idx, "lunch_open", e.target.value)}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className={labelCls}>Lunch closes</label>
                                <input
                                  type="time"
                                  value={h.lunch_close ?? ""}
                                  onChange={(e) => updateHour(idx, "lunch_close", e.target.value)}
                                  className={inputCls}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Day — bottom shortcut */}
          <button
            type="button"
            onClick={addDay}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 border border-dashed border-white/10 hover:border-amber-500/30 text-gray-500 hover:text-amber-400 text-sm rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add another day
          </button>

          <button onClick={saveHours} disabled={savingHours}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all">
            {savingHours ? <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</> : "Save Opening Hours"}
          </button>
        </div>
      )}
    </div>
  );
}