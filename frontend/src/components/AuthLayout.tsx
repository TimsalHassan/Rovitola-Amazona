import { Outlet } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useState, useRef, useEffect } from "react";
import { Globe, ChefHat, Star } from "lucide-react";

const CUSTOMER_AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG9ydHJhaXRzfGVufDB8fDB8fHwy",
  "https://images.unsplash.com/photo-1557007025-735777a3ac07?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fHBvcnRyYWl0c3xlbnwwfHwwfHx8Mg%3D%3D",
  "https://images.unsplash.com/photo-1611178204388-1deef70ec66a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fHBvcnRyYWl0c3xlbnwwfHwwfHx8Mg%3D%3D",
];

export default function AuthLayout() {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEn = language === "en";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950">
      {/* ── Left panel — full-height hero ── */}
      <div className="hidden lg:flex w-2/3 relative flex-shrink-0">
        <img
          src="https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Wood-fired pizza"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay — darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Top-left brand badge */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Ravintola <span className="text-amber-400">Amazona</span>
          </span>
        </div>

        {/* Center quote */}
        <div className="absolute inset-0 flex items-center justify-center px-12">
          <blockquote className="text-center">
            <p className="text-white/90 text-xl italic font-light leading-relaxed">
              {isEn
                ? '"Food is the ingredient that binds us together."'
                : '"Ruoka on ainesosa, joka yhdistää meidät."'}
            </p>
          </blockquote>
        </div>

        {/* Bottom copy */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-3">
            {isEn ? (
              <>
                Authentic flavours,
                <br />
                delivered fast.
              </>
            ) : (
              <>
                Aitoja makuja,
                <br />
                toimitettu nopeasti.
              </>
            )}
          </h1>
          <p className="text-gray-300 text-base mb-6 max-w-sm">
            {isEn
              ? "Wood-fired pizzas and more — straight from our kitchen to your door."
              : "Puulämmitteiset pizzat ja muuta — suoraan keittiöstämme ovellesi."}
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {CUSTOMER_AVATARS.map((avatar, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center text-sm"
                >
                  <img
                    src={avatar}
                    alt="Customer"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="text-white text-sm font-semibold ml-1">
                  4.9
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                {isEn
                  ? "Loved by 2,000+ customers"
                  : "2,000+ tyytyväistä asiakasta"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile hero banner ── */}
      <div className="lg:hidden w-full h-52 relative flex-shrink-0">
        <img
          src="https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Wood-fired pizza"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex flex-col justify-end px-6 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <ChefHat className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-tight">Ravintola</span>
              <span className="text-amber-400 font-bold text-sm tracking-wide">Amazona</span>
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {isEn ? "Authentic flavours, fast." : "Aitoja makuja, nopeasti."}
          </h1>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-900 relative min-h-0">
        {/* Language switcher */}
        <div className="absolute top-4 right-4 z-50" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="px-3 flex items-center gap-2 py-1.5 rounded-md bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {isEn ? "English" : "Suomi"}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-gray-800 rounded-md shadow-xl border border-gray-700 overflow-hidden">
              {(["en", "fi"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors
                    ${
                      language === lang
                        ? "bg-amber-500/20 text-amber-400 font-medium"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  {lang === "en" ? "🇬🇧 English" : "🇫🇮 Suomi"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full max-w-sm pt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
