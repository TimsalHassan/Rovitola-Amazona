import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, ChevronDown, Minus, UtensilsCrossed, X, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { categories } from '../data/categories';
import { menuItems, emptyCategories } from '../data/menuItems';
import { lunchItems } from '../data/menuItems';
import { MenuItem, ToppingSelection, SeasoningSelection, AVAILABLE_TOPPINGS, AVAILABLE_SEASONINGS, SIZE_PRICES } from '../types';
import { isLunchHours } from '../utils/openingHours';

const PAGE_SIZE = 8;

function ItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl p-4 hover:border-amber-500/20 transition-colors">
      <div className="flex gap-4">
        <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{language === 'fi' ? item.nameFi : item.name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{language === 'fi' ? item.descriptionFi : item.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-amber-400 font-bold">€{item.price.toFixed(2)}</span>
            <button onClick={onAdd} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors">
              <Plus size={14} />{language === 'fi' ? 'Lisää' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCard() {
  const { language } = useLanguage();
  return (
    <div className="bg-gray-900 border border-white/5 rounded-xl p-6 flex items-center gap-4 opacity-60">
      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0"><UtensilsCrossed size={24} className="text-gray-600" /></div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{language === 'fi' ? 'Tuotteita tulossa pian' : 'Items coming soon'}</p>
        <p className="text-gray-600 text-xs mt-1">{language === 'fi' ? 'Tämä kategoria avataan pian.' : 'This category will open soon.'}</p>
      </div>
    </div>
  );
}

function LunchUnavailableCard({ item }: { item: MenuItem }) {
  const { language } = useLanguage();
  return (
    <div className="relative bg-gray-900 border border-white/5 rounded-xl p-4 opacity-70">
      <div className="absolute inset-0 bg-gray-950/60 rounded-xl flex items-center justify-center z-10">
        <div className="text-center px-4">
          <Clock size={20} className="text-gray-500 mx-auto mb-1" />
          <p className="text-gray-400 text-xs">{language === 'fi' ? 'Ei saatavilla' : 'Not currently available'}</p>
        </div>
      </div>
      <div className="flex gap-4 opacity-40">
        <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{language === 'fi' ? item.nameFi : item.name}</h3>
          <p className="text-gray-400 text-xs mt-1">{language === 'fi' ? item.descriptionFi : item.description}</p>
          <div className="mt-3"><span className="text-amber-400 font-bold">€{item.price.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [toppings, setToppings] = useState<ToppingSelection[]>([]);
  const [seasonings, setSeasonings] = useState<SeasoningSelection[]>([]);
  const [quantity, setQuantity] = useState(1);

  const basePrice = item.price + SIZE_PRICES[size];
  const toppingsPrice = toppings.reduce((s, t) => s + t.price, 0);
  const totalPrice = (basePrice + toppingsPrice) * quantity;

  const toggleTopping = (tp: typeof AVAILABLE_TOPPINGS[0]) => {
    setToppings(prev => {
      const exists = prev.find(t => t.id === tp.id);
      if (exists) return prev.filter(t => t.id !== tp.id);
      return [...prev, { id: tp.id, name: tp.name, nameFi: tp.nameFi, price: tp.price }];
    });
  };

  const toggleSeasoning = (s: typeof AVAILABLE_SEASONINGS[0]) => {
    setSeasonings(prev => {
      const exists = prev.find(sp => sp.id === s.id);
      if (exists) return prev.filter(sp => sp.id !== s.id);
      return [...prev, { id: s.id, name: s.name, nameFi: s.nameFi }];
    });
  };

  const handleAdd = () => {
    addItem(item, size, toppings, seasonings, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md my-8">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-bold">{language === 'fi' ? item.nameFi : item.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-5">
          <img src={item.image} alt="" className="w-full h-40 object-cover rounded-lg" />

          {/* Size */}
          <div>
            <p className="text-gray-400 text-sm mb-2">{t('Koko', 'Size')}</p>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(s => (
                <button key={s} onClick={() => setSize(s)} className={`py-2 rounded-lg text-sm font-medium transition-all ${size === s ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  {s === 'small' ? t('Pieni', 'Small') : s === 'medium' ? t('Keski', 'Medium') : t('Suuri', 'Large')}
                  <span className="text-xs block opacity-70">+€{SIZE_PRICES[s].toFixed(0)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div>
            <p className="text-gray-400 text-sm mb-2">{t('Lisäkkeet', 'Extra Toppings')}</p>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_TOPPINGS.map(tp => {
                const selected = toppings.some(t => t.id === tp.id);
                return (
                  <button key={tp.id} onClick={() => toggleTopping(tp)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${selected ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border' : 'bg-gray-800 border-white/10 text-gray-300 border'}`}>
                    <span className="w-4 h-4 rounded border flex items-center justify-center text-[10px]">{selected ? '✓' : ''}</span>
                    <span>{language === 'fi' ? tp.nameFi : tp.name}</span>
                    <span className="ml-auto text-gray-500">+€{tp.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seasonings */}
          <div>
            <p className="text-gray-400 text-sm mb-2">{t('Mausteet', 'Extra Seasonings')} <span className="text-gray-600">({t('Ilmainen', 'Free')})</span></p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SEASONINGS.map(s => {
                const selected = seasonings.some(sp => sp.id === s.id);
                return (
                  <button key={s.id} onClick={() => toggleSeasoning(s)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${selected ? 'bg-green-500/20 border-green-500/50 text-green-400 border' : 'bg-gray-800 border-white/10 text-gray-300 border'}`}>
                    <span className="w-4 h-4 rounded border flex items-center justify-center text-[10px]">{selected ? '✓' : ''}</span>
                    <span>{language === 'fi' ? s.nameFi : s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-gray-400 text-sm mb-2">{t('Määrä', 'Quantity')}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white"><Minus size={16} /></button>
              <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white"><Plus size={16} /></button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <p className="text-gray-400 text-xs">{t('Yhteensä', 'Total')}</p>
              <p className="text-white font-bold text-xl">€{totalPrice.toFixed(2)}</p>
            </div>
            <button onClick={handleAdd} className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors">
              {t('Lisää Koriin', 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<'main' | 'lunch'>('main');
  const [activeCategory, setActiveCategory] = useState('pizzat');
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLunch = isLunchHours();

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id.replace('cat-', ''));
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );
    categories.forEach(cat => {
      const el = categoryRefs.current[cat.id];
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [tab]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById('cat-' + id);
    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
  };

  const pizzatItems = menuItems.filter(i => i.categoryId === 'pizzat');
  const shownPizzas = pizzatItems.slice(0, visibleCount);

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-4">{t('Ruokalista', 'Menu')}</h1>
          <div className="flex gap-2">
            <button onClick={() => setTab('main')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'main' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
              {t('Pääruokalista', 'Main Menu')}
            </button>
            <button onClick={() => setTab('lunch')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'lunch' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
              {t('Lounaslista', 'Lunch Menu')}
            </button>
          </div>
        </div>
      </div>

      {tab === 'main' && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-gray-900 border border-white/5 rounded-xl p-3">
                <nav className="space-y-1">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat.id ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <span>{cat.icon}</span>
                      <span>{language === 'fi' ? cat.nameFi : cat.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-2" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${activeCategory === cat.id ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
                  <span>{cat.icon}</span>
                  <span>{language === 'fi' ? cat.nameFi : cat.name}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-10">
              {categories.map(cat => {
                const isPizzat = cat.id === 'pizzat';
                const isEmpty = emptyCategories.includes(cat.id);

                return (
                  <section key={cat.id} id={'cat-' + cat.id} ref={el => { categoryRefs.current[cat.id] = el; }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{cat.icon}</span>
                      <h2 className="text-xl font-bold text-white">{language === 'fi' ? cat.nameFi : cat.name}</h2>
                    </div>

                    {isPizzat ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {shownPizzas.map(item => <ItemCard key={item.id} item={item} onAdd={() => setModalItem(item)} />)}
                        </div>
                        {visibleCount < pizzatItems.length && (
                          <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)} className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 border border-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                            {t('Lataa lisää', 'Load More')} ({pizzatItems.length - visibleCount} {t('jäljellä', 'remaining')})
                          </button>
                        )}
                      </>
                    ) : isEmpty ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><EmptyCard /></div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'lunch' && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-400 font-semibold">{t('Lounas saatavilla', 'Lunch Available')}</p>
            <p className="text-gray-400 text-sm">{t('Maanantai - Perjantai 10:30 - 14:30', 'Monday - Friday 10:30 - 14:30')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lunchItems.map(item => isLunch ? <ItemCard key={item.id} item={item} onAdd={() => setModalItem(item)} /> : <LunchUnavailableCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {modalItem && <AddItemModal item={modalItem} onClose={() => setModalItem(null)} />}

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
      <a href="/cart" className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-3 rounded-2xl shadow-xl">
        <ShoppingCart size={18} />{t('Ostoskori', 'Cart')} • {totalItems} <span className="bg-gray-900/20 px-2 py-0.5 rounded-lg text-sm">€{subtotal.toFixed(2)}</span>
      </a>
    </div>
  );
}
