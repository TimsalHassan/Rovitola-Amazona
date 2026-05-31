import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(form.email, form.password);
    setLoading(false);
    if (success) {
      navigate(from === '/checkout' ? '/checkout' : '/account', { replace: true });
    } else {
      setError(t('Kirjautuminen epäonnistui', 'Login failed'));
    }
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white text-center mb-6">{t('Kirjaudu Sisään', 'Login')}</h1>

          {from === '/checkout' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-5 text-center">
              <p className="text-amber-400 text-sm">{t('Kirjaudu täyttääksesi tilauksen.', 'Please login to complete your order.')}</p>
            </div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5"><p className="text-red-400 text-sm text-center">{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Sähköposti', 'Email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">{t('Salasana', 'Password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full" /> : <ArrowRight size={16} />}
              {t('Kirjaudu', 'Login')}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <Link to="/register" className="text-amber-400 hover:text-amber-300 text-sm">{t('Ei tiliä? Rekisteröidy', "Don't have an account? Register")}</Link>
            <br />
            <Link to="/forgot-password" className="text-gray-500 hover:text-gray-400 text-xs">{t('Unohditko salasanan?', 'Forgot password?')}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
