import { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MenuItem } from "../api/menu";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useMenu } from "../hooks/useMenu";

function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isFinite(num)) return num.toFixed(2);
  return String(value);
}

const MenuItemPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { items, isItemsLoading } = useMenu();
  const [item, setItem] = useState<MenuItem | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const foundItem = items.find((item) => item.id === Number(id));
    setItem(foundItem || null);
  }, [id, items]);

  const getLocalizedText = (
    en: string,
    fi: string,
    fallback: string,
  ) => {
    const preferred = language === "fi" ? fi : en;
    return preferred || en || fi || fallback;
  };

  const displayName = item
    ? getLocalizedText(item.name, item.name_fi, t("unnamedItem"))
    : "";
  const displayDescription = item
    ? getLocalizedText(item.description, item.description_fi, t("unnamedItemDesc"))
    : "";
  const displayCategory = item?.category_name || item?.category_slug || t("menuItem.uncategorized");

  const reviews = [
    { name: "Mikko P.", rating: 5, text: t("review1"), date: "15.5.2024" },
    { name: "Anna K.", rating: 5, text: t("review2"), date: "10.5.2024" },
    { name: "Juhani V.", rating: 4, text: t("review3"), date: "3.5.2024" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft size={16} /> {t("menuItem.backToMenu")}
        </Link>

        {isItemsLoading && !item ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-80 bg-gray-900/60 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-32 bg-gray-900/60 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-900/60 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-900/60 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-900/60 rounded animate-pulse" />
              <div className="h-8 w-40 bg-gray-900/60 rounded animate-pulse" />
            </div>
          </div>
        ) : !item ? (
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-10 text-center">
            <div className="text-3xl mb-3">🍽️</div>
            <h2 className="text-xl font-bold mb-2">{t("menuItem.notFoundTitle")}</h2>
            <p className="text-gray-400 text-sm">{t("menuItem.notFoundBody")}</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 mt-5 text-amber-400 hover:text-amber-300 font-semibold text-sm"
            >
              {t("menuItem.backToMenu")} <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <>
            <section className="grid gap-8 lg:grid-cols-2 items-start">
              <div className="relative bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={displayName}
                    className="w-full h-[360px] object-contain bg-gray-950/40"
                  />
                ) : (
                  <div className="w-full h-[360px] flex items-center justify-center text-4xl text-gray-600">
                    🍕
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-amber-500/90 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
                    {displayCategory}
                  </span>
                  {item.is_on_sale && (
                    <span className="bg-amber-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full">
                      {t("onSale")}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-amber-400 text-xs uppercase tracking-widest">
                    {t("menuItem.details")}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-black">
                    {displayName}
                  </h1>
                  <p className="text-gray-300 leading-relaxed">
                    {displayDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.is_on_sale && (
                    <span className="text-gray-500 line-through">
                      €{formatPrice(item.base_price)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-amber-400">
                    €{formatPrice(item.current_price)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {item.is_lunch_item && (
                    <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {t("menuItem.lunchItem")}
                    </span>
                  )}
                  {item.is_available ? (
                    <span className="bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full">
                      {t("menuItem.available")}
                    </span>
                  ) : (
                    <span className="bg-red-500/10 text-red-300 border border-red-500/20 px-2.5 py-1 rounded-full">
                      {t("menuItem.unavailable")}
                    </span>
                  )}
                </div>
                <div>
                  <button>
                    {t("addToCart")} - €{formatPrice(item.current_price)}
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
                    {t("menuItem.extrasTitle")}
                  </p>
                  <h2 className="text-2xl font-black mt-1">
                    {t("menuItem.extrasSubtitle")}
                  </h2>
                </div>
              </div>

              {item.extras.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {item.extras.map((extra) => {
                    const extraName = getLocalizedText(
                      extra.name,
                      extra.name_fi,
                      t("menuItem.unnamedExtra"),
                    );
                    const typeLabel =
                      extra.extra_type === "choice"
                        ? t("menuItem.choice")
                        : t("menuItem.addon");
                    const selectionLabel = extra.is_required
                      ? t("menuItem.required")
                      : t("menuItem.optional");
                    const maxLabel =
                      extra.max_selections !== null
                        ? t("menuItem.maxSelections", {
                            count: extra.max_selections,
                          })
                        : null;

                    return (
                      <div
                        key={extra.id}
                        className="bg-gray-900/60 border border-white/10 rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-white font-semibold">
                              {extraName}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {typeLabel} • {selectionLabel}
                              {maxLabel ? ` • ${maxLabel}` : ""}
                            </p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wide bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-300">
                            {selectionLabel}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          {extra.options.map((option) => {
                            const optionName = getLocalizedText(
                              option.name,
                              option.name_fi,
                              t("menuItem.unnamedOption"),
                            );
                            const optionPrice = Number(option.additional_price);
                            const priceLabel = Number.isFinite(optionPrice)
                              ? optionPrice === 0
                                ? t("menuItem.included")
                                : `+€${formatPrice(optionPrice)}`
                              : t("menuItem.included");

                            return (
                              <div
                                key={option.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-200">
                                  {optionName}
                                </span>
                                <span className="text-gray-400">
                                  {priceLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white font-semibold mb-2">
                    {t("menuItem.noExtrasTitle")}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {t("menuItem.noExtrasBody")}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-12">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
                    {t("menuItem.reviewsTitle")}
                  </p>
                  <h2 className="text-2xl font-black mt-1">
                    {t("menuItem.reviewsSubtitle")}
                  </h2>
                </div>
                {user ? (
                  <button
                    type="button"
                    className="bg-amber-500/80 text-gray-900 font-semibold text-sm px-4 py-2 rounded-xl cursor-not-allowed opacity-70"
                    disabled
                  >
                    {t("leaveReview")}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
                  >
                    {t("signInToReview")}
                  </Link>
                )}
              </div>

              {reviews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review, index) => (
                    <div
                      key={`${review.name}-${index}`}
                      className="bg-gray-900/60 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          {review.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-600"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 mb-3">
                    <Star size={18} />
                  </div>
                  <p className="text-white font-semibold mb-2">
                    {t("menuItem.noReviewsTitle")}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {t("menuItem.noReviewsBody")}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default MenuItemPage;
