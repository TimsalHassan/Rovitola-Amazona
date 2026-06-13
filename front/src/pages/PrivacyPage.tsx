import { useLanguage } from "../hooks/useLanguage";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const content = {
  fi: {
    title: "Tietosuojakäytäntö",
    lastUpdated: "Viimeksi päivitetty: 2026",
    backToHome: "Takaisin etusivulle",
    sections: [
      {
        heading: "Rekisterinpitäjä",
        body: "Ravintola Amazona (Y-tunnus 3299425-7)\nAleksanterinkatu 3, 15110 Lahti\nSähköposti: [info@ravintolaamazona.fi](mailto:info@ravintolaamazona.fi)\nPuhelin: +358 037333366",
      },
      {
        heading: "Kerättävät henkilötiedot",
        body: "Keräämme seuraavia tietoja tilauksen tekemisen yhteydessä:\n– Nimi\n– Puhelinnumero\n– Sähköpostiosoite (valinnainen)\n– Toimitusosoite\n– Tilaus- ja maksutiedot",
      },
      {
        heading: "Henkilötietojen käyttötarkoitus",
        body: "Käytämme kerättyjä tietoja seuraaviin tarkoituksiin:\n– Tilausten käsittelyyn ja toimittamiseen\n– Tilausvahvistusten lähettämiseen\n– Asiakaspalvelun toteuttamiseen\n– Lakisääteisten velvoitteiden täyttämiseen",
      },
      {
        heading: "Tietojen säilytys",
        body: "Säilytämme henkilötietoja niin kauan kuin se on tarpeen tilauksen käsittelyn ja lakisääteisten velvoitteiden täyttämiseksi. Kirjanpitoon liittyvät tiedot säilytetään kirjanpitolain mukaisen ajan (6 vuotta).",
      },
      {
        heading: "Tietojen luovuttaminen",
        body: "Emme myy tai luovuta henkilötietojasi kolmansille osapuolille, lukuun ottamatta:\n– Paytrail Oyj: maksutapahtumien käsittelyä varten\n– Toimitusjärjestelmät: tilauksen toimittamiseksi\n\nKaikki kolmannet osapuolet on velvoitettu käsittelemään tietoja tietosuojalainsäädännön mukaisesti.",
      },
      {
        heading: "Evästeet",
        body: "Verkkosivustomme voi käyttää evästeitä käyttäjäkokemuksen parantamiseksi ja kieliasetuksen tallentamiseksi. Evästeet eivät sisällä henkilökohtaisia tunnistetietoja.",
      },
      {
        heading: "Rekisteröidyn oikeudet",
        body: `Sinulla on oikeus:\n– Saada tietoa henkilötietojesi käsittelystä\n– Tarkastaa itseäsi koskevat tiedot\n– Vaatia virheellisten tietojen oikaisemista\n– Vaatia tietojesi poistamista ("oikeus tulla unohdetuksi")\n– Vastustaa tietojesi käsittelyä markkinointitarkoituksiin\n\nPyyntöjä voi lähettää sähköpostitse osoitteeseen [info@ravintolaamazona.fi](mailto:info@ravintolaamazona.fi)`,
      },
      {
        heading: "Tietoturva",
        body: "Suojaamme henkilötietosi asianmukaisin teknisin ja organisatorisin toimenpitein luvattomalta pääsyltä, muuttamiselta tai paljastamiselta. Maksutiedot välitetään aina salattua yhteyttä (SSL/TLS) käyttäen.",
      },
      {
        heading: "Muutokset tietosuojakäytäntöön",
        body: "Pidätämme oikeuden päivittää tätä tietosuojakäytäntöä. Merkittävistä muutoksista ilmoitetaan verkkosivustollamme.",
      },
      {
        heading: "Yhteydenotot",
        body: "Tietosuojaan liittyvissä kysymyksissä ota yhteyttä:[ninfo@ravintolaamazona.fi](mailto:ninfo@ravintolaamazona.fi)\nRavintola Amazona, Aleksanterinkatu 3, 15110 Lahti",
      },
    ],
  },

  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: 2026",
    backToHome: "Back to home",
    sections: [
      {
        heading: "Data Controller",
        body: "Restaurant Amazona (Business ID 3299425-7)\nAleksanterinkatu 3, 15110 Lahti, Finland\nEmail: [info@ravintolaamazona.fi](mailto:info@ravintolaamazona.fi)\nPhone: +358 037333366",
      },
      {
        heading: "Personal Data We Collect",
        body: "We collect the following information when you place an order:\n– Name\n– Phone number\n– Email address (optional)\n– Delivery address\n– Order and payment details",
      },
      {
        heading: "Purpose of Data Processing",
        body: "We use the collected data for the following purposes:\n– Processing and delivering orders\n– Sending order confirmations\n– Providing customer service\n– Fulfilling legal obligations",
      },
      {
        heading: "Data Retention",
        body: "We retain personal data for as long as necessary to process your order and fulfil our legal obligations. Accounting-related data is retained for the period required by Finnish accounting law (6 years).",
      },
      {
        heading: "Sharing of Data",
        body: "We do not sell or share your personal data with third parties, except:\n– Paytrail Oyj: for processing payment transactions\n– Delivery systems: to fulfil your order\n\nAll third parties are obligated to handle data in accordance with applicable data protection legislation.",
      },
      {
        heading: "Cookies",
        body: "Our website may use cookies to improve the user experience and to store language preferences. Cookies do not contain personally identifiable information.",
      },
      {
        heading: "Your Rights",
        body: `You have the right to:\n– Be informed about how your personal data is processed\n– Access your personal data\n– Request correction of inaccurate data\n– Request deletion of your data ("right to be forgotten")\n– Object to processing of your data for marketing purposes\n\nRequests can be sent by email to [info@ravintolaamazona.fi](mailto:info@ravintolaamazona.fi)`,
      },
      {
        heading: "Data Security",
        body: "We protect your personal data with appropriate technical and organisational measures against unauthorised access, alteration or disclosure. Payment data is always transmitted using an encrypted connection (SSL/TLS).",
      },
      {
        heading: "Changes to This Privacy Policy",
        body: "We reserve the right to update this privacy policy. Significant changes will be announced on our website.",
      },
      {
        heading: "Contact",
        body: `For privacy-related questions, please contact us:[ninfo@ravintolaamazona.fi](mailto:ninfo@ravintolaamazona.fi)\nRavintola Amazona, Aleksanterinkatu 3, 15110 Lahti, Finland`,
      },
    ],
  },
};

export default function PrivacyPage() {
  const { language } = useLanguage();
  const c = content[language === "fi" ? "fi" : "en"];

  return (
    <main className="min-h-screen bg-gray-950 text-white pt-20 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {c.backToHome}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{c.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{c.lastUpdated}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {c.sections.map((section, i) => (
            <section key={i} className="border-l-2 border-amber-500/20 pl-5">
              <h2 className="text-base font-semibold text-white mb-2">
                {section.heading}
              </h2>
              <div className="space-y-2">
                {section.body.split("\n").map((line, j) =>
                  line.trim() ? (
                    <p
                      key={j}
                      className="text-sm text-gray-400 leading-relaxed"
                    >
                      {line}
                    </p>
                  ) : null,
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            Ravintola Amazona · Aleksanterinkatu 3, 15110 Lahti ·{" "}
            <a
              href="mailto:info@ravintolaamazona.fi"
              className="hover:text-amber-400 transition-colors"
            >
              info@ravintolaamazona.fi
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
