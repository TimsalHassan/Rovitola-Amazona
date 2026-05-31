import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Truck, Percent, ChevronRight, Smartphone, Star, ArrowRight, Quote, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { isRestaurantOpen } from '../utils/openingHours';

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const open = isRestaurantOpen();
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  const features = [
    { icon: <Truck size={22} className="text-amber-400" />, title: t('Nopea Toimitus', 'Fast Delivery'), desc: t('Ilmainen toimitus alle 9km. €4 yli 9km matkoille.', 'Free delivery under 9km. €4 for over 9km.') },
    { icon: <Percent size={22} className="text-amber-400" />, title: t('5% Alennus', '5% Discount'), desc: t('5% alennus kaikista tilauksista automaattisesti.', '5% discount on every order automatically.') },
    { icon: <Clock size={22} className="text-amber-400" />, title: t('Minimitilaus', 'Minimum Order'), desc: t('Vähintään €13 tilaukset toimitetaan.', 'Minimum €13 orders are delivered.') },
  ];

  const offers = [
    { title: t('Kebab + Pizza Combo', 'Kebab + Pizza Combo'), desc: t('Valitse mikä tahansa kebab-annos ja pizza.', 'Choose any kebab and pizza.'), price: '€24.90', badge: t('Suosittu', 'Popular'), image: 'https://images.pexels.com/photos/4958776/pexels-photo-4958776.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: t('Perhe-paketti', 'Family Pack'), desc: t('2 pizzaa + 2 kebab-annosta + 4 juomaa.', '2 pizzas + 2 kebabs + 4 drinks.'), price: '€44.90', badge: t('Arvo', 'Value'), image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { title: t('Lounas-deal', 'Lunch Deal'), desc: t('Ke-Su 11:00-15:00. Pita + juoma.', 'Wed-Sun 11:00-15:00. Pita + drink.'), price: '€10.90', badge: t('Lounas', 'Lunch'), image: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

  const reviews = [
    { name: 'Mikko P.', rating: 5, text: t('Paras kebab Lahdessa! Nopeaa toimitus ja ruoka aina tuoretta.', 'Best kebab in Lahti! Fast delivery and food always fresh.'), date: '15.5.2024' },
    { name: 'Anna K.', rating: 5, text: t('Amazona-pizza on rehellisesti parasta pizzaa mitä olen syönyt.', 'Amazona pizza is honestly the best pizza I\'ve ever had.'), date: '10.5.2024' },
    { name: 'Juhani V.', rating: 4, text: t('Erinomainen valikoima ja hinnat kohdillaan.', 'Excellent selection and prices are right.'), date: '3.5.2024' },
  ];

  const handleReviewSubmit = () => {
    setReviewModal(false);
    setReviewForm({ rating: 5, text: '' });
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=1600')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className={`w-2 h-2 rounded-full ${open ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-white text-sm font-medium">{open ? t('Nyt Auki', 'Currently Open') : t('Suljettu nyt', 'Currently Closed')}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Ravintola <span className="text-amber-400">Amazona</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-2 font-light">{t('Aitojen makujen ravintola Lahden sydämessä', 'Authentic flavors in the heart of Lahti')}</p>
          <p className="text-gray-400 mb-10">{t('Parhaat pizzat ja kebabit Lahti.', 'Best pizzas and kebabs in Lahti.')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/menu" className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-amber-500/30 text-base">
              {t('Tilaa Nyt', 'Order Now')}<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/menu" className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/20 text-base">
              {t('Katso Ruokalista', 'View Menu')}
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="bg-gray-950 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="bg-gray-900 py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('Erikoistarjoukset', 'Special Offers')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offers.map((o, i) => (
              <div key={i} className="bg-gray-950 border border-white/5 rounded-xl overflow-hidden group">
                <div className="relative h-36 overflow-hidden">
                  <img src={o.image} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
                  <span className="absolute top-2 left-2 bg-amber-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">{o.badge}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-1">{o.title}</h3>
                  <p className="text-gray-400 text-xs mb-3">{o.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-400">{o.price}</span>
                    <Link to="/menu" className="text-amber-400 hover:text-amber-300 text-xs font-semibold">{t('Tilaa', 'Order')}<ChevronRight size={14} className="inline ml-0.5" /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-gray-950 py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64 md:h-80 rounded-xl overflow-hidden">
              <img src="https://images.pexels.com/photos/1651167/pexels-photo-1651167.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Restaurant" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('Tietoa Ravintola Amazonasta', 'About Ravintola Amazona')}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t('Ravintola Amazona on Lahden suosituin pizzeria ja kebab-ravintola. Perustettu vuonna 2010, olemme palvelleet asiakkaitamme laadukkailla raaka-aineilla ja aidoilla resepteillä. Tarjoamme parhaat pizzat, kebabit ja kanaruokia Lahti.', 'Ravintola Amazona is the most popular pizzeria and kebab restaurant in Lahti. Founded in 2010, we have served our customers with quality ingredients and authentic recipes. We offer the best pizzas, kebabs and chicken dishes in Lahti.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300">{t('Perustettu 2010', 'Est. 2010')}</span>
                <span className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300">{t('Lahti, Suomi', 'Lahti, Finland')}</span>
                <span className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300">{t('Pizza & Kebab', 'Pizza & Kebab')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-gray-900 py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('Asiakaspalautteet', 'Customer Reviews')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-gray-950 border border-white/5 rounded-xl p-5">
                <Quote size={20} className="text-amber-400/40 mb-3" />
                <div className="flex gap-0.5 mb-2">{[...Array(r.rating)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-semibold text-xs">{r.name}</span>
                  <span className="text-gray-500 text-xs">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            {user ? (
              <button onClick={() => setReviewModal(true)} className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                {t('Jätä Arvostelu', 'Leave a Review')}
              </button>
            ) : (
              <Link to="/login" className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-6 py-2.5 rounded-lg text-sm inline-block transition-colors">
                {t('Kirjaudu jättääksesi arvostelu', 'Login to Leave Review')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="bg-gray-950 py-14">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('Lataa Sovellus', 'Download the App')}</h2>
              <p className="text-gray-400 mb-6">{t('Tilaa helpommin mobiilisovelluksella.', 'Order easier with our mobile app.')}</p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                <a href="#" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-left"><div className="text-xs text-gray-400">{t('Lataa', 'Download on')}</div><div className="font-semibold text-sm text-white">App Store</div></div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M3.18 23.76c.3.17.64.21.97.13l12.08-6.98-2.62-2.62-10.43 9.47zM.35 1.18C.13 1.5 0 1.95 0 2.52v18.95c0 .57.13 1.03.36 1.35l.07.07 10.62-10.62v-.25L.42 1.11l-.07.07zM20.69 10.41l-2.9-1.67-2.94 2.94 2.94 2.94 2.91-1.68c.83-.48.83-1.26-.01-1.53zM3.18.24l12.11 6.99-2.62 2.62L2.24.38C2.55.1 2.89.07 3.18.24z" fill="#EA4335"/></svg>
                  <div className="text-left"><div className="text-xs text-gray-400">{t('Lataa', 'Get it on')}</div><div className="font-semibold text-sm text-white">Google Play</div></div>
                </a>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <Smartphone size={120} className="text-amber-400/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">{t('Jätä Arvostelu', 'Leave a Review')}</h3>
              <button onClick={() => setReviewModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Arvosana', 'Rating')}</label>
                <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setReviewForm(f => ({...f, rating: n}))} className={`p-1 ${reviewForm.rating >= n ? 'text-amber-400' : 'text-gray-500'}`}><Star size={20} className="fill-current" /></button>)}</div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Arvostelu', 'Review')}</label>
                <textarea value={reviewForm.text} onChange={e => setReviewForm(f => ({...f, text: e.target.value}))} rows={4} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none" placeholder={t('Kirjoita arvostelu...', 'Write your review...')} />
              </div>
              <button onClick={handleReviewSubmit} className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors">{t('Lähetä', 'Submit')}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
