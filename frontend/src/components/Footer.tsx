import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useRestaurant } from "../context/RestaurantContext";
import Logo from "./Logo";

function formatTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

export default function Footer() {
  const { t } = useLanguage();
  const { info, isOpen, openStatusMessage } = useRestaurant();

  return (
    <footer className="bg-gray-900 border-t border-white/5 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <Logo className='mb-4'/>
            <div className="flex items-center gap-1.5 mb-4">
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-xs text-gray-400">{openStatusMessage}</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t("footer.contactTitle")}</h4>
            <div className="space-y-3 text-sm">
              {info?.address && (
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin size={15} className="text-amber-400 mt-0.5 shrink-0" />
                  <span>{info.address}</span>
                </div>
              )}
              {info?.phone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone size={15} className="text-amber-400 shrink-0" />
                  <a href={`tel:${info.phone}`} className="hover:text-amber-400 transition-colors">{info.phone}</a>
                </div>
              )}
              {info?.phone_2 && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone size={15} className="text-amber-400 shrink-0" />
                  <a href={`tel:${info.phone_2}`} className="hover:text-amber-400 transition-colors">{info.phone_2}</a>
                </div>
              )}
              {info?.email && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail size={15} className="text-amber-400 shrink-0" />
                  <a href={`mailto:${info.email}`} className="hover:text-amber-400 transition-colors">{info.email}</a>
                </div>
              )}
            </div>
          </div>

          {/* Opening hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              {t("contact.openingHoursTitle")}
            </h4>
            <div className="space-y-1.5 text-xs">
              {info?.opening_hours.map((row) => (
                <div key={row.day} className="flex justify-between gap-4">
                  <span className="text-gray-400 capitalize">{t(`footer.days.${row.day}`)}</span>
                  <span className="text-gray-300">
                    {row.is_closed
                      ? <span className="text-red-400">{t("contact.closed") ?? "Closed"}</span>
                      : `${formatTime(row.open_time)} – ${formatTime(row.close_time)}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t("footer.linksTitle")}</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/menu" className="text-gray-400 hover:text-amber-400 transition-colors">{t("nav.menu")}</Link>
              <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors">{t("nav.about")}</Link>
              <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">{t("nav.contact")}</Link>
              <Link to="/orders" className="text-gray-400 hover:text-amber-400 transition-colors">{t("nav.orders")}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {info?.name ?? "Ravintola Amazona"}. {t("footer.rights")}</p>
          {info?.is_delivery_enabled && (
            <p className="text-amber-500/70">
              {t("footer.deliveryFrom")} €{info.min_order} · {t("footer.deliveryFee")} €{info.delivery_fee}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}