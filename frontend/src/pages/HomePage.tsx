import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Truck,
  Percent,
  ArrowRight,
  Star,
  Quote,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useMenu } from "../hooks/useMenu";
import { isRestaurantOpen } from "../utils/openingHours";
import { reviewsApi, type Review } from "../api/reviews";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CarouselItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category_name: string;
  image?: string;
  is_on_sale?: boolean;
}

interface ReviewForm {
  rating: number;
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── MenuCarousel ─────────────────────────────────────────────────────────────

function MenuCarousel({ items }: { items: CarouselItem[] }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visible, setVisible] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;
  const maxIndex = Math.max(0, total - visible);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, total - visible)));
  }, [visible, total]);

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, maxIndex)),
    [maxIndex],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 3200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, maxIndex]);

  const gapPx = 16;
  const cardWidth = `calc(${100 / visible}% - ${(gapPx * (visible - 1)) / visible}px)`;

  return (
    <div
      className="relative px-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${gapPx}px`,
            transform: `translateX(calc(-${index * (100 / visible)}% - ${(index * gapPx) / visible}px))`,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/menu/${item.id}`}
              style={{ width: cardWidth, flexShrink: 0 }}
              className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden bg-gray-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                    🍕
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-amber-500/90 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  {item.category_name}
                </span>
                {item.is_on_sale && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full">
                    {t("onSale")}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-gray-900/90 text-amber-400 font-bold text-base px-3 py-1 rounded-xl border border-amber-500/30">
                  €{item.price}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 truncate">
                  {item.name}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                  {item.description}
                </p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
                >
                  {t("order")} <ArrowRight size={12} />
                </Link>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {visible > 1 && (
        <>
          <button
            onClick={prev}
            disabled={index === 0}
            className="absolute -left-4 top-[45%] -translate-y-1/2 w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            disabled={index >= maxIndex}
            className="absolute -right-4 top-[45%] -translate-y-1/2 w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg z-10"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      <div className="flex justify-center gap-1.5 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 h-1.5 bg-amber-500"
                : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ReviewModal ──────────────────────────────────────────────────────────────

interface ReviewModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

function ReviewModal({ onClose, onSubmitted }: ReviewModalProps) {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [form, setForm] = useState<ReviewForm>({ rating: 5, text: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit() {
    if (!form.text.trim() || !token) return;
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.create(form, token);
      setLoading(false);
      setDone(true);
      onSubmitted();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-bold text-lg">{t("leaveReview")}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-white font-semibold">{t("thankYou")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {t("rating")}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    className={`p-1 transition-transform hover:scale-110 ${form.rating >= n ? "text-amber-400" : "text-gray-600"}`}
                  >
                    <Star size={24} className="fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {t("review")}
              </label>
              <textarea
                value={form.text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, text: e.target.value }))
                }
                rows={4}
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors placeholder:text-gray-600"
                placeholder={t("reviewPlaceholder")}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.text.trim()}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { items, isItemsLoading, error } = useMenu();
  const open = isRestaurantOpen();

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (isItemsLoading) {
      setCarouselLoading(true);
      return;
    }

    if (!items.length || error) {
      setCarouselItems([]);
      setCarouselLoading(false);
      return;
    }

    const mapped = items.map((item) => ({
      id: item.id,
      name:
        (language === "fi" ? item.name_fi : item.name) ||
        item.name ||
        item.name_fi ||
        t("unnamedItem"),
      description:
        (language === "fi" ? item.description_fi : item.description) ||
        item.description ||
        item.description_fi ||
        t("unnamedItemDesc"),
      price:
        typeof item.current_price === "number"
          ? item.current_price
          : item.current_price,
      category_name: item.category_name || item.category_slug,
      image: item.image ?? undefined,
      is_on_sale: item.is_on_sale,
    }));

    const shuffled = shuffle(mapped).slice(0, 12);
    setCarouselItems(shuffled);
    setCarouselLoading(false);
  }, [items, isItemsLoading, error, language, t]);

  // Fetch reviews on mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await reviewsApi.getAll();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  function handleReviewSubmitted() {
    // Refresh reviews after submitting
    setReviewsLoading(true);
    reviewsApi
      .getAll()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }

  const features = [
    {
      icon: <Truck size={20} className="text-amber-400" />,
      title: t("fastDelivery"),
      desc: t("fastDeliveryDesc"),
    },
    {
      icon: <Percent size={20} className="text-amber-400" />,
      title: t("discount"),
      desc: t("discountDesc"),
    },
    {
      icon: <Clock size={20} className="text-amber-400" />,
      title: t("deliveryTime"),
      desc: t("deliveryTimeDesc"),
    },
  ];

  return (
    <main className="bg-gray-950 text-white">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-950/50 to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-gray-950/40" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 mb-8">
            <span
              className={`w-2 h-2 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-white/90 text-sm font-medium">
              {open ? t("openNow") : t("closedNow")}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-5 leading-[1.05] tracking-tight">
            Ravintola{" "}
            <span className="text-amber-400 relative">
              Amazona
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-400/40 rounded-full" />
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-2 font-light">
            {t("heroTagline")}
          </p>
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-10">
            <MapPin size={14} />
            <span>Aleksanterinkatu 3, 15110 Lahti</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="group flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 text-base"
            >
              {t("orderNow")}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/menu"
              className="flex items-center gap-2 bg-white/8 backdrop-blur-sm hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/15 text-base"
            >
              {t("viewMenu")}
            </Link>
          </div>

          <div className="mt-16 flex flex-col items-center gap-2 animate-bounce opacity-40">
            <span className="text-xs text-white/60">{t("scrollDown")}</span>
            <div className="w-px h-8 bg-white/30" />
          </div>
        </div>
      </section>

      {/* ── Info strip ────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-gray-900/60">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 md:py-2"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu Carousel ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
                {t("fromMenu")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black">
                {t("popularDishes")}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                {t("newSelectionEveryVisit")}
              </p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors"
            >
              {t("fullMenu")} <ArrowRight size={16} />
            </Link>
          </div>

          {carouselLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-44 bg-gray-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : carouselItems.length ? (
            <MenuCarousel items={carouselItems} />
          ) : (
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-white font-bold text-lg mb-2">
                {t("emptyMenuTitle")}
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                {t("emptyMenuBody")}
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 mt-5 text-amber-400 hover:text-amber-300 font-semibold text-sm"
              >
                {t("fullMenu")} <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm"
            >
              {t("fullMenu")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="h-72 md:h-96 rounded-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1651167/pexels-photo-1651167.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ravintola Amazona"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-4 bg-amber-500 text-gray-900 rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-3xl font-black">14+</p>
                <p className="text-xs font-semibold opacity-80">
                  {t("yearsInLahti")}
                </p>
              </div>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
                {t("aboutUs")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight whitespace-pre-line">
                {t("aboutHeading")}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t("aboutBody")}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: t("menuItems"), value: "100+" },
                  { label: t("categories"), value: "14" },
                  { label: t("delivery"), value: "14km" },
                  { label: t("minOrder"), value: "€13" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/60 rounded-xl p-3 border border-white/5"
                  >
                    <p className="text-xl font-black text-amber-400">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a
                  href="tel:+358037333366"
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <Phone size={14} /> +358 037 333 366
                </a>
                <a
                  href="mailto:info@ravintolaamazona.fi"
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <Mail size={14} /> info@ravintolaamazona.fi
                </a>
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> Aleksanterinkatu 3, 15110 Lahti
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-left mb-10">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              {t("reviewsLabel")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              {t("reviewsHeading")}
            </h2>
          </div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-white/5 rounded-2xl p-5 animate-pulse"
                >
                  <div className="h-4 bg-gray-800 rounded w-8 mb-3" />
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="w-3 h-3 bg-gray-800 rounded-full" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {reviews.slice(0, 3).map((r) => {
                const date = new Date(r.created_at).toLocaleDateString();
                return (
                  <div
                    key={r.id}
                    className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-colors"
                  >
                    <Quote size={20} className="text-amber-400/30 mb-3" />
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={13}
                          className={
                            j < r.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-600"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      "{r.text}"
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-amber-400 font-semibold text-xs">
                        {r.customer_name}
                      </span>
                      <span className="text-gray-600 text-xs">{date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center mb-10">
              <p className="text-gray-400">{t("noReviewsYet")}</p>
            </div>
          )}

          <div className="text-center">
            {user ? (
              <button
                onClick={() => setReviewModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20"
              >
                {t("leaveReview")}
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: "/" }}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg"
              >
                {t("signInToReview")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}

      {/* ── App download ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-900 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
                  {t("mobileApp")}
                </p>
                <h2 className="text-3xl font-black mb-3">{t("orderEasier")}</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {t("downloadDesc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://apps.apple.com/us/app/ravintola-amazona/id6448418434"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-white shrink-0"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-400">
                        {t("downloadOn")}
                      </div>
                      <div className="font-bold text-sm text-white">
                        App Store
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.ravintolaamazona_new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
                      <path
                        d="M3.18 23.76c.3.17.64.21.97.13l12.08-6.98-2.62-2.62-10.43 9.47zM.35 1.18C.13 1.5 0 1.95 0 2.52v18.95c0 .57.13 1.03.36 1.35l.07.07 10.62-10.62v-.25L.42 1.11l-.07.07zM20.69 10.41l-2.9-1.67-2.94 2.94 2.94 2.94 2.91-1.68c.83-.48.83-1.26-.01-1.53zM3.18.24l12.11 6.99-2.62 2.62L2.24.38C2.55.1 2.89.07 3.18.24z"
                        fill="#EA4335"
                      />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-400">
                        {t("downloadOn")}
                      </div>
                      <div className="font-bold text-sm text-white">
                        Google Play
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Opening hours */}
              <div className="bg-gray-900/60 rounded-2xl p-5 border border-white/5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  {t("openingHours")}
                </h3>
                <div className="space-y-1.5 text-xs">
                  {[
                    {
                      day: t("monTue"),
                      hours: "15:00–03:00",
                      lunch: "10:30–14:30",
                    },
                    {
                      day: t("wedSun"),
                      hours: "11:00–03:45",
                      lunch: t("wedFri") + " 10:30–14:30",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-gray-400 w-16">{row.day}</span>
                      <span className="text-white font-medium">
                        {row.hours}
                      </span>
                      <span className="text-amber-400/70 text-right">
                        {row.lunch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {reviewModal && (
        <ReviewModal
          onClose={() => setReviewModal(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </main>
  );
}
