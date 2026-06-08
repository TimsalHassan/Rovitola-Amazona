import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Flame, Tag
} from "lucide-react";
import {
  MenuItem as ApiMenuItem,
  type Category as ApiCategory,
} from "../api/menu";
import { useCart } from "../hooks/useCart";
import { useLanguage } from "../hooks/useLanguage";
import { useMenu } from "../hooks/useMenu";
import { isLunchHours } from "../utils/openingHours";
import { Link } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";

const PAGE_SIZE = 8;

const CATEGORY_ICONS: Record<string, string> = {
  // slugs from DB (underscored, English)
  pizzas: "🍕",
  vegan_pizzas: "🌱",
  new_pizzas: "🍕",
  kebab: "🥙",
  kebabi: "🥙",
  chicken_kebab: "🍗",
  salads: "🥗",
  falafel: "🧆",
  vegan_food: "🥦",
  chicken_fillets: "🍗",
  burger_meals: "🍔",
  chicken_burger_meals: "🍔",
  steaks: "🥩",
  nuggets: "🍟",
  beverages: "🥤",
  // legacy Finnish slugs (kept for safety)
  pizzat: "🍕",
  vegaanipizzat: "🌱",
  kebabit: "🥙",
  kanakebabit: "🍗",
  salaatit: "🥗",
  vegaaniruoka: "🥦",
  kanafileet: "🍗",
  burgerateriat: "🍔",
  kanaburgerateriat: "🍔",
  pihvit: "🥩",
  nugetit: "🍟",
  juomat: "🥤",
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
  const name = getLocalizedText(
    language,
    item.name,
    item.name_fi,
    t("unnamedItem"),
  );
  const description = getLocalizedText(
    language,
    item.description,
    item.description_fi,
    t("unnamedItemDesc"),
  );
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
        <div className="flex md:items-center md:justify-between md:flex-row flex-col gap-2 pt-3 border-t border-white/5">
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
            <span className="flex items-center justify-center gap-1.5 bg-amber-500 group-hover:bg-amber-400 text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors">
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
        <p className="text-gray-500 text-sm font-medium">
          {t("menu.emptyTitle")}
        </p>
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
    <div className="relative bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
      {/* Blurred content */}
      <div className="flex gap-4 p-4 opacity-40 blur-[1px] select-none pointer-events-none">
        {item.image ? (
          <img src={item.image} alt={name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
        ) : (
          <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 text-gray-600">🍕</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{description}</p>
          <div className="mt-3">
            <span className="text-amber-400 font-bold">€{price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Overlay badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-gray-950/80 border border-white/10 px-4 py-2 rounded-full">
          <Clock size={14} className="text-gray-400" />
          <p className="text-gray-300 text-xs font-medium">{t("menu.lunchUnavailable")}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Deals banner ─────────────────────────────────────────────────────────────

function DealsBanner({ items }: { items: ApiMenuItem[] }) {
  const { language } = useLanguage();

  // Collect unique categories that have a deal label
  const dealCategories = useMemo(() => {
    const seen = new Set<number>();
    const result: { id: number; name: string; label: string }[] = [];
    for (const item of items) {
      if (item.category_has_deal && item.category_deal_label && !seen.has(item.category as number)) {
        seen.add(item.category as number);
        result.push({
          id: item.category as number,
          name: item.category_name,
          label: item.category_deal_label,
        });
      }
    }
    return result;
  }, [items]);

  // Sale items to spotlight
  const saleItems = useMemo(
    () => items.filter((i) => i.is_on_sale).slice(0, 6),
    [items],
  );

  if (!dealCategories.length && !saleItems.length) return null;

  return (
    <div className="mb-8 space-y-4">
      {/* Category deal labels */}
      {dealCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dealCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <Tag size={11} />
              {cat.name}: {cat.label}
            </span>
          ))}
        </div>
      )}

      {/* Sale items strip */}
      {saleItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={15} className="text-amber-400" />
            <p className="text-amber-400 text-sm font-bold uppercase tracking-wider">
              Special Deals
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {saleItems.map((item) => {
              const name = getLocalizedText(
                language,
                item.name,
                item.name_fi,
                "Item",
              );
              const base = toNumber(item.base_price);
              const current = toNumber(item.current_price);
              const savePct = base > 0 ? Math.round(((base - current) / base) * 100) : 0;

              return (
                <Link
                  key={item.id}
                  to={`/menu/${item.id}`}
                  className="flex-shrink-0 flex items-center gap-3 bg-gray-900 border border-amber-500/20 hover:border-amber-500/50 rounded-xl px-3 py-2.5 transition-colors group"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg shrink-0">
                      🍽️
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate max-w-[120px] group-hover:text-amber-400 transition-colors">
                      {name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-gray-500 text-[10px] line-through">
                        €{base.toFixed(2)}
                      </span>
                      <span className="text-amber-400 text-xs font-bold">
                        €{current.toFixed(2)}
                      </span>
                      {savePct > 0 && (
                        <span className="text-[9px] font-bold bg-amber-500 text-gray-900 px-1 py-0.5 rounded-full">
                          -{savePct}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
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
  const [visibleByCategory, setVisibleByCategory] = useState<
    Record<string, number>
  >({});

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleSectionsRef = useRef<Set<string>>(new Set());
  const isScrollingRef = useRef(false);

  const isLunch = isLunchHours();
  const { info } = useRestaurant();

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const lunchItems = useMemo(
    () => items.filter((item) => item.is_lunch_item),
    [items],
  );

  // Derive lunch hours string from opening_hours
  const lunchHoursText = useMemo(() => {
    if (!info?.opening_hours) return t("menu.lunchHours"); // fallback to translation

    const days = info.opening_hours.filter(
      (row) => !row.is_closed && row.lunch_open && row.lunch_close
    );

    if (!days.length) return t("menu.lunchHours");

    // Group consecutive days with same hours
    const formatTime = (t: string) => t.slice(0, 5); // "10:30:00" → "10:30"
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const time = `${formatTime(firstDay.lunch_open!)} – ${formatTime(firstDay.lunch_close!)}`;

    // Capitalize day names
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const dayRange =
      days.length === 1
        ? capitalize(firstDay.day)
        : `${capitalize(firstDay.day)} – ${capitalize(lastDay.day)}`;

    return `${dayRange}  ${time}`;
  }, [info, t]);

  useEffect(() => {
    if (!sortedCategories.length) return;
    setActiveCategory((prev) => {
      const exists = sortedCategories.some(
        (cat) => getCategoryKey(cat) === prev,
      );
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

  useEffect(() => {
    observerRef.current?.disconnect();
    // WITH this:
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        // Collect all currently-intersecting sections and pick the topmost one
        entries.forEach((entry) => {
          const key = entry.target.id.replace("cat-", "");
          if (entry.isIntersecting) {
            visibleSectionsRef.current.add(key);
          } else {
            visibleSectionsRef.current.delete(key);
          }
        });

        if (visibleSectionsRef.current.size === 0) return;

        // Pick the category whose section is closest to the top of the viewport
        const topmost = sortedCategories
          .map((cat) => getCategoryKey(cat))
          .find((key) => visibleSectionsRef.current.has(key));

        if (topmost) setActiveCategory(topmost);
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 },
    );
    sortedCategories.forEach((cat) => {
      const key = getCategoryKey(cat);
      const el = categoryRefs.current[key];
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [tab, sortedCategories]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById("cat-" + id);
    if (!el) return;
    isScrollingRef.current = true;
    setActiveCategory(id);
    window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });
    // Unblock after scroll animation completes (~600ms for smooth scroll)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  const skeletons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      {/* Tab header */}
      <div className="pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t("menu.title")}
          </h1>
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

      {/* Main menu tab */}
      {tab === "main" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block col-span-1">
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
            <div className="space-y-10 lg:col-start-2 col-span-3">
              {!isItemsLoading && <DealsBanner items={items} />}

              {isItemsLoading ? (
                skeletons
              ) : !sortedCategories.length ? (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
                  <div className="text-3xl mb-3">🍽️</div>
                  <h2 className="text-xl font-bold mb-2">
                    {t("menu.noItemsTitle")}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {t("menu.noItemsBody")}
                  </p>
                </div>
              ) : (
                sortedCategories.map((cat) => {
                  const key = getCategoryKey(cat);
                  const icon = CATEGORY_ICONS[cat.slug] ?? "🍽️";

                  // ── FIX: coerce both sides to Number before comparing ──────
                  // item.category comes from the API as a number or string depending
                  // on the serializer. cat.id is always a number. Using == (loose)
                  // or explicit Number() conversion handles both cases safely.
                  const categoryItems = items.filter((item) => {
                    return (
                      Number(item.category) === Number(cat.id) &&
                      !item.is_lunch_item
                    );
                  });

                  const visibleCount = visibleByCategory[key] ?? PAGE_SIZE;
                  const visibleItems = categoryItems.slice(0, visibleCount);

                  return (
                    <section
                      key={key}
                      id={`cat-${key}`}
                      ref={(el) => {
                        categoryRefs.current[key] = el;
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{icon}</span>
                        <h2 className="text-xl font-bold text-white">
                          {cat.name}
                        </h2>
                        <span className="text-gray-600 text-sm ml-1">
                          ({categoryItems.length})
                        </span>
                      </div>

                      {categoryItems.length ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {visibleItems.map((item) => (
                              <ItemCard key={item.id} item={item} />
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
                              {t("menu.loadMore")} (
                              {categoryItems.length - visibleCount}{" "}
                              {t("menu.remaining")})
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

      {/* Lunch tab */}
      {tab === "lunch" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-400 font-semibold">
              {t("menu.lunchAvailable")}
            </p>
            {/* ✅ Dynamic from API instead of hardcoded translation string */}
            <p className="text-gray-400 text-sm">{lunchHoursText}</p>
          </div>

          {isItemsLoading ? (
            skeletons
          ) : lunchItems.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lunchItems.map((item) =>
                isLunch ? (
                  <ItemCard key={item.id} item={item} />
                ) : (
                  <LunchUnavailableCard key={item.id} item={item} />
                ),
              )}
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3">🍽️</div>
              <h2 className="text-xl font-bold mb-2">
                {t("menu.noItemsTitle")}
              </h2>
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
      <Link
        to="/cart"
        className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-3 rounded-2xl shadow-xl transition-colors"
      >
        <ShoppingCart size={18} />
        {t("menu.cart")} • {totalItems}
        <span className="bg-gray-900/20 px-2 py-0.5 rounded-lg text-sm">
          €{subtotal.toFixed(2)}
        </span>
      </Link>
    </div>
  );
}
