import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, User, ArrowRight } from 'lucide-react';
import { useLanguage } from "../hooks/useLanguage";
import { useEffect, useState } from 'react';
import { CartItem } from '../types';

interface LocationState {
  orderNumber: string;
  items: CartItem[];
  orderType: 'delivery' | 'pickup';
  address: string;
  customerName: string;
  total: number;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
}

export default function OrderConfirmedPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    if (!state?.orderNumber) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.orderNumber) return null;

  const { orderNumber, items, orderType, customerName, total, subtotal, deliveryCharge, discountAmount } = state;

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-700 ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <CheckCircle size={40} className={`text-green-400 transition-all duration-500 delay-200 ${animate ? 'scale-100' : 'scale-0'}`} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("orderConfirmed.title")}</h1>
          <p className="text-gray-400">{t("orderConfirmed.thankYouPrefix")} {customerName}!</p>
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mt-3">
            <span className="text-amber-400 font-bold">{orderNumber}</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 mb-5">
          <p className="text-gray-400 text-sm mb-1">{t("orderConfirmed.estimatedDelivery")}</p>
          <p className="text-2xl font-bold text-amber-400">30-45 {t("orderConfirmed.minutes")}</p>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 mb-5">
          <h2 className="text-white font-bold text-sm mb-3">{t("orderConfirmed.orderedItems")}</h2>
          <div className="space-y-3 mb-4">
            {items.map((ci, i) => (
              <div key={i} className="flex gap-3">
                <img src={ci.item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{language === 'fi' ? ci.item.nameFi : ci.item.name}</p>
                  <p className="text-gray-500 text-xs">{t("orderConfirmed.size")}: {ci.size} {ci.toppings.length > 0 && `+ ${ci.toppings.length} ${t("orderConfirmed.toppings")}`}</p>
                </div>
                <p className="text-gray-300 text-sm">€{ci.totalPrice.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-400"><span>{t("orderConfirmed.subtotal")}</span><span>€{subtotal.toFixed(2)}</span></div>
            {orderType === 'delivery' && <div className="flex justify-between text-gray-400"><span>{t("orderConfirmed.delivery")}</span><span>€{deliveryCharge.toFixed(2)}</span></div>}
            <div className="flex justify-between text-green-400"><span>{t("orderConfirmed.discount")}</span><span>-€{discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10"><span>{t("orderConfirmed.total")}</span><span>€{total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/account" className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl transition-colors">
            <User size={18} />{t("orderConfirmed.myAccount")}<ArrowRight size={16} />
          </Link>
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-white/10 text-white font-semibold py-3 rounded-xl transition-colors">
            <Home size={18} />{t("orderConfirmed.backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
