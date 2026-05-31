import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Truck, MapPin, AlertCircle, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const MIN_ORDER = 13;
const DELIVERY_CHARGE = 4;
const DISCOUNT_RATE = 0.05;

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');

  const subtotal = items.reduce((s, ci) => s + ci.totalPrice, 0);
  const deliveryCharge = orderType === 'delivery' ? DELIVERY_CHARGE : 0;
  const discountAmount = subtotal * DISCOUNT_RATE;
  const total = subtotal + deliveryCharge - discountAmount;
  const belowMinimum = subtotal < MIN_ORDER;

  const canProceed = items.length > 0 && !belowMinimum && (orderType === 'pickup' || address.trim().length > 5);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout', cartState: { orderType, address, subtotal, deliveryCharge, discountAmount, total } } });
    } else {
      navigate('/checkout', { state: { orderType, address, subtotal, deliveryCharge, discountAmount, total } });
    }
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">{t('Ostoskori', 'Shopping Cart')}</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length === 0 ? t('Ostoskorisi on tyhjä', 'Your cart is empty') : `${items.length} ${t('tuotetta', 'items')}`}</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">{t('Ostoskorisi on tyhjä', 'Your cart is empty')}</h2>
            <p className="text-gray-400 text-sm mb-6">{t('Lisää ruokia ruokalistalta.', 'Add items from the menu.')}</p>
            <Link to="/menu" className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-6 py-2.5 rounded-lg text-sm inline-block transition-colors">{t('Selaa Ruokalistaa', 'Browse Menu')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Order type */}
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
                <p className="text-white font-medium text-sm mb-3">{t('Tilaustyyppi', 'Order Type')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setOrderType('delivery')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${orderType === 'delivery' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
                    <Truck size={16} />{t('Toimitus', 'Delivery')}
                  </button>
                  <button onClick={() => setOrderType('pickup')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${orderType === 'pickup' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
                    <ShoppingBag size={16} />{t('Nouto', 'Pickup')}
                  </button>
                </div>
                {orderType === 'delivery' && (
                  <div className="mt-3">
                    <label className="block text-gray-400 text-xs mb-1">{t('Toimitusosoite', 'Delivery Address')}</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder={t('Kirjoita osoite...', 'Enter address...')} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    <p className="text-gray-500 text-xs mt-1">{t('Ilmainen alle 9km, €4 yli 9km', 'Free under 9km, €4 over 9km')}</p>
                  </div>
                )}
              </div>

              {belowMinimum && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle size={18} className="text-red-400" />
                  <p className="text-red-300 text-sm">{t('Minimitilaus €13 ei täyty.', 'Minimum order €13 not met.')}</p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3">
                {items.map((ci, idx) => (
                  <div key={idx} className="bg-gray-900 border border-white/5 rounded-xl p-4">
                    <div className="flex gap-4">
                      <img src={ci.item.image} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm">{language === 'fi' ? ci.item.nameFi : ci.item.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{t('Koko', 'Size')}: {ci.size === 'small' ? t('Pieni', 'Small') : ci.size === 'medium' ? t('Keski', 'Medium') : t('Suuri', 'Large')}</p>
                        {ci.toppings.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1">{t('Lisäkkeet', 'Toppings')}: {ci.toppings.map(t => language === 'fi' ? t.nameFi : t.name).join(', ')}</p>
                        )}
                        {ci.seasonings.length > 0 && (
                          <p className="text-gray-600 text-xs">{t('Mausteet', 'Seasonings')}: {ci.seasonings.map(s => language === 'fi' ? s.nameFi : s.name).join(', ')}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-amber-400 font-bold text-sm">€{ci.totalPrice.toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(idx, ci.quantity - 1)} className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300"><Minus size={14} /></button>
                            <span className="text-white text-sm font-bold w-5 text-center">{ci.quantity}</span>
                            <button onClick={() => updateQuantity(idx, ci.quantity + 1)} className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300"><Plus size={14} /></button>
                            <button onClick={() => removeItem(idx)} className="ml-2 text-gray-600 hover:text-red-400"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <h2 className="text-white font-bold text-base mb-4">{t('Tilauksen Yhteenveto', 'Order Summary')}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400"><span>{t('Välisumma', 'Subtotal')}</span><span>€{subtotal.toFixed(2)}</span></div>
                  {orderType === 'delivery' && <div className="flex justify-between text-gray-400"><span>{t('Toimitus', 'Delivery')}</span><span>€{DELIVERY_CHARGE.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-green-400"><span>{t('5% alennus', '5% discount')}</span><span>-€{discountAmount.toFixed(2)}</span></div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-base"><span>{t('Yhteensä', 'Total')}</span><span>€{total.toFixed(2)}</span></div>
                </div>
                <button onClick={handleCheckout} disabled={!canProceed} className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${canProceed ? 'bg-amber-500 hover:bg-amber-400 text-gray-900' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                  {t('Jatka Kassalle', 'Proceed to Checkout')}<ArrowRight size={16} />
                </button>
                {!user && <p className="text-center text-gray-500 text-xs mt-2">{t('Kirjaudu sisään jatkaaksesi', 'Login required to continue')}</p>}
                <Link to="/menu" className="block text-center text-amber-400 hover:text-amber-300 text-xs mt-3">+ {t('Lisää tuotteita', 'Add more items')}</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
