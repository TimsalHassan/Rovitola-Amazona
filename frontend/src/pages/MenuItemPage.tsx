import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { MenuItem, Extra, ExtraOption } from "../api/menu";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useMenu } from "../hooks/useMenu";
import { useCart } from "../hooks/useCart";
import type { SelectedOption } from "../context/CartContext";

function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isFinite(num)) return num.toFixed(2);
  return String(value);
}

// ─── Extra selection helpers ──────────────────────────────────────────────────

/** Map of extra_id → set of selected option_ids */
type ExtraSelections = Record<number, Set<number>>;

function buildSelectedOptions(
  extras: Extra[],
  selections: ExtraSelections,
): SelectedOption[] {
  const result: SelectedOption[] = [];
  for (const extra of extras) {
    const chosen = selections[extra.id];
    if (!chosen || chosen.size === 0) continue;
    for (const optionId of chosen) {
      const option = extra.options.find((o) => o.id === optionId);
      if (!option) continue;
      result.push({
        extra_id: extra.id,
        extra_name: extra.name,
        extra_name_fi: extra.name_fi,
        extra_type: extra.extra_type,
        option_id: option.id,
        option_name: option.name,
        option_name_fi: option.name_fi,
        additional_price: Number(option.display_price) || 0,
      });
    }
  }
  return result;
}

function validateSelections(extras: Extra[], selections: ExtraSelections): string | null {
  for (const extra of extras) {
    const chosen = selections[extra.id];
    const count = chosen ? chosen.size : 0;
    if (extra.is_required && count === 0) {
      return extra.name;
    }
    if (extra.max_selections !== null && count > extra.max_selections) {
      return extra.name;
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MenuItemPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { items, isItemsLoading } = useMenu();
  const { addItem } = useCart();
  const { id } = useParams();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [selections, setSelections] = useState<ExtraSelections>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const foundItem = items.find((i) => i.id === Number(id));
    console.log("Found item:", foundItem);
    setItem(foundItem || null);
    // Reset state when item changes
    setSelections({});
    setQuantity(1);
    setSpecialInstruction("");
    setValidationError(null);
    setAddedToCart(false);
  }, [id, items]);

  const getLocalizedText = (en: string, fi: string, fallback: string) => {
    const preferred = language === "fi" ? fi : en;
    return preferred || en || fi || fallback;
  };

  const displayName = item
    ? getLocalizedText(item.name, item.name_fi, t("unnamedItem"))
    : "";
  const displayDescription = item
    ? getLocalizedText(item.description, item.description_fi, t("unnamedItemDesc"))
    : "";
  const displayCategory =
    item?.category_name || item?.category_slug || t("menuItem.uncategorized");

  // ── Option toggle ────────────────────────────────────────────────────────

  const toggleOption = useCallback(
    (extra: Extra, option: ExtraOption) => {
      setValidationError(null);
      setSelections((prev) => {
        const current = new Set(prev[extra.id] ?? []);

        if (current.has(option.id)) {
          // Deselect
          current.delete(option.id);
        } else {
          if (extra.extra_type === "choice") {
            // Radio behaviour: replace selection
            current.clear();
            current.add(option.id);
          } else {
            // Checkbox / addon behaviour: multi-select within max_selections
            if (
              extra.max_selections === null ||
              current.size < extra.max_selections
            ) {
              current.add(option.id);
            }
            // If at max, silently ignore (could show a toast if desired)
          }
        }

        return { ...prev, [extra.id]: current };
      });
    },
    [],
  );

  // ── Computed unit price ──────────────────────────────────────────────────

  const extrasCost = item
    ? item.extras.reduce((sum, extra) => {
        const chosen = selections[extra.id];
        if (!chosen) return sum;
        for (const optId of chosen) {
          const opt = extra.options.find((o) => o.id === optId);
          if (opt) sum += Number(opt.display_price) || 0;
        }
        return sum;
      }, 0)
    : 0;

  const unitPrice = item ? (Number(item.current_price) || 0) + extrasCost : 0;
  const totalPrice = unitPrice * quantity;

  // ── Add to cart handler ──────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (!item) return;

    const invalid = validateSelections(item.extras, selections);
    if (invalid) {
      setValidationError(invalid);
      // Scroll to extras section
      document
        .getElementById("extras-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const selectedOptions = buildSelectedOptions(item.extras, selections);
    addItem(item, selectedOptions, quantity, specialInstruction);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
            {/* ── Item header ── */}
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
                  <h1 className="text-3xl sm:text-4xl font-black">{displayName}</h1>
                  <p className="text-gray-300 leading-relaxed">{displayDescription}</p>
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

                {/* ── Special instruction ── */}
                <div>
                  <label
                    htmlFor="special-instruction"
                    className="block text-xs text-gray-400 mb-1.5"
                  >
                    {t("menuItem.specialInstruction") ?? "Special instructions (optional)"}
                  </label>
                  <textarea
                    id="special-instruction"
                    rows={2}
                    value={specialInstruction}
                    onChange={(e) => setSpecialInstruction(e.target.value)}
                    placeholder={
                      t("menuItem.specialInstructionPlaceholder") ??
                      "E.g. no onions, extra sauce…"
                    }
                    className="w-full bg-gray-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* ── Quantity + Add to cart ── */}
                <div className="flex items-center gap-3 pt-1">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-0 bg-gray-900/60 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2.5 text-sm font-bold min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    type="button"
                    disabled={!item.is_available}
                    onClick={handleAddToCart}
                    className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      addedToCart
                        ? "bg-green-500 text-white"
                        : item.is_available
                        ? "bg-amber-500 hover:bg-amber-400 text-gray-900"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={15} />
                        {t("menuItem.addedToCart") ?? "Added!"}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={15} />
                        {t("menuItem.addToCart") ?? "Add to cart"} — €
                        {formatPrice(totalPrice)}
                      </>
                    )}
                  </button>
                </div>

                {/* Validation error */}
                {validationError && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {t("menuItem.requiredExtraError")
                      ? `${t("menuItem.requiredExtraError")}: ${validationError}`
                      : `Please make a selection for: ${validationError}`}
                  </p>
                )}
              </div>
            </section>

            {/* ── Extras ── */}
            <section id="extras-section" className="mt-12">
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

                    const isInvalid =
                      validationError === extra.name && extra.is_required;
                    const chosenSet = selections[extra.id] ?? new Set<number>();

                    return (
                      <div
                        key={extra.id}
                        className={`bg-gray-900/60 border rounded-2xl p-4 transition-colors ${
                          isInvalid
                            ? "border-red-500/50"
                            : "border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-white font-semibold">
                              {extraName}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {typeLabel} • {selectionLabel}
                              {maxLabel ? ` • ${maxLabel}` : ""}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${
                              extra.is_required
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-white/5 border-white/10 text-gray-300"
                            }`}
                          >
                            {selectionLabel}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {extra.options.map((option) => {
                            const optionName = getLocalizedText(
                              option.name,
                              option.name_fi,
                              t("menuItem.unnamedOption"),
                            );
                            const optionPrice = Number(option.display_price);
                            const priceLabel = Number.isFinite(optionPrice)
                              ? optionPrice === 0
                                ? t("menuItem.included")
                                : `+€${formatPrice(optionPrice)}`
                              : t("menuItem.included");

                            const isSelected = chosenSet.has(option.id);
                            const isChoice = extra.extra_type === "choice";

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => toggleOption(extra, option)}
                                className={`w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${
                                  isSelected
                                    ? "bg-amber-500/15 border-amber-500/40 text-white"
                                    : "bg-white/[0.03] border-white/8 text-gray-300 hover:bg-white/[0.07] hover:border-white/15"
                                }`}
                              >
                                <span className="flex items-center gap-2.5">
                                  {/* Radio or checkbox indicator */}
                                  <span
                                    className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full border transition-colors ${
                                      isSelected
                                        ? "bg-amber-500 border-amber-500"
                                        : "border-gray-600"
                                    } ${!isChoice ? "rounded-md" : ""}`}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={10}
                                        className="text-gray-900"
                                        strokeWidth={3}
                                      />
                                    )}
                                  </span>
                                  {optionName}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    isSelected ? "text-amber-400" : "text-gray-500"
                                  }`}
                                >
                                  {priceLabel}
                                </span>
                              </button>
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

            {/* ── Reviews ── */}
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
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default MenuItemPage;