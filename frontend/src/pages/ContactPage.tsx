import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useLanguage } from "../hooks/useLanguage";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', phone: '', subject: 'general', message: '' });
  };

  return (
    <main className="bg-gray-950 min-h-screen pt-16">
      <div className="bg-gray-900 border-b border-white/5 pt-10 pb-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{t('Yhteystiedot', 'Contact Us')}</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">{t('Lähetä Viesti', 'Send a Message')}</h2>
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-green-400" />
                </div>
                <p className="text-white font-semibold mb-1">{t('Viesti lähetetty!', 'Message Sent!')}</p>
                <p className="text-gray-400 text-sm">{t('Olemme yhteydessä pian.', 'We\'ll get back to you soon.')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">{t('Koko nimi', 'Full Name')}</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{t('Sähköposti', 'Email')}</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{t('Puhelin', 'Phone')}</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">{t('Aihe', 'Subject')}</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors">
                    <option value="general">{t('Yleinen kysely', 'General Inquiry')}</option>
                    <option value="order">{t('Tilausongelma', 'Order Issue')}</option>
                    <option value="feedback">{t('Palaute', 'Feedback')}</option>
                    <option value="partnership">{t('Kumppanuus', 'Partnership')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">{t('Viesti', 'Message')}</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full bg-gray-800 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors" />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors">{t('Lähetä Viesti', 'Send Message')}</button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">{t('Ravintolan Tiedot', 'Restaurant Info')}</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{t('Osoite', 'Address')}</p>
                    <p className="text-gray-400">Aleksanterinkatu 3</p>
                    <p className="text-gray-400">15110 Lahti, Finland</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{t('Puhelin', 'Phone')}</p>
                    <a href="tel:+358037333366" className="text-gray-400 hover:text-amber-400">+358 037 333 366</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{t('Sähköposti', 'Email')}</p>
                    <a href="mailto:info@ravintolaamazona.fi" className="text-gray-400 hover:text-amber-400">info@ravintolaamazona.fi</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Clock size={18} className="text-amber-400" />{t('Aukioloajat', 'Opening Hours')}</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Maanantai', 'Monday')}</td><td className="py-2 text-gray-300 text-right">15:00 – 03:00</td></tr>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Tiistai', 'Tuesday')}</td><td className="py-2 text-gray-300 text-right">15:00 – 03:00</td></tr>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Keskiviikko', 'Wednesday')}</td><td className="py-2 text-gray-300 text-right">11:00 – 03:45</td></tr>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Torstai', 'Thursday')}</td><td className="py-2 text-gray-300 text-right">11:00 – 03:45</td></tr>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Perjantai', 'Friday')}</td><td className="py-2 text-gray-300 text-right">11:00 – 03:45</td></tr>
                  <tr className="border-b border-white/5"><td className="py-2 text-gray-400">{t('Lauantai', 'Saturday')}</td><td className="py-2 text-gray-300 text-right">11:00 – 03:45</td></tr>
                  <tr><td className="py-2 text-gray-400">{t('Sunnuntai', 'Sunday')}</td><td className="py-2 text-gray-300 text-right">11:00 – 03:45</td></tr>
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-amber-400 text-xs font-medium">{t('Lounas Ma-Pe:', 'Lunch Mon-Fri:')} 10:30 – 14:30</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{t('Kartta', 'Map')} (Google Maps)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
