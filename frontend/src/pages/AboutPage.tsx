import { MapPin, Clock, Utensils, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from "../hooks/useLanguage";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">{t('Tietoa Meistä', 'About Us')}</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-72 rounded-xl overflow-hidden">
            <img src="https://images.pexels.com/photos/1651167/pexels-photo-1651167.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Restaurant" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('Tervetuloa Ravintola Amazonaan', 'Welcome to Ravintola Amazona')}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('Ravintola Amazona on Lahden suosituin pizzeria ja kebab-ravintola. Perustettu vuonna 2010, olemme palvelleet asiakkaitamme laadukkailla raaka-aineilla ja aidoilla resepteillä. Tarjoamme parhaat pizzat, kebabit ja kanaruokia Lahti.', 'Ravintola Amazona is Lahti\'s most popular pizzeria and kebab restaurant. Founded in 2010, we have served our customers with quality ingredients and authentic recipes. We offer the best pizzas, kebabs and chicken dishes in Lahti.')}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('Teemme kaiken ruoan tuoreista raaka-aineista joka päivä. Meidän tavoitteemme on tarjota parasta laatua ja palvelua.', 'We make all our food from fresh ingredients every day. Our goal is to provide the best quality and service.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><Clock size={16} className="text-amber-400" />{t('Perustettu 2010', 'Est. 2010')}</span>
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><MapPin size={16} className="text-amber-400" />{t('Lahti, Suomi', 'Lahti, Finland')}</span>
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><Utensils size={16} className="text-amber-400" />{t('Pizza & Kebab', 'Pizza & Kebab')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><UtensilsCrossed size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t('Laadukkaat Raaka-aineet', 'Quality Ingredients')}</h3>
            <p className="text-gray-400 text-xs">{t('Käytämme vain tuoreita ja korkealaatuisia raaka-aineita.', 'We use only fresh and high-quality ingredients.')}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><Clock size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t('Nopea Toimitus', 'Fast Delivery')}</h3>
            <p className="text-gray-400 text-xs">{t('Toimitus 30-45 minuutissa.', 'Delivery in 30-45 minutes.')}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><MapPin size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t('Keskellä Lahtea', 'Central Lahti Location')}</h3>
            <p className="text-gray-400 text-xs">{t('Aleksanterinkatu 3, helposti saavutettavissa.', 'Aleksanterinkatu 3, easily accessible.')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
