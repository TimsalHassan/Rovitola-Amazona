import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t('Salasanat eivät täsmää', 'Passwords do not match'));
      return;
    }
    setLoading(true);
    const success = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (success) {
      navigate('/account');
    } else {
      setError(t('Rekisteröinti epäonnistui', 'Registration failed'));
    }
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white text-center mb-6">{t('Rekisteröidy', 'Register')}</h1>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5"><p className="text-red-400 text-sm text-center">{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Koko nimi', 'Full Name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Sähköposti', 'Email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Puhelin', 'Phone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Salasana', 'Password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Vahvista salasana', 'Confirm Password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" required value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full" /> : <ArrowRight size={16} />}
              {t('Rekisteröidy', 'Register')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400">
            {t('On jo tili?', 'Have an account?')} <Link to="/login" className="text-amber-400 hover:text-amber-300">{t('Kirjaudu', 'Login')}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
