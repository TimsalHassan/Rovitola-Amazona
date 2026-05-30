import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { User, Phone, MapPin, FileText, CreditCard, ArrowLeft, ArrowRight, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface CartState {
  orderType: 'delivery' | 'pickup';
  address: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CartState) || { orderType: 'delivery', address: '', subtotal: 0, deliveryCharge: 4, discountAmount: 0, total: 0 };

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: state.orderType === 'delivery' ? state.address : '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    clearCart();
    navigate('/order-confirmed', { state: { orderNumber, items, orderType: state.orderType, address: form.address, customerName: form.name, total: state.total, subtotal: state.subtotal, deliveryCharge: state.deliveryCharge, discountAmount: state.discountAmount } });
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-3"><ArrowLeft size={14} />{t('Takaisin', 'Back')}</Link>
          <h1 className="text-3xl font-bold text-white">{t('Kassa', 'Checkout')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
                <h2 className="text-white font-bold">{t('Asiakastiedot', 'Customer Details')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Nimi', 'Name')}</label>
                    <input type="text" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Puhelin', 'Phone')}</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-4">
                <h2 className="text-white font-bold flex items-center gap-2">{state.orderType === 'delivery' ? <Truck size={18} className="text-amber-400" /> : <ShoppingBag size={18} className="text-amber-400" />}{state.orderType === 'delivery' ? t('Toimitus', 'Delivery') : t('Nouto', 'Pickup')}</h2>
                {state.orderType === 'delivery' ? (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Osoite', 'Address')}</label>
                    <input type="text" required value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">Ravintola Amazona</p>
                    <p className="text-gray-400 text-xs">Aleksanterinkatu 3, 15110 Lahti</p>
                  </div>
                )}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">{t('Lisätiedot', 'Order Notes')} ({t('valinnainen', 'optional')})</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none" />
                </div>
              </div>

              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <CreditCard size={20} className="text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">Paytrail</p>
                  <p className="text-gray-400 text-xs">{t('Maksu Paytrailin kautta.', 'Payment via Paytrail.')}</p>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <h2 className="text-white font-bold text-base mb-4">{t('Yhteenveto', 'Summary')}</h2>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                  {items.map((ci, i) => (
                    <div key={i} className="flex gap-2">
                      <img src={ci.item.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs truncate">{language === 'fi' ? ci.item.nameFi : ci.item.name}</p>
                        <p className="text-gray-500 text-[10px]">x{ci.quantity}</p>
                      </div>
                      <p className="text-gray-300 text-xs">€{ci.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-400"><span>{t('Välisumma', 'Subtotal')}</span><span>€{state.subtotal.toFixed(2)}</span></div>
                  {state.orderType === 'delivery' && <div className="flex justify-between text-gray-400"><span>{t('Toimitus', 'Delivery')}</span><span>€{state.deliveryCharge.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-green-400"><span>{t('5% alennus', '5% discount')}</span><span>-€{state.discountAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10"><span>{t('Yhteensä', 'Total')}</span><span>€{state.total.toFixed(2)}</span></div>
                </div>
                <button type="submit" disabled={loading} className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${loading ? 'bg-amber-500/50 text-gray-700' : 'bg-amber-500 hover:bg-amber-400 text-gray-900'}`}>
                  {loading ? <><span className="animate-spin w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full" />{t('Käsitellään...', 'Processing...')}</> : <>{t('Tee Tilaus', 'Place Order')}<ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
