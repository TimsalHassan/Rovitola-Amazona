import { useState } from 'react';
import { Search, Phone, Package, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from "../hooks/useLanguage";
import { findOrdersByPhone } from '../data/orders';
import { Order, OrderStatus } from '../types';

function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  const config = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', key: "orderStatus.pending" },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', key: "orderStatus.confirmed" },
    preparing: { bg: 'bg-amber-500/20', text: 'text-amber-400', key: "orderStatus.preparing" },
    on_the_way: { bg: 'bg-purple-500/20', text: 'text-purple-400', key: "orderStatus.onTheWay" },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-400', key: "orderStatus.delivered" },
  } as const;
  const { bg, text, key } = config[status];
  return <span className={`${bg} ${text} text-xs font-medium px-2 py-0.5 rounded-full`}>{t(key)}</span>;
}

export default function GuestOrdersPage() {
  const { t, language } = useLanguage();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const found = findOrdersByPhone(phone);
    setOrders(found);
    setSearched(true);
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">{t("guestOrders.title")}</h1>
          <p className="text-gray-400 text-sm mt-1">{t("guestOrders.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Prompt to register */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-4">
          <UserPlus size={24} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium text-sm">{t("guestOrders.registerPromptTitle")}</p>
            <p className="text-gray-400 text-xs">{t("guestOrders.registerPromptBody")}</p>
          </div>
          <Link to="/register" className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm shrink-0 transition-colors">
            {t("guestOrders.registerCta")}
          </Link>
        </div>

        {/* Search form */}
        <div className="bg-gray-900 border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+358 40 123 4567"
                className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!phone.trim()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Search size={16} />
              {t("guestOrders.findButton")}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-gray-900 border border-white/5 rounded-xl p-8 text-center">
                <Package size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">{t("guestOrders.noOrders")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-gray-900 border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-amber-400 font-bold">{order.orderNumber}</span>
                        <p className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString('fi-FI')}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.map((ci, i) => (
                        <span key={i} className="text-gray-300 text-xs bg-gray-800 px-2 py-1 rounded">
                          {language === 'fi' ? ci.item.nameFi : ci.item.name} x{ci.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="text-white font-bold">€{order.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
