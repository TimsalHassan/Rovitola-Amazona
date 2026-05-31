import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const hours = [
    { day: t('Maanantai', 'Monday'), time: '15:00 – 03:00' },
    { day: t('Tiistai', 'Tuesday'), time: '15:00 – 03:00' },
    { day: t('Keskiviikko', 'Wednesday'), time: '11:00 – 03:45' },
    { day: t('Torstai', 'Thursday'), time: '11:00 – 03:45' },
    { day: t('Perjantai', 'Friday'), time: '11:00 – 03:45' },
    { day: t('Lauantai', 'Saturday'), time: '11:00 – 03:45' },
    { day: t('Sunnuntai', 'Sunday'), time: '11:00 – 03:45' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-white/5 text-gray-400">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Restaurant info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
                <Utensils size={18} className="text-gray-900" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Ravintola</div>
                <div className="text-amber-400 font-bold text-sm">Amazona</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              {t('Lahteen paras pizzeria ja kebab-ravintola. Tuoreita raaka-aineita ja aitoja makuja vuodesta 2010.', 'Lahti\'s best pizzeria and kebab restaurant. Fresh ingredients and authentic flavors since 2010.')}
            </p>
          </div>

          {/* Center - Opening hours */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              {t('Aukioloajat', 'Opening Hours')}
            </h3>
            <div className="space-y-1 text-xs">
              {hours.map(h => (
                <div key={h.day} className="flex justify-between gap-2">
                  <span className="text-gray-500">{h.day}</span>
                  <span className="text-gray-300 font-medium tabular-nums">{h.time}</span>
                </div>
              ))}
            </div>
            <p className="text-amber-400/80 text-xs">{t('Lounas Ma-Pe 10:30-14:30', 'Lunch Mon-Fri 10:30-14:30')}</p>
          </div>

          {/* Right - Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {t('Yhteystiedot', 'Contact')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <span>Aleksanterinkatu 3<br />15110 Lahti, Finland</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400 shrink-0" />
                <a href="tel:+358037333366" className="hover:text-white transition-colors">+358 037 333 366</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-amber-400 shrink-0" />
                <a href="mailto:info@ravintolaamazona.fi" className="hover:text-white transition-colors break-all">info@ravintolaamazona.fi</a>
              </li>
            </ul>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors group" aria-label="Facebook">
                <Facebook size={16} className="text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors group" aria-label="Instagram">
                <Instagram size={16} className="text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-4">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Ravintola Amazona. {t('Kaikki oikeudet pidätetään.', 'All rights reserved.')}</p>
          <Link to="/my-orders" className="hover:text-gray-400">{t('Etsi tilauksesi', 'Find your orders')}</Link>
        </div>
      </div>
    </footer>
  );
}
