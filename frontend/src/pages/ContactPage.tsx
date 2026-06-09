import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useRestaurant } from "../context/RestaurantContext";
import { BASE } from "../api/base";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";

function formatTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "general",
  message: "",
};

export default function ContactPage() {
  const { t } = useLanguage();
  const { info } = useRestaurant();
  const { addToast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const firstError = Object.values(data)[0];
        setError(
          Array.isArray(firstError) ? firstError[0] : String(firstError),
        );
        return;
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
      addToast({ type: "success", title: "Message sent!", duration: 3000 });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-10 pb-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {t("contact.title")}
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Form ────────────────────────────────────────────────────── */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">
              {t("contact.sendMessageTitle")}
            </h2>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <p className="text-white font-semibold">
                  {t("contact.messageSentTitle")}
                </p>
                <p className="text-gray-400 text-sm">
                  {t("contact.messageSentBody")}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  {t("contact.sendAnother") ?? "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {t("contact.fullNameLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {t("contact.emailLabel")}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {t("contact.phoneLabel")}
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {t("contact.subjectLabel")}
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                  >
                    <option value="general">
                      {t("contact.subjectGeneral")}
                    </option>
                    <option value="order">
                      {t("contact.subjectOrderIssue")}
                    </option>
                    <option value="feedback">
                      {t("contact.subjectFeedback")}
                    </option>
                    <option value="partnership">
                      {t("contact.subjectPartnership")}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {t("contact.messageLabel")}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                      {t("contact.sending") ?? "Sending…"}
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      {t("contact.sendMessageButton")}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Info ────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">
                {t("contact.restaurantInfoTitle")}
              </h2>
              <div className="space-y-4 text-sm">
                {info?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {t("contact.addressLabel")}
                      </p>
                      <p className="text-gray-400">{info.address}</p>
                    </div>
                  </div>
                )}
                {(info?.phone || info?.phone_2) && (
                  <div className="flex items-start gap-3">
                    <Phone
                      size={18}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {t("contact.phoneLabel")}
                      </p>
                      {info.phone && (
                        <Link
                          to={`tel:${info.phone}`}
                          className="text-gray-400 hover:text-amber-400 block transition-colors"
                        >
                          {info.phone}
                        </Link>
                      )}
                      {info.phone_2 && (
                        <Link
                          to={`tel:${info.phone_2}`}
                          className="text-gray-400 hover:text-amber-400 block transition-colors"
                        >
                          {info.phone_2}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                {info?.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-white font-medium">
                        {t("contact.emailLabel")}
                      </p>
                      <Link
                        to={`mailto:${info.email}`}
                        className="text-gray-400 hover:text-amber-400 transition-colors"
                      >
                        {info.email}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                {t("contact.openingHoursTitle")}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {info?.opening_hours.map((row) => (
                    <tr
                      key={row.day}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-2 text-gray-400 capitalize">
                        {t(`footer.days.${row.day}`)}
                      </td>
                      <td className="py-2 text-gray-300 text-right">
                        {row.is_closed ? (
                          <span className="text-red-400">
                            {t("contact.closed") ?? "Closed"}
                          </span>
                        ) : (
                          `${formatTime(row.open_time)} – ${formatTime(row.close_time)}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {info?.opening_hours.some((h) => h.lunch_open) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-amber-400 text-xs font-medium">
                    {t("contact.lunchLabel")}{" "}
                    {(() => {
                      const d = info.opening_hours.find((h) => h.lunch_open);
                      return d
                        ? `${formatTime(d.lunch_open)} – ${formatTime(d.lunch_close)}`
                        : "";
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-gray-900 mt-4 border border-white/5 rounded-2xl h-96 overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1935.3203894971946!2d25.649473677392145!3d60.98328257754948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x468e2854093965db%3A0xd11ee9ad95e079f8!2sAmazona%20Pizzeria!5e0!3m2!1sen!2s!4v1780817453165!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </main>
  );
}
