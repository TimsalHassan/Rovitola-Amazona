import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Menu, X, Utensils, User,
  ChevronDown, LogOut, Settings, ShoppingBag,
  LogIn
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHome = location.pathname === '/';
  const solidBg = scrolled || !isHome;

  const navLinks = [
    { to: '/', label: t("nav.home") },
    { to: '/menu', label: t("nav.menu") },
    { to: '/about', label: t("nav.about") },
    { to: '/contact', label: t("nav.contact") },
  ];

  function handleLogout() {
    setUserDropdown(false);
    logout();
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solidBg ? 'bg-gray-900 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-md group-hover:bg-amber-400 transition-colors">
              <Utensils size={20} className="text-gray-900" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-tight">Ravintola</span>
              <span className="text-amber-400 font-bold text-sm tracking-wide">Amazona</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">

            {/* Language switcher */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg overflow-hidden border border-white/10">
              {(['fi', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                    language === lang
                      ? 'bg-amber-500 text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Cart, ${totalItems} items`}
              className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-3 py-2 rounded-lg transition-all text-sm"
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(v => !v)}
                  aria-expanded={userDropdown}
                  aria-haspopup="true"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2 rounded-lg transition-all text-sm"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs text-gray-400">{t("nav.signedInAs")}</p>
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Settings size={16} />
                      {t("nav.myAccount")}
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <ShoppingBag size={16} />
                      {t("nav.myOrders")}
                    </Link>
                    <div className="border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={16} />
                        {t("nav.signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">{t("nav.login")}</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-900 border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === link.to
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Language switcher (mobile) */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-white/10 mt-2 pt-3">
            <span className="text-gray-400 text-xs">{t("nav.language")}:</span>
            {(['fi', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  language === lang ? 'bg-amber-500 text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                {lang === 'fi' ? t("nav.langFi") : t("nav.langEn")}
              </button>
            ))}
          </div>

          {/* Authenticated mobile links */}
          {user && (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Settings size={16} />
                {t("nav.myAccount")}
              </Link>
              <Link
                to="/my-orders"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ShoppingBag size={16} />
                {t("nav.myOrders")}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                {t("nav.signOut")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}