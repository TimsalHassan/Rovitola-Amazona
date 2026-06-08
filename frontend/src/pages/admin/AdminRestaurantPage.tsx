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

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Tab = "info" | "delivery" | "hours";

export default function AdminRestaurantPage() {
  const { token } = useAdminAuth();
  const [, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        setHours(
          [...(data.opening_hours ?? [])].sort((a, b) => a.day - b.day)
        );
      })
      .catch(() => setError("Failed to load restaurant settings."))
      .finally(() => setLoading(false));
  }, [token]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
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
      await adminPut(`${ADMIN}/restaurant/hours/`, token, hours);
      flash("Opening hours saved.");
    } catch (err) {
      setError((err as Error).message || "Failed to save hours.");
    } finally {
      setSavingHours(false);
    }
  }

  function updateHour(idx: number, key: keyof OpeningHours, value: string | boolean) {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [key]: value } : h));
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

            {/* Delivery toggle */}
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
            <div className="px-5 py-3 border-b border-white/5">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Weekly Opening Hours</p>
            </div>
            <div className="divide-y divide-white/5">
              {hours.map((h, idx) => (
                <div key={h.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-semibold">{DAY_NAMES[h.day] ?? `Day ${h.day}`}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{h.is_closed ? "Closed" : "Open"}</span>
                      <button
                        type="button"
                        onClick={() => updateHour(idx, "is_closed", !h.is_closed)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${!h.is_closed ? "bg-amber-500" : "bg-gray-700"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${!h.is_closed ? "translate-x-4" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  {!h.is_closed && (
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
                      <div>
                        <label className={labelCls}>Lunch opens <span className="text-gray-600 text-[10px]">optional</span></label>
                        <input
                          type="time"
                          value={h.lunch_open ?? ""}
                          onChange={(e) => updateHour(idx, "lunch_open", e.target.value!)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Lunch closes <span className="text-gray-600 text-[10px]">optional</span></label>
                        <input
                          type="time"
                          value={h.lunch_close ?? ""}
                          onChange={(e) => updateHour(idx, "lunch_close", e.target.value!)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={saveHours} disabled={savingHours}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-xl transition-all">
            {savingHours ? <><span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />Saving…</> : "Save Opening Hours"}
          </button>
        </div>
      )}
    </div>
  );
}
