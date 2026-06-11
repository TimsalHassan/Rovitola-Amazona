import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { useRestaurant } from "../context/RestaurantContext";
import { reviewsApi, type Review } from "../api/reviews";
import { motion, useMotionValue, animate as motionAnimate } from "motion/react";
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

function MenuCarousel({ items }: { items: CarouselItem[] }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isSnapping = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = items.length;
  const gapPx = 16;

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

  // Shuffle on mount — new random order every page visit
  const shuffledItems = useMemo(() => shuffle([...items]), [items]);

  const cloned = useMemo(
    () => [
      ...shuffledItems.slice(total - visible),
      ...shuffledItems,
      ...shuffledItems.slice(0, visible),
    ],
    [shuffledItems, visible, total],
  );

  const cardWidthPercent = 100 / visible;
  const cardWidthPx = `calc(${cardWidthPercent}% - ${(gapPx * (visible - 1)) / visible}px)`;

  const x = useMotionValue(0);

  // Per-card pixel width from DOM for accurate 1-card scroll
  const getCardPxWidth = useCallback(() => {
    if (!trackRef.current) return 0;
    const card = trackRef.current.children[0] as HTMLElement;
    if (!card) return 0;
    return card.offsetWidth + gapPx;
  }, []);

  const getTargetX = useCallback(
    (idx: number) => {
      const cardPx = getCardPxWidth();
      if (cardPx > 0) {
        // Pixel-based: move exactly one card width per step
        return -(visible + idx) * cardPx;
      }
      // Fallback to percent-based
      return -(visible + idx) * cardWidthPercent;
    },
    [visible, cardWidthPercent, getCardPxWidth],
  );

  const snapTo = useCallback(
    (idx: number, animate = true) => {
      const target = getTargetX(idx);
      if (animate) {
        motionAnimate(x, target, {
          type: "tween",
          duration: 0.35,
          ease: [0.25, 0.1, 0.25, 1],
        });
      } else {
        x.set(target);
      }
    },
    [x, getTargetX],
  );

  useEffect(() => {
    snapTo(index, false);
  }, [visible, snapTo, index]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      snapTo(next);
    },
    [snapTo],
  );

  useEffect(() => {
    const unsub = x.on("animationComplete", () => {
      if (isSnapping.current) return;
      if (index >= total) {
        isSnapping.current = true;
        const wrapped = index - total;
        setIndex(wrapped);
        x.set(getTargetX(wrapped));
        isSnapping.current = false;
      } else if (index < 0) {
        isSnapping.current = true;
        const wrapped = index + total;
        setIndex(wrapped);
        x.set(getTargetX(wrapped));
        isSnapping.current = false;
      }
    });
    return unsub;
  }, [index, total, x, getTargetX]);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 3200);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const realIndex = ((index % total) + total) % total;
  const dotCount = Math.ceil(total / visible);

  return (
    <div
      className="relative px-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex"
          style={{ x, gap: `${gapPx}px` }}
        >
          {cloned.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              to={`/menu/${item.id}`}
              style={{ width: cardWidthPx, flexShrink: 0 }}
              className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-colors duration-300"
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
                <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  {t("order")} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>

      <button
        onClick={prev}
        className="absolute -left-4 top-[45%] -translate-y-1/2 w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg z-10"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute -right-4 top-[45%] -translate-y-1/2 w-9 h-9 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg z-10"
      >
        <ChevronRight size={18} />
      </button>

      <div className="flex justify-center gap-1.5 mt-6">
        {Array.from({ length: dotCount }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i * visible)}
            animate={{
              width: Math.floor(realIndex / visible) === i ? 24 : 6,
              backgroundColor:
                Math.floor(realIndex / visible) === i
                  ? "#f59e0b"
                  : "rgba(255,255,255,0.2)",
            }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="h-1.5 rounded-full"
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
  const {
    info,
    isLoading: restaurantLoading,
    isOpen,
    openStatusMessage,
    deliveryFee,
    minOrder,
    freeDeliveryRadius,
    paidDeliveryRadius,
  } = useRestaurant();

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
      price: item.current_price,
      category_name: item.category_name || item.category_slug,
      image: item.image ?? undefined,
      is_on_sale: item.is_on_sale,
    }));

    setCarouselItems(mapped.slice(0, 12));
    setCarouselLoading(false);
  }, [items, isItemsLoading, error, language, t]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await reviewsApi.getAll();
        setReviews(data.results);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  function handleReviewSubmitted() {
    setReviewsLoading(true);
    reviewsApi
      .getAll()
      .then((data) => setReviews(data.results))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }
  const features = [
    {
      icon: <Truck size={20} className="text-amber-400" />,
      title: t("fastDelivery"),
      desc: restaurantLoading
        ? "..."
        : t("fastDeliveryDesc", {
            freeKm: freeDeliveryRadius,
            fee: deliveryFee,
          }),
    },
    {
      icon: <Percent size={20} className="text-amber-400" />,
      title: t("discount"),
      desc: t("discountDesc"),
    },
    {
      icon: <Clock size={20} className="text-amber-400" />,
      title: t("deliveryTime"),
      desc: restaurantLoading
        ? "..."
        : t("deliveryTimeDesc", {
            minOrder,
            paidKm: paidDeliveryRadius,
          }),
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
              className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-white/90 text-sm font-medium">
              {restaurantLoading
                ? "..."
                : openStatusMessage || (isOpen ? t("openNow") : t("closedNow"))}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-5 leading-[1.05] tracking-tight">
            {info?.name?.split(" ")[0] ?? "Ravintola"}{" "}
            <span className="text-amber-400 relative">
              {info?.name?.split(" ").slice(1).join(" ") ?? "Amazona"}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-400/40 rounded-full" />
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-2 font-light">
            {t("heroTagline")}
          </p>
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-10">
            <MapPin size={14} />
            <span>{info?.address ?? "Aleksanterinkatu 3, 15110 Lahti"}</span>
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
                  alt={info?.name ?? "Ravintola Amazona"}
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
                  {
                    label: t("delivery"),
                    value: info ? `${info.paid_delivery_radius_km}km` : "14km",
                  },
                  {
                    label: t("minOrder"),
                    value: info ? `€${minOrder}` : "€13",
                  },
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
                {info?.phone && (
                  <Link
                    to={`tel:${info.phone}`}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    <Phone size={14} /> {info.phone}
                  </Link>
                )}
                {info?.phone_2 && (
                  <Link
                    to={`tel:${info.phone_2}`}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    <Phone size={14} /> {info.phone_2}
                  </Link>
                )}
                {info?.email && (
                  <Link
                    to={`mailto:${info.email}`}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    <Mail size={14} /> {info.email}
                  </Link>
                )}
                {info?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> {info.address}
                  </div>
                )}
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
                      <div
                        key={j}
                        className="w-3 h-3 bg-gray-800 rounded-full"
                      />
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
              {reviews.slice(0, 3).map((r) => (
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
                    <span className="text-gray-600 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
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

      {reviewModal && (
        <ReviewModal
          onClose={() => setReviewModal(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </main>
  );
}
