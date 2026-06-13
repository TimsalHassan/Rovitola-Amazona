import { useLanguage } from "../hooks/useLanguage";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const content = {
  fi: {
    title: "Toimitusehdot",
    lastUpdated: "Viimeksi päivitetty: 2026",
    backToHome: "Takaisin etusivulle",
    sections: [
      {
        heading: "Yleistä",
        body: "Ravintola Amazona (3299425-7) myy tuotteita yksityishenkilöille Suomessa. Pidätämme oikeuden muuttaa toimitusehtoja ja hintoja. Tuotteiden hinnat sisältävät arvonlisäveron.",
      },
      {
        heading: "Verkkokaupan yhteystiedot",
        body: "Sähköposti: [info@ravintolaamazona.fi](mailto:info@ravintolaamazona.fi)\nPuhelin: +358 037333366 ; +358 40 809 9885\nPostiosoite: Aleksanterinkatu 3, 15110 Lahti, Finland",
      },
      {
        heading: "Tilaaminen",
        body: "Tilattavat tuotteet valitaan verkkosivustolla lisäämällä ne ostoskoriin. Tilaus lähetetään maksamalla ostoskorin sisältö verkkokaupan kassatoiminnossa. Tilausta tehdessäsi hyväksyt nämä toimitusehdot, tuotteiden hinnat ja toimituskulut. Jos tilauksen yhteydessä annetaan sähköpostiosoite, tilausvahvistus lähetetään sähköpostitse. Tilausvahvistuksessa ilmoitetaan tilatut tuotteet ja hinta.",
      },
      {
        heading: "Maksaminen",
        body: "Verkkokaupan maksuvälittäjänä toimii Paytrail Oyj (Y-tunnus 2122839-7), joka on rekisteröity Finanssivalvonnan ylläpitämään maksulaitosrekisteriin. Maksaminen tapahtuu Paytrailin verkkopalvelun kautta, ja maksunsaajana tiliotteella ja laskulla näkyy Paytrail tai Paytrail Oyj. Paytrail välittää maksut verkkokauppiaalle. Maksaminen on turvallista, sillä kaikki maksutapahtumaa koskevat tiedot välitetään salattua yhteyttä käyttäen niin, ettei ulkopuolinen taho näe maksutapahtuman tietoja.\n\nLue lisää Paytrailista: https://www.paytrail.com",
      },
      {
        heading: "Maksutavat",
        body: "Paytrail-palvelun kautta voit maksaa verkkopankkitunnuksilla, maksukorteilla (credit/debit), MobilePaylla sekä muilla Paytrailin tarjoamilla maksutavoilla. Käytettävissä olevat maksutavat näytetään kassalla tilauksen yhteydessä.",
      },
      {
        heading: "Toimitus",
        body: "Tilaukset toimitetaan arkisin. Varastosta toimitettavien tuotteiden toimitusaika on yleensä 3–5 arkipäivää. Jos toimitettavat tuotteet ovat tilaustuotteita, toimitusaika on yleensä 1–3 viikkoa. Toimituskulut määräytyvät valitun toimitustavan, mahdollisten lisäpalvelujen sekä tilauksen painon ja koon mukaan. Toimituskulut näet verkkokaupan kassatoiminnossa ennen tilauksen lopullista hyväksymistä.",
      },
      {
        heading: "Palautukset",
        body: "Verkkokaupan asiakkaalla on kuluttajansuojalain mukainen 14 päivän vaihto- ja palautusoikeus. Asiakkaalla on oikeus vaihtaa tai palauttaa osa tai kaikki tilauksen tuotteet. Palautettavien tai vaihdettavien tuotteiden tulee olla alkuperäispakkauksessa ja myyntikunnossa. Jos haluat palauttaa tai vaihtaa tuotteita, ota ensin yhteyttä verkkokauppaan ja pyydä palautusohjeet.",
      },
      {
        heading: "Tilauksen peruutus, virhevastuut ja reklamaatiot",
        body: "Ennen tilauksen toimittamista voit peruuttaa sen lähettämällä kirjallisen ilmoituksen sähköpostitse.\n\nVerkkokaupalla on lakisääteinen vastuu myytyjen tuotteiden virheistä. Reklamaatiotapauksessa ota yhteyttä asiakaspalveluumme. Kuluttajalla on oikeus saattaa mahdolliset riidat kuluttajariitalautakunnan ratkaistavaksi.",
      },
      {
        heading: "Paytrail-maksupalvelun yhteystiedot",
        body: "Paytrail Oyj (Y-tunnus 2122839-7)\nInnova 2\nLutakonaukio 7\n40100 Jyväskylä\nSuomi\n\nVerkkosivusto: https://www.paytrail.com",
      },
    ],
  },

  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: 2026",
    backToHome: "Back to home",
    sections: [
      {
        heading: "General",
        body: "Restaurant Amazona (3299425-7) sells products to private individuals in Finland. We reserve the right to change delivery terms and prices. Product prices include VAT.",
      },
      {
        heading: "Online Store Contact Information",
        body: "Email: info@ravintolaamazona.fi\nPhone: +358 037333366 ; +358 40 809 9885\nPostal address: Aleksanterinkatu 3, 15110 Lahti, Finland",
      },
      {
        heading: "Ordering",
        body: "Products are selected on the website by adding them to the shopping cart. The order is placed by paying for the contents of the shopping cart at checkout. By placing an order, you accept these delivery terms, product prices and delivery costs. If an email address is provided at the time of ordering, an order confirmation will be sent by email indicating the ordered products and price.",
      },
      {
        heading: "Payment",
        body: "The payment intermediary for the online store is Paytrail Oyj (business ID 2122839-7), which is registered in the payment institution register maintained by the Finnish Financial Supervisory Authority. Payment is made via Paytrail's online service, and the recipient of the payment appears on the bank statement and invoice as Paytrail or Paytrail Oyj. Paytrail forwards payments to the online merchant. Payment is secure, as all information regarding the payment transaction is transmitted using an encrypted connection so that no outside party can see the payment transaction information.\n\nRead more about Paytrail: https://www.paytrail.com",
      },
      {
        heading: "Payment Methods",
        body: "Through the Paytrail service, you can pay using online banking credentials, payment cards (credit/debit), MobilePay, and other payment methods offered by Paytrail. Available payment methods are displayed at checkout when placing your order.",
      },
      {
        heading: "Delivery",
        body: "Orders are shipped on weekdays. The delivery time for products delivered from stock is usually 3–5 business days. If the products are made-to-order, the delivery time is usually 1–3 weeks. Shipping costs are determined by the selected delivery method, any additional services, and the weight and size of the order. You can see the shipping costs at checkout before the final approval of the order.",
      },
      {
        heading: "Returns",
        body: "The online store customer has a 14-day right of exchange and return in accordance with the Consumer Protection Act. The customer has the right to exchange or return some or all of the products in the order. The products to be returned or exchanged must be in their original packaging and in saleable condition. If you wish to return or exchange products, please first contact the online store and ask for return instructions.",
      },
      {
        heading: "Order Cancellation, Liability for Errors and Complaints",
        body: "Before the order is delivered, you can cancel it by sending a written notification via email.\n\nThe online store has statutory liability for defects in the products sold. In case of complaints, please contact our customer service. The consumer has the right to refer any disputes to the Consumer Disputes Board for resolution.",
      },
      {
        heading: "Paytrail Payment Service Contact Information",
        body: "Paytrail Oyj (Business ID 2122839-7)\nInnova 2\nLutakonaukio 7\n40100 Jyväskylä\nFinland\n\nWebsite: https://www.paytrail.com",
      },
    ],
  },
};

export default function TermsPage() {
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
            <FileText size={22} className="text-amber-400" />
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
