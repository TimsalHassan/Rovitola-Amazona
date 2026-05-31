import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, User, Lock, LogOut, ChevronRight, RefreshCw, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { mockOrders } from '../data/orders';
import { Order, OrderStatus } from '../types';

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: { fi: 'Odottaa', en: 'Pending' } },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: { fi: 'Vahvistettu', en: 'Confirmed' } },
    preparing: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: { fi: 'Valmistetaan', en: 'Preparing' } },
    on_the_way: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: { fi: 'Matkalla', en: 'On the Way' } },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-400', label: { fi: 'Toimitettu', en: 'Delivered' } },
  };
  const { bg, text, label } = config[status];
  return <span className={`${bg} ${text} text-xs font-medium px-2 py-0.5 rounded-full`}>{label.fi}</span>;
}

export default function AccountPage() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [tab, setTab] = useState<'orders' | 'profile' | 'password'>('orders');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  const orders = mockOrders.filter(o => o.customerId === 'user-1');

  const handleSaveProfile = async () => {
    setSaving(true);
    updateProfile(profile.name, profile.phone);
    setEditing(false);
    setSaving(false);
    setSuccess(t('Tallennettu!', 'Saved!'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) return;
    setSaving(true);
    const ok = await changePassword(passwords.current, passwords.new);
    setSaving(false);
    if (ok) {
      setPasswords({ current: '', new: '', confirm: '' });
      setSuccess(t('Salasana vaihdettu!', 'Password changed!'));
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(ci => {
      addItem(ci.item, ci.size, ci.toppings, ci.seasonings, ci.quantity);
    });
  };

  const tabs = [
    { id: 'orders', icon: <Package size={18} />, label: t('Omat Tilaukset', 'My Orders') },
    { id: 'profile', icon: <User size={18} />, label: t('Profiili', 'Profile') },
    { id: 'password', icon: <Lock size={18} />, label: t('Salasana', 'Password') },
  ];

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">{t('Oma Tili', 'My Account')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('Tervetuloa', 'Welcome')}, {user.name.split(' ')[0]}!</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Mobile tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setTab(tab.id as any)} className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${tabs.find(t => t.id === tab.id)?.id === tab.id ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <nav className="bg-gray-900 border border-white/5 rounded-xl p-3 sticky top-24">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === t.id ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 mt-2">
                <LogOut size={18} />{t('Kirjaudu Ulos', 'Logout')}
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div>
            {success && <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 mb-4 text-green-400 text-sm">{success}</div>}

            {tab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-gray-900 border border-white/5 rounded-xl p-8 text-center">
                    <Package size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{t('Ei tilauksia', 'No orders yet')}</p>
                  </div>
                ) : (
                  orders.map(order => (
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
                          <span key={i} className="text-gray-300 text-xs bg-gray-800 px-2 py-1 rounded">{language === 'fi' ? ci.item.nameFi : ci.item.name} x{ci.quantity}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">€{order.total.toFixed(2)}</span>
                        <button onClick={() => handleReorder(order)} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-medium">
                          <RefreshCw size={14} />{t('Tilaa Uudelleen', 'Reorder')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold">{t('Profiilin Tiedot', 'Profile Details')}</h2>
                  {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs"><Edit2 size={14} />{t('Muokkaa', 'Edit')}</button>}
                </div>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">{t('Nimi', 'Name')}</label>
                      <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">{t('Puhelin', 'Phone')}</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm"><Check size={14} />{t('Tallenna', 'Save')}</button>
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm"><X size={14} />{t('Peruuta', 'Cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">{t('Nimi', 'Name')}</span><span className="text-white">{user.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('Sähköposti', 'Email')}</span><span className="text-white">{user.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('Puhelin', 'Phone')}</span><span className="text-white">{user.phone}</span></div>
                  </div>
                )}
              </div>
            )}

            {tab === 'password' && (
              <div className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <h2 className="text-white font-bold mb-4">{t('Vaihda Salasana', 'Change Password')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Nykyinen salasana', 'Current Password')}</label>
                    <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Uusi salasana', 'New Password')}</label>
                    <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">{t('Vahvista uusi salasana', 'Confirm New Password')}</label>
                    <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <button onClick={handleChangePassword} disabled={saving || !passwords.current || !passwords.new || passwords.new !== passwords.confirm} className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">{t('Tallenna', 'Save')}</button>
                </div>
              </div>
            )}

            {/* Mobile logout */}
            <button onClick={logout} className="lg:hidden flex items-center gap-2 mt-6 text-gray-400 hover:text-red-400 text-sm">
              <LogOut size={18} />{t('Kirjaudu Ulos', 'Logout')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
