import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Circle, Clock, MapPin, Truck, ShoppingBag, Home, XCircle, ChefHat, Package } from 'lucide-react';
import { useLanguage } from "../hooks/useLanguage";
import { CartItem, OrderStatus } from '../types';

interface LocationState {
  items?: CartItem[];
  orderType?: 'delivery' | 'pickup';
  address?: string;
  total?: number;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered'];

const STATUS_CONFIG = {
  pending: {
    labelFi: 'Tilaus Vastaanotettu',
    labelEn: 'Order Confirmed',
    icon: CheckCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-400',
  },
  confirmed: {
    labelFi: 'Vahvistettu',
    labelEn: 'Confirmed',
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-400',
  },
  preparing: {
    labelFi: 'Valmistetaan',
    labelEn: 'Preparing',
    icon: ChefHat,
    color: 'text-amber-400',
    bg: 'bg-amber-400',
  },
  on_the_way: {
    labelFi: 'Matkalla',
    labelEn: 'On the Way',
    icon: Truck,
    color: 'text-green-400',
    bg: 'bg-green-400',
  },
  delivered: {
    labelFi: 'Toimitettu',
    labelEn: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-400',
  },
};

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t, language } = useLanguage();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    const timers = [
      setTimeout(() => setCurrentStatus('confirmed'), 8000),
      setTimeout(() => setCurrentStatus('preparing'), 16000),
      setTimeout(() => setCurrentStatus('on_the_way'), 25000),
      setTimeout(() => setCurrentStatus('delivered'), 40000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [cancelled]);

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const canCancel = currentStatus === 'pending';

  const handleCancel = () => {
    if (!canCancel) return;
    setCancelled(true);
    setCurrentStatus('pending');
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mb-4">
            <span className="text-gray-400 text-sm">{t('Tilausnumero', 'Order Number')}</span>
            <span className="text-amber-400 font-bold">{orderId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {cancelled
              ? t('Tilaus Peruttu', 'Order Cancelled')
              : t('Seuraa Tilaustasi', 'Track Your Order')}
          </h1>
        </div>

        {cancelled ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center mb-8">
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">{t('Tilaus on peruttu', 'Order has been cancelled')}</p>
            <p className="text-gray-400 text-sm">{t('Jos sinulla on kysyttavaa, ota yhteytta ravintolaan.', 'If you have questions, please contact the restaurant.')}</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-5">
            <h2 className="text-white font-semibold mb-6">{t('Tilauksen Status', 'Order Status')}</h2>

            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-800" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-amber-400 transition-all duration-700"
                style={{
                  height: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%`,
                }}
              />

              <div className="space-y-6">
                {STATUS_ORDER.map((status, idx) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={status} className="flex items-start gap-4 relative">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500/20 border border-green-500/40'
                            : isCurrent
                            ? 'bg-amber-500/20 border border-amber-500/40'
                            : 'bg-gray-800 border border-white/10'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : isCurrent ? (
                          <Icon size={20} className="text-amber-400" />
                        ) : (
                          <Circle size={20} className="text-gray-600" />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`font-semibold text-sm ${
                            isCompleted
                              ? 'text-green-400'
                              : isCurrent
                              ? 'text-amber-400'
                              : 'text-gray-600'
                          }`}
                        >
                          {language === 'fi' ? config.labelFi : config.labelEn}
                        </p>
                        {isCurrent && (
                          <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            {t('Nykyinen tila', 'Current status')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-5">
          <h2 className="text-white font-semibold mb-4">{t('Toimitustiedot', 'Delivery Info')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-400">
              {state?.orderType === 'pickup'
                ? <ShoppingBag size={15} className="text-amber-400" />
                : <Truck size={15} className="text-amber-400" />}
              <span>
                {state?.orderType === 'pickup'
                  ? t('Nouto ravintolasta', 'Pickup from restaurant')
                  : t('Toimitus', 'Delivery')}
              </span>
            </div>
            <div className="flex items-start gap-3 text-gray-400">
              <MapPin size={15} className="text-amber-400 mt-0.5 shrink-0" />
              <span>
                {state?.orderType === 'pickup'
                  ? 'Aleksanterinkatu 3, 15110 Lahti'
                  : state?.address || t('Osoite ei saatavilla', 'Address not available')}
              </span>
            </div>
            {!cancelled && currentStatus !== 'delivered' && (
              <div className="flex items-center gap-3 text-gray-400">
                <Clock size={15} className="text-amber-400" />
                <span>{t('Arvioitu aika:', 'Estimated time:')} 30-45 {t('min', 'min')}</span>
              </div>
            )}
          </div>
        </div>

        {state?.items && state.items.length > 0 && (
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-5">
            <h2 className="text-white font-semibold mb-4">{t('Tilatut Tuotteet', 'Ordered Items')}</h2>
            <div className="space-y-3">
              {state.items.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {language === 'fi' ? item.nameFi : item.name}
                    </p>
                    <p className="text-gray-500 text-xs">x{quantity}</p>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">
                    €{(item.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            {state.total && (
              <div className="border-t border-white/10 mt-4 pt-3 flex justify-between text-white font-bold">
                <span>{t('Yhteensa', 'Total')}</span>
                <span>€{state.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {!cancelled && (
          <div className="mb-5">
            {canCancel ? (
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3.5 rounded-xl transition-colors"
              >
                <XCircle size={17} />
                {t('Peru Tilaus', 'Cancel Order')}
              </button>
            ) : (
              <div className="flex items-start gap-3 bg-gray-900 border border-white/5 rounded-xl px-4 py-3.5">
                <XCircle size={16} className="text-gray-600 mt-0.5 shrink-0" />
                <p className="text-gray-500 text-sm">
                  {t(
                    'Tilausta ei voi enaa peruuttaa - ravintola on jo aloittanut valmistuksen.',
                    'Order can no longer be cancelled - the restaurant has already started preparation.'
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          <Home size={17} />
          {t('Takaisin Etusivulle', 'Back to Home')}
        </Link>
      </div>
    </main>
  );
}
