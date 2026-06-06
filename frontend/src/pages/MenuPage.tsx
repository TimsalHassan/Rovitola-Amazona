import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ShoppingBag, ShoppingCart, UtensilsCrossed } from "lucide-react";
import {
  MenuItem as ApiMenuItem,
  type Category as ApiCategory,
} from "../api/menu";
import { useCart } from "../hooks/useCart";
import { useLanguage } from "../hooks/useLanguage";
import { useMenu } from "../hooks/useMenu";
import { isLunchHours } from "../utils/openingHours";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

const CATEGORY_ICONS: Record<string, string> = {
  burgerateriat: "🍔",
  burgers: "🍔",
  desserts: "🍰",
  drinks: "🥤",
  falafel: "🧆",
  juomat: "🥤",
  kanafileet: "🍗",
  kanaburgerateriat: "🍔",
  kanakebabit: "🍗",
  kebab: "🥙",
  kebabit: "🥙",
  nugetit: "🍟",
  pihvit: "🥩",
  pizza: "🍕",
  pizzat: "🍕",
  salaatti: "🥗",
  salaatit: "🥗",
  vegaanipizzat: "🌱",
  vegaaniruoka: "🥦",
};

const getCategoryKey = (category: ApiCategory) =>
  category.slug || String(category.id);

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getLocalizedText = (
  language: string,
  en: string,
  fi: string,
  fallback: string,
) => {
  const preferred = language === "fi" ? fi : en;
  return preferred || en || fi || fallback;
};

// ─── Item card ────────────────────────────────────────────────────────────────

export function ItemCard({ item }: { item: ApiMenuItem }) {
  const { language, t } = useLanguage();
  const name = getLocalizedText(language, item.name, item.name_fi, t("unnamedItem"));
  const description = getLocalizedText(language, item.description, item.description_fi, t("unnamedItemDesc"));
  const price = toNumber(item.current_price);
  const basePrice = toNumber(item.base_price);
 
  return (
    <Link
      to={`/menu/${item.id}`}
      className="group relative flex flex-col bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.15)] transition-all duration-200"
    >
      {/* Image / placeholder */}
      <div className="relative w-full aspect-[16/9] bg-gray-800 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-700">
            🍽️
          </div>
        )}
 
        {/* Sale badge */}
        {item.is_on_sale && (
          <span className="absolute top-2.5 left-2.5 bg-amber-500 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Sale
          </span>
        )}
 
        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center">
            <span className="text-gray-400 text-xs font-semibold bg-gray-900/80 px-3 py-1.5 rounded-full border border-white/10">
              {t("menu.unavailable")}
            </span>
          </div>
        )}
      </div>
 
      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
            {name}
          </h3>
          {description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
 
        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-baseline gap-1.5">
            {item.is_on_sale && (
              <span className="text-gray-600 text-xs line-through">
                €{basePrice.toFixed(2)}
              </span>
            )}
            <span className="text-amber-400 font-bold text-base">
              €{price.toFixed(2)}
            </span>
          </div>
 
          {item.is_available ? (
            <span className="flex items-center gap-1.5 bg-amber-500 group-hover:bg-amber-400 text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors">
              <ShoppingBag size={13} />
              {t("menu.add")}
            </span>
          ) : (
            <span className="text-gray-600 text-xs">
              {t("menu.unavailable")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Empty card ───────────────────────────────────────────────────────────────

function EmptyCard() {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl p-6 flex items-center gap-4 opacity-60">
      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
        <UtensilsCrossed size={24} className="text-gray-600" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{t("menu.emptyTitle")}</p>
        <p className="text-gray-600 text-xs mt-1">{t("menu.emptyBody")}</p>
      </div>
    </div>
  );
}

// ─── Lunch unavailable card ───────────────────────────────────────────────────

function LunchUnavailableCard({ item }: { item: ApiMenuItem }) {
  const { language, t } = useLanguage();
  const name = getLocalizedText(language, item.name, item.name_fi, t("unnamedItem"));
  const description = getLocalizedText(language, item.description, item.description_fi, t("unnamedItemDesc"));
  const price = toNumber(item.current_price);

  return (
    <div className="relative bg-gray-900 border border-white/5 rounded-xl p-4 opacity-70">
      <div className="absolute inset-0 bg-gray-950/60 rounded-xl flex items-center justify-center z-10">
        <div className="text-center px-4">
          <Clock size={20} className="text-gray-500 mx-auto mb-1" />
          <p className="text-gray-400 text-xs">{t("menu.lunchUnavailable")}</p>
        </div>
      </div>
      <div className="flex gap-4 opacity-40">
        {item.image ? (
          <img src={item.image} alt={name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
        ) : (
          <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 text-gray-600">
            🍕
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
          <p className="text-gray-400 text-xs mt-1">{description}</p>
          <div className="mt-3">
            <span className="text-amber-400 font-bold">€{price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ItemSkeleton() {
  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-800 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-4/5" />
          <div className="h-6 bg-gray-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const { t } = useLanguage();
  const { items, isItemsLoading, categories } = useMenu();
  const [tab, setTab] = useState<"main" | "lunch">("main");
  const [activeCategory, setActiveCategory] = useState("");
  const [visibleByCategory, setVisibleByCategory] = useState<Record<string, number>>({});

  // Refs for IntersectionObserver
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Suppress observer updates while user is clicking sidebar (prevents flicker)
  const isScrollingRef = useRef(false);

  const isLunch = isLunchHours();

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const lunchItems = useMemo(
    () => items.filter((item) => item.is_lunch_item),
    [items],
  );

  // Initialise active category and visible counts when categories load
  useEffect(() => {
    if (!sortedCategories.length) return;
    setActiveCategory((prev) => {
      const exists = sortedCategories.some((cat) => getCategoryKey(cat) === prev);
      return exists ? prev : getCategoryKey(sortedCategories[0]);
    });
    setVisibleByCategory((prev) => {
      const next = { ...prev };
      sortedCategories.forEach((cat) => {
        const key = getCategoryKey(cat);
        if (!next[key]) next[key] = PAGE_SIZE;
      });
      return next;
    });
  }, [sortedCategories]);

  // Set up IntersectionObserver to track which category section is in view
  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Ignore observer events while a sidebar click is driving the scroll
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        });
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );

    sortedCategories.forEach((cat) => {
      const key = getCategoryKey(cat);
      const el = categoryRefs.current[key];
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [tab, sortedCategories]);

  // Scroll to category section and immediately set active (no observer lag)
  const scrollToCategory = (id: string) => {
    const el = document.getElementById("cat-" + id);
    if (!el) return;

    // Mark that we're programmatically scrolling so observer doesn't fight us
    isScrollingRef.current = true;
    setActiveCategory(id);

    window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });

    // Re-enable observer after scroll animation completes (~600ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 700);
  };

  // ── Shared skeletons ───────────────────────────────────────────────────────

  const skeletons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => <ItemSkeleton key={i} />)}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      {/* ── Tab header ──────────────────────────────────────────────────── */}
      <div className="pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-4">{t("menu.title")}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("main")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "main"
                  ? "bg-amber-500 text-gray-900"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("menu.mainTab")}
            </button>
            <button
              onClick={() => setTab("lunch")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "lunch"
                  ? "bg-amber-500 text-gray-900"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("menu.lunchTab")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main menu tab ────────────────────────────────────────────────── */}
      {tab === "main" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-gray-900 border border-white/5 rounded-xl p-2 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <nav className="space-y-0.5">
                  {sortedCategories.map((cat) => {
                    const key = getCategoryKey(cat);
                    const icon = CATEGORY_ICONS[cat.slug] ?? "🍽️";
                    const isActive = activeCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => scrollToCategory(key)}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-amber-500 text-gray-900"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="text-base leading-none">{icon}</span>
                        <span className="truncate">{cat.name}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Mobile horizontal category scroller */}
            <div
              className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4"
              style={{ scrollbarWidth: "none" }}
            >
              {sortedCategories.map((cat) => {
                const key = getCategoryKey(cat);
                const icon = CATEGORY_ICONS[cat.slug] ?? "🍽️";
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => scrollToCategory(key)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-gray-900"
                        : "bg-gray-800 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Category sections */}
            <div className="space-y-10 lg:col-start-2">
              {isItemsLoading ? (
                skeletons
              ) : !sortedCategories.length ? (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
                  <div className="text-3xl mb-3">🍽️</div>
                  <h2 className="text-xl font-bold mb-2">{t("menu.noItemsTitle")}</h2>
                  <p className="text-gray-400 text-sm">{t("menu.noItemsBody")}</p>
                </div>
              ) : (
                sortedCategories.map((cat) => {
                  const key = getCategoryKey(cat);
                  const icon = CATEGORY_ICONS[cat.slug] ?? "🍽️";
                  const categoryItems = items.filter(
                    (item) => item.category === cat.id && !item.is_lunch_item,
                  );
                  const visibleCount = visibleByCategory[key] ?? PAGE_SIZE;
                  const visibleItems = categoryItems.slice(0, visibleCount);

                  return (
                    <section
                      key={key}
                      id={`cat-${key}`}
                      ref={(el) => { categoryRefs.current[key] = el; }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{icon}</span>
                        <h2 className="text-xl font-bold text-white">{cat.name}</h2>
                        <span className="text-gray-600 text-sm ml-1">
                          ({categoryItems.length})
                        </span>
                      </div>

                      {categoryItems.length ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {visibleItems.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                              />
                            ))}
                          </div>
                          {categoryItems.length > visibleCount && (
                            <button
                              onClick={() =>
                                setVisibleByCategory((prev) => ({
                                  ...prev,
                                  [key]: (prev[key] ?? PAGE_SIZE) + PAGE_SIZE,
                                }))
                              }
                              className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                            >
                              {t("menu.loadMore")} ({categoryItems.length - visibleCount} {t("menu.remaining")})
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <EmptyCard />
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lunch tab ────────────────────────────────────────────────────── */}
      {tab === "lunch" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-400 font-semibold">{t("menu.lunchAvailable")}</p>
            <p className="text-gray-400 text-sm">{t("menu.lunchHours")}</p>
          </div>

          {isItemsLoading ? (
            skeletons
          ) : lunchItems.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lunchItems.map((item) =>
                isLunch ? (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ) : (
                  <LunchUnavailableCard key={item.id} item={item} />
                ),
              )}
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3">🍽️</div>
              <h2 className="text-xl font-bold mb-2">{t("menu.noItemsTitle")}</h2>
              <p className="text-gray-400 text-sm">{t("menu.noItemsBody")}</p>
            </div>
          )}
        </div>
      )}

      <CartFAB />
    </main>
  );
}

function CartFAB() {
  const { totalItems, subtotal } = useCart();
  const { t } = useLanguage();
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <a
        href="/cart"
        className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-3 rounded-2xl shadow-xl transition-colors"
      >
        <ShoppingCart size={18} />
        {t("menu.cart")} • {totalItems}
        <span className="bg-gray-900/20 px-2 py-0.5 rounded-lg text-sm">
          €{subtotal.toFixed(2)}
        </span>
      </a>
    </div>
  );
}