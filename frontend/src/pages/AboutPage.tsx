import { MapPin, Clock, Utensils, UtensilsCrossed } from 'lucide-react';
import { useLanguage } from "../hooks/useLanguage";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">{t("aboutPage.title")}</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-72 rounded-xl overflow-hidden">
            <img src="https://images.pexels.com/photos/1651167/pexels-photo-1651167.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Restaurant" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{t("aboutPage.welcomeTitle")}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t("aboutPage.body1")}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t("aboutPage.body2")}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><Clock size={16} className="text-amber-400" />{t("aboutPage.established")}</span>
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><MapPin size={16} className="text-amber-400" />{t("aboutPage.location")}</span>
              <span className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300"><Utensils size={16} className="text-amber-400" />{t("aboutPage.cuisine")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><UtensilsCrossed size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t("aboutPage.qualityTitle")}</h3>
            <p className="text-gray-400 text-xs">{t("aboutPage.qualityBody")}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><Clock size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t("aboutPage.fastDeliveryTitle")}</h3>
            <p className="text-gray-400 text-xs">{t("aboutPage.fastDeliveryBody")}</p>
          </div>
          <div className="bg-gray-900 border border-white/5 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3"><MapPin size={24} className="text-amber-400" /></div>
            <h3 className="text-white font-bold text-sm mb-1">{t("aboutPage.centralLocationTitle")}</h3>
            <p className="text-gray-400 text-xs">{t("aboutPage.centralLocationBody")}</p>
          </div>
        </div>
        <div className="w-fit mx-auto bg-gray-900 border border-white/5 rounded-2xl p-4 mt-12 flex items-center justify-center overflow-hidden">
          <div className="">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1935.3203894971946!2d25.649473677392145!3d60.98328257754948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x468e2854093965db%3A0xd11ee9ad95e079f8!2sAmazona%20Pizzeria!5e0!3m2!1sen!2s!4v1780817453165!5m2!1sen!2s" width="600" height="450" style={{border:0}} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
