import { createContext, type ReactNode } from "react";
import { Language } from "../types";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const homeResources = {
  fi: {
    home: {
      // Carousel
      order: "Tilaa",
      onSale: "ALE",
      unnamedItem: "Nimeton annos",
      unnamedItemDesc: "Kuvaus puuttuu",
      // Review modal
      leaveReview: "Jätä Arvostelu",
      rating: "Arvosana",
      review: "Arvostelu",
      reviewPlaceholder: "Kirjoita arvostelu...",
      submitting: "Lähetetään...",
      submit: "Lähetä",
      thankYou: "Kiitos arvostelustaasi!",
      // Status pill
      openNow: "Nyt Auki — Tilaa heti!",
      closedNow: "Suljettu nyt",
      // Hero
      heroTagline: "Aitojen makujen ravintola Lahden sydämessä",
      orderNow: "Tilaa Nyt",
      viewMenu: "Katso Ruokalista",
      scrollDown: "Vieritä alas",
      // Features strip
      fastDelivery: "Nopea Toimitus",
      fastDeliveryDesc: "Ilmainen alle 9km • €4 yli 9km",
      discount: "5% Alennus",
      discountDesc: "Automaattinen alennus jokaisesta tilauksesta",
      deliveryTime: "~60 min toimitus",
      deliveryTimeDesc: "Minimitilaus €13 • Max 14km säde",
      // Carousel section
      fromMenu: "Ruokalistalta",
      popularDishes: "Suosituimmat annokset",
      newSelectionEveryVisit: "Uusi järjestys joka latauskerralla",
      fullMenu: "Koko ruokalista",
      emptyMenuTitle: "Ei näytettäviä annoksia",
      emptyMenuBody:
        "Ruokalista päivittyy pian. Tarkista uudelleen hetken päästä.",
      // About
      aboutUs: "Tietoa meistä",
      yearsInLahti: "vuotta Lahdessa",
      aboutHeading: "Lahden sydämessä\nvuodesta 2010",
      aboutBody:
        "Ravintola Amazona on Lahden suosituin pizzeria ja kebab-ravintola. Perustettu vuonna 2010, olemme palvelleet asiakkaitamme laadukkailla raaka-aineilla ja aidoilla resepteillä yli 14 vuoden ajan.",
      menuItems: "Annokset",
      categories: "Kategoriat",
      delivery: "Toimitus",
      minOrder: "Minitilaus",
      menu: {
        title: "Ruokalista",
        mainTab: "Pääruokalista",
        lunchTab: "Lounaslista",
        add: "Lisää",
        unavailable: "Ei saatavilla",
        size: "Koko",
        sizeSmall: "Pieni",
        sizeMedium: "Keski",
        sizeLarge: "Suuri",
        extraToppings: "Lisäkkeet",
        extraSeasonings: "Mausteet",
        free: "Ilmainen",
        quantity: "Määrä",
        total: "Yhteensä",
        addToCart: "Lisää Koriin",
        cart: "Ostoskori",
        emptyTitle: "Tuotteita tulossa pian",
        emptyBody: "Tämä kategoria avataan pian.",
        lunchUnavailable: "Ei saatavilla",
        loadMore: "Lataa lisää",
        remaining: "jäljellä",
        lunchAvailable: "Lounas saatavilla",
        lunchHours: "Maanantai - Perjantai 10:30 - 14:30",
        noItemsTitle: "Ruokalista päivittyy",
        noItemsBody: "Annoksia lisätään pian. Tarkista uudelleen myöhemmin.",
      },
      // Reviews
      reviewsLabel: "Asiakaspalautteet",
      reviewsHeading: "Mitä asiakkaamme sanovat",
      signInToReview: "Kirjaudu arvostellaksesi",
      review1:
        "Paras kebab Lahdessa! Nopeaa toimitus ja ruoka aina tuoretta.",
      review2:
        "Amazona-pizza on rehellisesti parasta pizzaa mitä olen syönyt.",
      review3: "Erinomainen valikoima ja hinnat kohdillaan.",
      // App download
      mobileApp: "Sovellus",
      orderEasier: "Tilaa helpommin",
      downloadDesc: "Lataa sovellus ja tilaa suoraan puhelimellasi.",
      downloadOn: "Lataa",
      // Opening hours
      openingHours: "Aukioloajat",
      monTue: "Ma–Ti",
      wedSun: "Ke–Su",
      wedFri: "Ke–Pe",
      // Footer
      footer: {
        brandPrefix: "Ravintola",
        brandName: "Amazona",
        description:
          "Lahteen paras pizzeria ja kebab-ravintola. Tuoreita raaka-aineita ja aitoja makuja vuodesta 2010.",
        openingHours: "Aukioloajat",
        lunch: "Lounas Ma-Pe 10:30-14:30",
        contact: "Yhteystiedot",
        addressLine1: "Aleksanterinkatu 3",
        addressLine2: "15110 Lahti, Finland",
        rights: "Kaikki oikeudet pidätetään.",
        findOrders: "Etsi tilauksesi",
        days: {
          monday: "Maanantai",
          tuesday: "Tiistai",
          wednesday: "Keskiviikko",
          thursday: "Torstai",
          friday: "Perjantai",
          saturday: "Lauantai",
          sunday: "Sunnuntai",
        },
      },
      menuItem: {
        backToMenu: "Takaisin ruokalistaan",
        notFoundTitle: "Annoksen tiedot puuttuvat",
        notFoundBody:
          "Tätä annosta ei löytynyt. Se on voinut poistua ruokalistalta.",
        details: "Annoksen tiedot",
        lunchItem: "Lounasannos",
        available: "Saatavilla",
        unavailable: "Ei saatavilla",
        uncategorized: "Muut",
        extrasTitle: "Lisukkeet ja valinnat",
        extrasSubtitle: "Mukauta annos helposti",
        unnamedExtra: "Lisukkeet",
        choice: "Valinta",
        addon: "Lisä",
        required: "Pakollinen",
        optional: "Valinnainen",
        maxSelections: "Enintään {{count}} valintaa",
        included: "Sisältyy",
        unnamedOption: "Vaihtoehto",
        noExtrasTitle: "Ei lisukkeita",
        noExtrasBody: "Tähän annokseen ei ole lisukkeita juuri nyt.",
        reviewsTitle: "Arvostelut",
        reviewsSubtitle: "Mitä asiakkaat sanovat",
        noReviewsTitle: "Ei arvosteluja vielä",
        noReviewsBody: "Ole ensimmäinen, joka arvioi tämän annoksen.",
        addToCart: "Lisää koriin",
      },
    },
  },
  en: {
    home: {
      order: "Order",
      onSale: "SALE",
      unnamedItem: "Unnamed item",
      unnamedItemDesc: "Description not available",
      leaveReview: "Leave a Review",
      rating: "Rating",
      review: "Review",
      reviewPlaceholder: "Write your review...",
      submitting: "Submitting...",
      submit: "Submit",
      thankYou: "Thanks for your review!",
      openNow: "Open Now — Order Now!",
      closedNow: "Currently Closed",
      heroTagline: "Authentic flavors in the heart of Lahti",
      orderNow: "Order Now",
      viewMenu: "View Menu",
      scrollDown: "Scroll down",
      fastDelivery: "Fast Delivery",
      fastDeliveryDesc: "Free under 9km • €4 over 9km",
      discount: "5% Off Every Order",
      discountDesc: "Automatic discount on every order",
      deliveryTime: "~60 min delivery",
      deliveryTimeDesc: "Min order €13 • Max 14km radius",
      fromMenu: "From the menu",
      popularDishes: "Popular dishes",
      newSelectionEveryVisit: "A new selection every time you visit",
      fullMenu: "Full menu",
      emptyMenuTitle: "No items to show",
      emptyMenuBody: "The menu will be back soon. Please check again later.",
      aboutUs: "About us",
      yearsInLahti: "years in Lahti",
      aboutHeading: "In the heart of Lahti\nsince 2010",
      aboutBody:
        "Ravintola Amazona is Lahti's most popular pizzeria and kebab restaurant. Founded in 2010, we have served our customers with quality ingredients and authentic recipes for over 14 years.",
      menuItems: "Menu items",
      categories: "Categories",
      delivery: "Delivery",
      minOrder: "Min. order",
      menu: {
        title: "Menu",
        mainTab: "Main Menu",
        lunchTab: "Lunch Menu",
        add: "Add",
        unavailable: "Not available",
        size: "Size",
        sizeSmall: "Small",
        sizeMedium: "Medium",
        sizeLarge: "Large",
        extraToppings: "Extra Toppings",
        extraSeasonings: "Extra Seasonings",
        free: "Free",
        quantity: "Quantity",
        total: "Total",
        addToCart: "Add to Cart",
        cart: "Cart",
        emptyTitle: "Items coming soon",
        emptyBody: "This category will open soon.",
        lunchUnavailable: "Not currently available",
        loadMore: "Load More",
        remaining: "remaining",
        lunchAvailable: "Lunch Available",
        lunchHours: "Monday - Friday 10:30 - 14:30",
        noItemsTitle: "Menu is updating",
        noItemsBody: "New items are coming soon. Please check back later.",
      },
      reviewsLabel: "Reviews",
      reviewsHeading: "What our customers say",
      signInToReview: "Sign in to leave a review",
      review1: "Best kebab in Lahti! Fast delivery and food always fresh.",
      review2: "Amazona pizza is honestly the best pizza I've ever had.",
      review3: "Excellent selection and prices are right.",
      mobileApp: "Mobile App",
      orderEasier: "Order Easier",
      downloadDesc: "Download our app and order directly from your phone.",
      downloadOn: "Download on",
      openingHours: "Opening Hours",
      monTue: "Mon–Tue",
      wedSun: "Wed–Sun",
      wedFri: "Wed–Fri",
      footer: {
        brandPrefix: "Ravintola",
        brandName: "Amazona",
        description:
          "Lahti's best pizzeria and kebab restaurant. Fresh ingredients and authentic flavors since 2010.",
        openingHours: "Opening Hours",
        lunch: "Lunch Mon-Fri 10:30-14:30",
        contact: "Contact",
        addressLine1: "Aleksanterinkatu 3",
        addressLine2: "15110 Lahti, Finland",
        rights: "All rights reserved.",
        findOrders: "Find your orders",
        days: {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday",
        },
      },
      menuItem: {
        backToMenu: "Back to menu",
        notFoundTitle: "Item not found",
        notFoundBody: "This item is no longer available on the menu.",
        details: "Item details",
        lunchItem: "Lunch item",
        available: "Available",
        unavailable: "Unavailable",
        uncategorized: "Other",
        extrasTitle: "Extras and choices",
        extrasSubtitle: "Customize your order",
        unnamedExtra: "Extras",
        choice: "Choice",
        addon: "Addon",
        required: "Required",
        optional: "Optional",
        maxSelections: "Up to {{count}} selections",
        included: "Included",
        unnamedOption: "Option",
        noExtrasTitle: "No extras",
        noExtrasBody: "There are no extras for this item right now.",
        reviewsTitle: "Reviews",
        reviewsSubtitle: "What guests say",
        noReviewsTitle: "No reviews yet",
        noReviewsBody: "Be the first to review this item.",
      },
    },
  },
} as const;

const supportedLanguages: Language[] = ["fi", "en"];

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: homeResources,
    lng: "fi",
    fallbackLng: "en",
    defaultNS: "home",
    ns: ["home"],
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
  });
}

// ── context ───────────────────────────────────────────────────────────────────
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof useTranslation>["t"];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation("home");

  const setLanguage = (lang: Language) => {
    i18nInstance.changeLanguage(lang);
  };

  // keep i18n as the source of truth; normalize to supported language codes
  const resolved = (i18nInstance.resolvedLanguage ?? i18nInstance.language).split("-")[0];
  const language = (supportedLanguages.includes(resolved as Language)
    ? resolved
    : "fi") as Language;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}