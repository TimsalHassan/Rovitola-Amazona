import { createContext, type ReactNode } from "react";
import { Language } from "../types";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const LANG_STORAGE_KEY = "preferred_language";

function getSavedLanguage(): string {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "fi" || saved === "en") return saved;
  } catch {
    // localStorage blocked
  }
  return "fi"; // default
}

const resources = {
  fi: {
    home: {
      // ── Carousel / generic ────────────────────────────────────────────────
      order: "Tilaa",
      onSale: "ALE",
      unnamedItem: "Nimeton annos",
      unnamedItemDesc: "Kuvaus puuttuu",

      // ── Review modal ──────────────────────────────────────────────────────
      leaveReview: "Jätä Arvostelu",
      rating: "Arvosana",
      review: "Arvostelu",
      reviewPlaceholder: "Kirjoita arvostelu...",
      submitting: "Lähetetään...",
      submit: "Lähetä",
      thankYou: "Kiitos arvostelustaasi!",

      // ── Status pill ───────────────────────────────────────────────────────
      openNow: "Nyt Auki — Tilaa heti!",
      closedNow: "Suljettu nyt",

      // ── Hero ──────────────────────────────────────────────────────────────
      heroTagline: "Aitojen makujen ravintola Lahden sydämessä",
      orderNow: "Tilaa Nyt",
      viewMenu: "Katso Ruokalista",
      scrollDown: "Vieritä alas",

      // ── Features strip ────────────────────────────────────────────────────
      fastDelivery: "Nopea Toimitus",
      fastDeliveryDesc: "Ilmainen alle 9km • €4 yli 9km",
      discount: "5% Alennus",
      discountDesc: "Automaattinen alennus jokaisesta tilauksesta",
      deliveryTime: "~60 min toimitus",
      deliveryTimeDesc: "Minimitilaus €13 • Max 14km säde",

      // ── Carousel section ──────────────────────────────────────────────────
      fromMenu: "Ruokalistalta",
      popularDishes: "Suosituimmat annokset",
      newSelectionEveryVisit: "Uusi järjestys joka latauskerralla",
      fullMenu: "Koko ruokalista",
      emptyMenuTitle: "Ei näytettäviä annoksia",
      emptyMenuBody: "Ruokalista päivittyy pian. Tarkista uudelleen hetken päästä.",

      // ── About ─────────────────────────────────────────────────────────────
      aboutUs: "Tietoa meistä",
      yearsInLahti: "vuotta Lahdessa",
      aboutHeading: "Lahden sydämessä\nvuodesta 2010",
      aboutBody:
        "Ravintola Amazona on Lahden suosituin pizzeria ja kebab-ravintola. Perustettu vuonna 2010, olemme palvelleet asiakkaitamme laadukkailla raaka-aineilla ja aidoilla resepteillä yli 14 vuoden ajan.",
      menuItems: "Annokset",
      categories: "Kategoriat",
      delivery: "Toimitus",
      minOrder: "Minitilaus",
      noReviewsYet: "Ei arvosteluja vielä",

      // ── Reviews ───────────────────────────────────────────────────────────
      reviewsLabel: "Asiakaspalautteet",
      reviewsHeading: "Mitä asiakkaamme sanovat",
      signInToReview: "Kirjaudu arvostellaksesi",

      // ── App download ──────────────────────────────────────────────────────
      mobileApp: "Sovellus",
      orderEasier: "Tilaa helpommin",
      downloadDesc: "Lataa sovellus ja tilaa suoraan puhelimellasi.",
      downloadOn: "Lataa",

      // ── Opening hours ─────────────────────────────────────────────────────
      openingHours: "Aukioloajat",
      closed: "Suljettu",

      // ── Menu page ─────────────────────────────────────────────────────────
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
        lunchUnavailable: "Ei saatavilla tällä hetkellä",
        loadMore: "Lataa lisää",
        remaining: "jäljellä",
        lunchAvailable: "Lounas saatavilla",
        lunchHours: "Maanantai - Perjantai 10:30 - 14:30",
        noItemsTitle: "Ruokalista päivittyy",
        noItemsBody: "Annoksia lisätään pian. Tarkista uudelleen myöhemmin.",
      },

      // ── Menu item page ────────────────────────────────────────────────────
      menuItem: {
        backToMenu: "Takaisin ruokalistaan",
        notFoundTitle: "Annoksen tiedot puuttuvat",
        notFoundBody: "Tätä annosta ei löytynyt. Se on voinut poistua ruokalistalta.",
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
        specialInstruction: "Erityisohjeet",
        specialInstructionPlaceholder: "Esim. ei sipulia, extra kastiketta…",
        addedToCart: "Lisätty!",
        requiredExtraError: "Tee valinta kohdassa",
      },

      // ── Nav ───────────────────────────────────────────────────────────────
      nav: {
        home: "Koti",
        menu: "Ruokalista",
        about: "Tietoa",
        contact: "Yhteystiedot",
        signedInAs: "Kirjautunut sisään",
        myAccount: "Oma Tili",
        myOrders: "Tilaukseni",
        signOut: "Kirjaudu Ulos",
        login: "Kirjaudu",
        language: "Kieli",
        langFi: "Suomi",
        langEn: "English",
        orders: "Tilaukset",
      },

      // ── Footer ────────────────────────────────────────────────────────────
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
        linksTitle: "Pikalinkit",
        contactTitle: "Ravintolan tiedot",
        deliveryFrom: "Toimitus alkaen",
        deliveryFee: "Toimitusmaksu",
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

      // ── Cart page ─────────────────────────────────────────────────────────
      cart: {
        emptyTitle: "Ostoskori on tyhjä",
        emptyBody: "Et ole vielä lisännyt tuotteita koriin.",
        browseMenu: "Selaa ruokalistaa",
        title: "Ostoskori",
        items: "tuotetta",
        yourOrder: "Tilauksesi",
        orderType: "Toimitustapa",
        delivery: "Toimitus",
        pickup: "Nouto",
        deliveryAddress: "Toimitusosoite",
        addressPlaceholder: "Kirjoita osoite",
        contactInfo: "Yhteystiedot",
        namePlaceholder: "Nimesi",
        phonePlaceholder: "Puhelinnumero",
        emailPlaceholder: "Sähköposti (valinnainen)",
        guestEmailNote: "Sähköposti auttaa lähettämään tilausvahvistuksen.",
        orderNotes: "Lisätiedot",
        notesPlaceholder: "Esim. ei sipulia, extra tulista…",
        summary: "Yhteenveto",
        subtotal: "Välisumma",
        free: "Ilmainen",
        freeDeliveryHint: "Ilmainen toimitus, kun lisäät vielä €{{amount}}.",
        total: "Yhteensä",
        placing: "Lähetetään...",
        placeOrder: "Tee tilaus",
        payOnDelivery: "Maksu toimituksen yhteydessä.",
        itemNoteAdd: "Lisää huomautus",
        itemNoteHide: "Piilota huomautus",
        itemNotePlaceholder: "Esim. ei sipulia, extra tulista…",
        removeItem: "Poista tuote",
        proceedToCheckout: "Siirry kassalle",
        choosePaymentNext: "Valitset maksutavan seuraavaksi.",
        placeOrderFailed: "Tilauksen tekeminen epäonnistui.",
        errors: {
          nameRequired: "Nimi vaaditaan.",
          phoneRequired: "Puhelinnumero vaaditaan.",
          deliveryAddressRequired: "Toimitusosoite vaaditaan.",
        },
      },

      // ── Checkout page ─────────────────────────────────────────────────────
      checkout: {
        back: "Takaisin",
        title: "Kassa",
        reviewAndPay: "Tarkista tilauksesi ja valitse maksu",
        secureCheckout: "Turvallinen kassa",
        customerDetails: "Asiakastiedot",
        name: "Nimi",
        phone: "Puhelin",
        deliveringTo: "Toimitetaan osoitteeseen",
        pickup: "Nouto",
        orderNotes: "Lisätiedot",
        optional: "valinnainen",
        paymentMethod: "Maksutapa",
        payOnline: "Maksa verkossa",
        payOnlineDesc: "Visa, Mastercard, OP, Nordea Paytrailin kautta",
        cashOnDelivery: "Käteinen toimituksessa",
        cashOnDeliveryDesc: "Maksa käteisellä kun tilaus saapuu",
        cardOnDelivery: "Kortti toimituksessa",
        cardOnDeliveryDesc: "Maksa kortilla kun tilaus saapuu",
        paytrailRedirectNote: "Sinut ohjataan Paytrailin turvalliselle maksusivulle.",
        summary: "Yhteenveto",
        subtotal: "Välisumma",
        delivery: "Toimitus",
        discount: "5% alennus",
        total: "Yhteensä",
        redirectingToPayment: "Ohjataan maksuun…",
        payViaPaytrail: "Maksa €{{amount}} Paytraililla",
        paytrailFootnote: "Ohjattu Paytrailiin — korttitietojasi ei tallenneta.",
        processing: "Käsitellään...",
        placeOrder: "Tee Tilaus",
        offlinePaymentNote: "Tilauksesi vahvistetaan välittömästi.",
        nothingToCheckout: "Ei tilattavaa",
        addItemsFirst: "Lisää ensin tuotteita ostoskoriin.",
      },

      // ── My Orders page ────────────────────────────────────────────────────
      myOrders: {
        title: "Tilaukseni",
        ordersCount_one: "{{count}} tilaus",
        ordersCount_other: "{{count}} tilausta",
        awaitingPayment: "odottaa maksua",
        refresh: "Päivitä",
        loadFailed: "Tilausten lataaminen epäonnistui",
        tryAgain: "Yritä uudelleen",
        noOrdersTitle: "Ei tilauksia vielä",
        noOrdersBody: "Tilaushistoriasi näkyy täällä.",
        browseMenu: "Selaa ruokalistaa",
        subtotal: "Välisumma",
        deliveryCharge: "Toimitus",
        free: "Ilmainen",
        discount: "Alennus",
        total: "Yhteensä",
        trackOrder: "Seuraa tilausta",
        pendingPaymentBanner: "Maksu vaaditaan tilauksen vahvistamiseksi",
        completePayment: "Suorita maksu — €{{amount}}",
        redirectingToPaytrail: "Ohjataan Paytrailiin…",
        paymentPendingNote: "Maksu on kesken — suorita se tilauksen vahvistamiseksi.",
        paymentError: "Maksuvirhe. Yritä uudelleen.",
        notes: "Huomio",
      },

      // ── Order confirmation page (/confirm/order/:id) ───────────────────────
      orderConfirmation: {
        loading: "Ladataan tilaustasi…",
        notFoundTitle: "Tilausta ei löydy",
        backToMenu: "Takaisin ruokalistaan",
        placedTitle: "Tilaus vastaanotettu!",
        placedSubtitle:
          "Tilaus {{number}} on vastaanotettu. Suorita maksu alla vahvistaaksesi sen.",
        orderDetails: "Tilauksen tiedot",
        orderNumber: "Tilausnumero",
        placedAt: "Tilattu klo",
        orderType: "Toimitustapa",
        deliverTo: "Toimitetaan",
        notes: "Lisätiedot",
        items: "Tuotteet",
        subtotal: "Välisumma",
        delivery: "Toimitus",
        free: "Ilmainen",
        discount: "Alennus",
        total: "Yhteensä",
        paymentTitle: "Maksu",
        paymentBody:
          "Tilauksesi on varattu. Suorita maksu Paytrailin kautta vahvistaaksesi sen.",
        payNow: "Maksa €{{amount}} nyt",
        redirectingToPaytrail: "Ohjataan Paytrailiin…",
        paytrailNote: "Sinut ohjataan Paytrailin turvalliselle maksusivulle",
        paymentError: "Maksuyhdyskäytävävirhe. Yritä uudelleen.",
        delivery_type: "toimitus",
        pickup_type: "nouto",
      },

      // ── Order confirmed page (/order/:id/confirmed) ───────────────────────
      orderConfirmed: {
        // Success state
        paymentSuccessTitle: "Maksu onnistui",
        paymentSuccessBody: "Tilauksesi on vahvistettu ja sen valmistus on aloitettu.",
        orderLabel: "Tilaus",
        summaryTitle: "Yhteenveto",
        paidBadge: "Maksettu",
        myOrders: "Tilaukseni",
        backHome: "Etusivulle",
        // Cancel state
        paymentCancelledTitle: "Maksu peruutettu",
        paymentCancelledBody:
          "Maksuasi ei suoritettu loppuun. Tilaustasi ei ole vahvistettu.",
        tryAgain: "Yritä uudelleen",
        backToMenu: "Takaisin ruokalistaan",
        // Shared
        total: "Yhteensä",
      },

      // ── Login ─────────────────────────────────────────────────────────────
      login: {
        emailRequired: "Sähköposti vaaditaan.",
        emailInvalid:
          "Sähköpostiosoite ei ole kelvollinen. Kokeile muotoa sinä@esimerkki.com",
        passwordRequired: "Salasana vaaditaan.",
        passwordMinLength: "Salasanan täytyy olla vähintään 6 merkkiä.",
        signInError:
          "Kirjautuminen epäonnistui. Tarkista tunnuksesi ja yritä uudelleen.",
        title: "Tervetuloa takaisin",
        subtitle: "Kirjaudu Amazona-tilillesi",
        emailLabel: "Sähköposti",
        emailPlaceholder: "sinä@esimerkki.com",
        passwordLabel: "Salasana",
        passwordPlaceholder: "Salasanasi",
        forgotPassword: "Unohditko salasanasi?",
        signingIn: "Kirjaudutaan…",
        signIn: "Kirjaudu sisään",
        noAccount: "Ei tiliä? ",
        createOne: "Luo tili",
        termsPrefix: "Kirjautumalla hyväksyt ",
        termsLink: "Käyttöehdot",
      },

      // ── Register ──────────────────────────────────────────────────────────
      register: {
        nameRequired: "Koko nimi vaaditaan.",
        emailRequired: "Sähköposti vaaditaan.",
        emailInvalid:
          "Sähköpostiosoite ei ole kelvollinen. Kokeile muotoa sinä@esimerkki.com",
        phoneInvalid: "Syötä kelvollinen puhelinnumero.",
        passwordRequired: "Salasana vaaditaan.",
        passwordMinLength: "Salasanan täytyy olla vähintään 8 merkkiä.",
        confirmPasswordRequired: "Vahvista salasanasi.",
        passwordMismatch: "Salasanat eivät täsmää.",
        errorGeneric: "Jokin meni pieleen. Yritä uudelleen.",
        title: "Luo tili",
        subtitle: "Tilaa Amazonasta minuuteissa",
        fullNameLabel: "Koko nimi",
        namePlaceholder: "Nimesi",
        emailLabel: "Sähköposti",
        emailPlaceholder: "sinä@esimerkki.com",
        phoneLabel: "Puhelinnumero",
        phoneHint: "Valinnainen — tarvitaan toimitusilmoituksiin",
        passwordLabel: "Salasana",
        passwordPlaceholder: "Väh. 8 merkkiä",
        confirmPasswordLabel: "Vahvista salasana",
        confirmPasswordPlaceholder: "Toista salasanasi",
        creatingAccount: "Luodaan tiliä…",
        createAccount: "Luo tili",
        haveAccount: "Onko sinulla jo tili? ",
        signIn: "Kirjaudu sisään",
      },

      // ── Verify email ──────────────────────────────────────────────────────
      verifyEmail: {
        checkTitle: "Tarkista sähköpostisi",
        checkBody:
          "Lähetimme vahvistuslinkin sähköpostiisi. Klikkaa linkkiä aktivoidaksesi tilisi.",
        spamNote:
          "Etkö saanut viestiä? Tarkista roskapostikansio tai lähetä uusi linkki.",
        resendButton: "Lähetä vahvistussähköposti uudelleen",
        resentSuccess: "Uusi vahvistussähköposti lähetetty!",
        noEmailFallback:
          "Rekisteröidy uudelleen saadaksesi uuden vahvistuslinkin.",
        backToLogin: "Takaisin kirjautumiseen",
        verifyingTitle: "Vahvistetaan sähköposti…",
        verifyingBody: "Tämä kestää vain hetken.",
        successTitle: "Sähköposti vahvistettu!",
        successBody: "Tilisi on valmis. Voit nyt kirjautua sisään.",
        signIn: "Kirjaudu tilillesi",
        errorTitle: "Vahvistus epäonnistui",
        errorBody: "Linkki on virheellinen tai vanhentunut.",
      },

      // ── Contact page ──────────────────────────────────────────────────────
      contact: {
        title: "Yhteystiedot",
        sendMessageTitle: "Lähetä Viesti",
        messageSentTitle: "Viesti lähetetty!",
        messageSentBody: "Olemme yhteydessä pian.",
        sendAnother: "Lähetä uusi viesti",
        fullNameLabel: "Koko nimi",
        emailLabel: "Sähköposti",
        phoneLabel: "Puhelin",
        subjectLabel: "Aihe",
        subjectGeneral: "Yleinen kysely",
        subjectOrderIssue: "Tilausongelma",
        subjectFeedback: "Palaute",
        subjectPartnership: "Kumppanuus",
        messageLabel: "Viesti",
        sending: "Lähetetään…",
        sendMessageButton: "Lähetä Viesti",
        restaurantInfoTitle: "Ravintolan Tiedot",
        addressLabel: "Osoite",
        openingHoursTitle: "Aukioloajat",
        lunchLabel: "Lounas Ma-Pe:",
        closed: "Suljettu",
        mapLabel: "Kartta",
      },

      // ── About page ────────────────────────────────────────────────────────
      aboutPage: {
        title: "Tietoa Meistä",
        welcomeTitle: "Tervetuloa Ravintola Amazonaan",
        body1:
          "Ravintola Amazona on Lahden suosituin pizzeria ja kebab-ravintola. Perustettu vuonna 2010, olemme palvelleet asiakkaitamme laadukkailla raaka-aineilla ja aidoilla resepteillä. Tarjoamme parhaat pizzat, kebabit ja kanaruokia Lahdessa.",
        body2:
          "Teemme kaiken ruoan tuoreista raaka-aineista joka päivä. Meidän tavoitteemme on tarjota parasta laatua ja palvelua.",
        established: "Perustettu 2010",
        location: "Lahti, Suomi",
        cuisine: "Pizza & Kebab",
        qualityTitle: "Laadukkaat Raaka-aineet",
        qualityBody: "Käytämme vain tuoreita ja korkealaatuisia raaka-aineita.",
        fastDeliveryTitle: "Nopea Toimitus",
        fastDeliveryBody: "Toimitus 30-45 minuutissa.",
        centralLocationTitle: "Keskellä Lahtea",
        centralLocationBody: "Aleksanterinkatu 3, helposti saavutettavissa.",
        closed: "Suljettu",
      },

      // ── Guest orders page ─────────────────────────────────────────────────
      guestOrders: {
        title: "Etsi Tilauksiasi",
        subtitle: "Syötä puhelinnumerosi nähdäksesi tilauksesi.",
        registerPromptTitle: "Luo tili helpompaa hallintaa varten",
        registerPromptBody:
          "Tilaa, seuraa ja hallitse kaikkia tilauksiasi yhdessä paikassa.",
        registerCta: "Rekisteröidy",
        findButton: "Etsi",
        noOrders: "Ei tilauksia tällä puhelinnumerolla.",
      },

      // ── Order tracking page ───────────────────────────────────────────────
      orderTracking: {
        orderNumber: "Tilausnumero",
        orderCancelled: "Tilaus Peruttu",
        trackOrder: "Seuraa Tilaustasi",
        cancelledTitle: "Tilaus on peruttu",
        cancelledBody: "Jos sinulla on kysyttävää, ota yhteyttä ravintolaan.",
        orderStatusTitle: "Tilauksen tila",
        currentStatus: "Nykyinen tila",
        deliveryInfo: "Toimitustiedot",
        pickupFromRestaurant: "Nouto ravintolasta",
        delivery: "Toimitus",
        addressUnavailable: "Osoite ei saatavilla",
        estimatedTimeLabel: "Arvioitu aika:",
        minAbbrev: "min",
        orderedItems: "Tilatut Tuotteet",
        total: "Yhteensä",
        cancelOrder: "Peru Tilaus",
        cancelNotAllowed:
          "Tilausta ei voi enää peruuttaa — ravintola on jo aloittanut valmistuksen.",
        cancelling: "Perutaan…",
        backHome: "Takaisin Etusivulle",
        paymentMethod:{
          cash_on_delivery: "Käteinen toimituksessa",
          card: "Kortti",
          online: "Verkkomaksu",
        }
      },

      // ── Order status labels ───────────────────────────────────────────────
      orderStatus: {
        pending: "Tilaus Vastaanotettu",
        confirmed: "Vahvistettu",
        preparing: "Valmistetaan",
        onTheWay: "Matkalla",
        delivered: "Toimitettu",
        cancelled: "Peruttu",
      },

      // ── Auth layout ───────────────────────────────────────────────────────
      authLayout: {
        quote: '"Ruoka on ainesosa, joka yhdistää meidät."',
        headlineLine1: "Aitoja makuja,",
        headlineLine2: "toimitettu nopeasti.",
        subhead:
          "Puulämmitteiset pizzat ja muuta — suoraan keittiöstämme ovellesi.",
        socialProof: "2 000+ tyytyväistä asiakasta",
        mobileHeadline: "Aitoja makuja, nopeasti.",
        languageEnglish: "English",
        languageFinnish: "Suomi",
      },

      // ── Account page ──────────────────────────────────────────────────────
      account: {
        title: "Oma tili",
        tabs: {
          profile: "Profiili",
          security: "Turvallisuus",
          addresses: "Osoitteet",
        },
        profile: {
          title: "Henkilötiedot",
          subtitle: "Päivitä nimesi ja puhelinnumerosi",
          emailLabel: "Sähköposti",
          emailHint: "Sähköpostia ei voi muuttaa",
          success: "Profiili päivitetty!",
          fullNameLabel: "Koko nimi",
          phoneLabel: "Puhelinnumero",
          phoneHint: "Käytetään toimitusilmoituksiin",
          saving: "Tallennetaan…",
          saved: "Tallennettu",
          saveChanges: "Tallenna muutokset",
          signOut: "Kirjaudu ulos",
          nameRequired: "Nimi vaaditaan.",
          updateError: "Profiilin päivitys epäonnistui.",
        },
        security: {
          title: "Vaihda salasana",
          subtitle: "Valitse vahva salasana, vähintään 8 merkkiä",
          success: "Salasana vaihdettu!",
          currentPassword: "Nykyinen salasana",
          newPassword: "Uusi salasana",
          newPasswordHint: "Väh. 8 merkkiä",
          confirmPassword: "Vahvista uusi salasana",
          confirmPasswordHint: "Toista uusi salasana",
          updating: "Päivitetään…",
          update: "Päivitä salasana",
          updateError: "Salasanan vaihto epäonnistui.",
          errors: {
            currentRequired: "Nykyinen salasana vaaditaan.",
            newRequired: "Uusi salasana vaaditaan.",
            minLength: "Vähintään 8 merkkiä.",
            mismatch: "Salasanat eivät täsmää.",
          },
        },
        addresses: {
          title: "Tallennetut osoitteet",
          subtitle: "Hallitse toimitusosoitteitasi",
          defaultBadge: "Oletus",
          setDefault: "Aseta oletukseksi",
          editAria: "Muokkaa osoitetta",
          deleteAria: "Poista osoite",
          confirmDeleteAria: "Vahvista poisto",
          saving: "Tallennetaan…",
          addNew: "Lisää uusi osoite",
          modal: {
            editTitle: "Muokkaa osoitetta",
            addTitle: "Lisää uusi osoite",
            streetLabel: "Katuosoite",
            cityLabel: "Kaupunki",
            postalLabel: "Postinumero",
            countryLabel: "Maa",
            streetRequired: "Katuosoite vaaditaan.",
            cityRequired: "Kaupunki vaaditaan.",
            postalRequired: "Postinumero vaaditaan.",
            countryRequired: "Maa vaaditaan.",
            saveError: "Osoitteen tallennus epäonnistui. Yritä uudelleen.",
            defaultLabel: "Aseta oletusosoitteeksi",
            defaultHelp: "Käytetään automaattisesti kassalla",
            cancel: "Peruuta",
            saveChanges: "Tallenna muutokset",
            addAddress: "Lisää osoite",
          },
        },
      },
    },
  },

  en: {
    home: {
      // ── Carousel / generic ────────────────────────────────────────────────
      order: "Order",
      onSale: "SALE",
      unnamedItem: "Unnamed item",
      unnamedItemDesc: "Description not available",

      // ── Review modal ──────────────────────────────────────────────────────
      leaveReview: "Leave a Review",
      rating: "Rating",
      review: "Review",
      reviewPlaceholder: "Write your review...",
      submitting: "Submitting...",
      submit: "Submit",
      thankYou: "Thanks for your review!",

      // ── Status pill ───────────────────────────────────────────────────────
      openNow: "Open Now — Order Now!",
      closedNow: "Currently Closed",

      // ── Hero ──────────────────────────────────────────────────────────────
      heroTagline: "Authentic flavors in the heart of Lahti",
      orderNow: "Order Now",
      viewMenu: "View Menu",
      scrollDown: "Scroll down",

      // ── Features strip ────────────────────────────────────────────────────
      fastDelivery: "Fast Delivery",
      fastDeliveryDesc: "Free under 9km • €4 over 9km",
      discount: "5% Off Every Order",
      discountDesc: "Automatic discount on every order",
      deliveryTime: "~60 min delivery",
      deliveryTimeDesc: "Min order €13 • Max 14km radius",

      // ── Carousel section ──────────────────────────────────────────────────
      fromMenu: "From the menu",
      popularDishes: "Popular dishes",
      newSelectionEveryVisit: "A new selection every time you visit",
      fullMenu: "Full menu",
      emptyMenuTitle: "No items to show",
      emptyMenuBody: "The menu will be back soon. Please check again later.",

      // ── About ─────────────────────────────────────────────────────────────
      aboutUs: "About us",
      yearsInLahti: "years in Lahti",
      aboutHeading: "In the heart of Lahti\nsince 2010",
      aboutBody:
        "Ravintola Amazona is Lahti's most popular pizzeria and kebab restaurant. Founded in 2010, we have served our customers with quality ingredients and authentic recipes for over 14 years.",
      menuItems: "Menu items",
      categories: "Categories",
      delivery: "Delivery",
      minOrder: "Min. order",
      noReviewsYet: "No reviews yet",

      // ── Reviews ───────────────────────────────────────────────────────────
      reviewsLabel: "Reviews",
      reviewsHeading: "What our customers say",
      signInToReview: "Sign in to leave a review",

      // ── App download ──────────────────────────────────────────────────────
      mobileApp: "Mobile App",
      orderEasier: "Order Easier",
      downloadDesc: "Download our app and order directly from your phone.",
      downloadOn: "Download on",

      // ── Opening hours ─────────────────────────────────────────────────────
      openingHours: "Opening Hours",
      closed: "Closed",

      // ── Menu page ─────────────────────────────────────────────────────────
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

      // ── Menu item page ────────────────────────────────────────────────────
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
        addToCart: "Add to cart",
        specialInstruction: "Special instructions",
        specialInstructionPlaceholder: "E.g. no onions, extra sauce…",
        addedToCart: "Added!",
        requiredExtraError: "Please make a selection for",
      },

      // ── Nav ───────────────────────────────────────────────────────────────
      nav: {
        home: "Home",
        menu: "Menu",
        about: "About",
        contact: "Contact",
        signedInAs: "Signed in as",
        myAccount: "My Account",
        myOrders: "My Orders",
        signOut: "Sign out",
        login: "Login",
        language: "Language",
        langFi: "Suomi",
        langEn: "English",
        orders: "Orders",
      },

      // ── Footer ────────────────────────────────────────────────────────────
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
        deliveryFrom: "Delivery From",
        deliveryFee: "Delivery Fee",
        linksTitle: "Quick Links",
        contactTitle: "Restaurant Info",
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

      // ── Cart page ─────────────────────────────────────────────────────────
      cart: {
        emptyTitle: "Your cart is empty",
        emptyBody: "You have not added any items yet.",
        browseMenu: "Browse menu",
        title: "Cart",
        items: "items",
        yourOrder: "Your order",
        orderType: "Order type",
        delivery: "Delivery",
        pickup: "Pickup",
        deliveryAddress: "Delivery address",
        addressPlaceholder: "Enter your address",
        contactInfo: "Contact info",
        namePlaceholder: "Your name",
        phonePlaceholder: "Phone number",
        emailPlaceholder: "Email (optional)",
        guestEmailNote: "Email helps us send your order confirmation.",
        orderNotes: "Order notes",
        notesPlaceholder: "E.g. no onions, extra spicy…",
        summary: "Summary",
        subtotal: "Subtotal",
        free: "Free",
        freeDeliveryHint: "Add €{{amount}} more for free delivery.",
        total: "Total",
        placing: "Placing...",
        placeOrder: "Place order",
        payOnDelivery: "Pay on delivery.",
        itemNoteAdd: "Add note",
        itemNoteHide: "Hide note",
        itemNotePlaceholder: "E.g. no onions, extra spicy…",
        removeItem: "Remove item",
        proceedToCheckout: "Proceed to Checkout",
        choosePaymentNext: "You'll choose your payment method next.",
        placeOrderFailed: "Failed to place order.",
        errors: {
          nameRequired: "Name is required.",
          phoneRequired: "Phone is required.",
          deliveryAddressRequired: "Delivery address is required.",
        },
      },

      // ── Checkout page ─────────────────────────────────────────────────────
      checkout: {
        back: "Back",
        title: "Checkout",
        reviewAndPay: "Review your order and choose payment",
        secureCheckout: "Secure checkout",
        customerDetails: "Customer Details",
        name: "Name",
        phone: "Phone",
        deliveringTo: "Delivering to",
        pickup: "Pickup",
        orderNotes: "Order Notes",
        optional: "optional",
        paymentMethod: "Payment Method",
        payOnline: "Pay Online",
        payOnlineDesc: "Visa, Mastercard, OP, Nordea via Paytrail",
        cashOnDelivery: "Cash on Delivery",
        cashOnDeliveryDesc: "Pay in cash when your order arrives",
        cardOnDelivery: "Card on Delivery",
        cardOnDeliveryDesc: "Pay by card when your order arrives",
        paytrailRedirectNote: "You'll be redirected to Paytrail's secure payment page.",
        summary: "Summary",
        subtotal: "Subtotal",
        delivery: "Delivery",
        discount: "5% discount",
        total: "Total",
        redirectingToPayment: "Redirecting to payment…",
        payViaPaytrail: "Pay €{{amount}} via Paytrail",
        paytrailFootnote:
          "Redirected to Paytrail — your card details are never stored here.",
        processing: "Processing...",
        placeOrder: "Place Order",
        offlinePaymentNote: "Your order will be confirmed immediately.",
        nothingToCheckout: "Nothing to checkout",
        addItemsFirst: "Please add items to your cart first.",
      },

      // ── My Orders page ────────────────────────────────────────────────────
      myOrders: {
        title: "My Orders",
        ordersCount_one: "{{count}} order",
        ordersCount_other: "{{count}} orders",
        awaitingPayment: "awaiting payment",
        refresh: "Refresh",
        loadFailed: "Failed to load orders",
        tryAgain: "Try again",
        noOrdersTitle: "No orders yet",
        noOrdersBody: "Your order history will appear here.",
        browseMenu: "Browse Menu",
        subtotal: "Subtotal",
        deliveryCharge: "Delivery",
        free: "Free",
        discount: "Discount",
        total: "Total",
        trackOrder: "Track Order",
        pendingPaymentBanner: "Payment required to confirm this order",
        completePayment: "Complete Payment — €{{amount}}",
        redirectingToPaytrail: "Redirecting to Paytrail…",
        paymentPendingNote: "Payment is pending — complete it to confirm your order.",
        paymentError: "Payment error. Try again.",
        notes: "Note",
      },

      // ── Order confirmation page (/confirm/order/:id) ───────────────────────
      orderConfirmation: {
        loading: "Loading your order…",
        notFoundTitle: "Order not found",
        backToMenu: "Back to menu",
        placedTitle: "Order Placed!",
        placedSubtitle:
          "Order {{number}} has been received. Complete payment below to confirm it.",
        orderDetails: "Order Details",
        orderNumber: "Order number",
        placedAt: "Placed at",
        orderType: "Order type",
        deliverTo: "Deliver to",
        notes: "Notes",
        items: "Items",
        subtotal: "Subtotal",
        delivery: "Delivery",
        free: "Free",
        discount: "Discount",
        total: "Total",
        paymentTitle: "Payment",
        paymentBody:
          "Your order is reserved. Complete payment via Paytrail to confirm it.",
        payNow: "Pay €{{amount}} now",
        redirectingToPaytrail: "Redirecting to Paytrail…",
        paytrailNote: "You'll be redirected to Paytrail's secure payment page",
        paymentError: "Payment gateway error. Please try again.",
        delivery_type: "delivery",
        pickup_type: "pickup",
      },

      // ── Order confirmed page (/order/:id/confirmed) ───────────────────────
      orderConfirmed: {
        paymentSuccessTitle: "Payment Successful",
        paymentSuccessBody:
          "Your order has been confirmed and is being prepared.",
        orderLabel: "Order",
        summaryTitle: "Summary",
        paidBadge: "Paid",
        myOrders: "My Orders",
        backHome: "Back Home",
        paymentCancelledTitle: "Payment Cancelled",
        paymentCancelledBody:
          "Your payment was not completed. Your order has not been confirmed.",
        tryAgain: "Try Again",
        backToMenu: "Back to Menu",
        total: "Total",
      },

      // ── Login ─────────────────────────────────────────────────────────────
      login: {
        emailRequired: "Email is required.",
        emailInvalid:
          "That doesn't look like a valid email. Try something like you@example.com",
        passwordRequired: "Password is required.",
        passwordMinLength: "Password must be at least 6 characters.",
        signInError:
          "Couldn't sign you in. Please check your credentials and try again.",
        title: "Welcome back",
        subtitle: "Sign in to your Amazona account",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Your password",
        forgotPassword: "Forgot password?",
        signingIn: "Signing in…",
        signIn: "Sign in",
        noAccount: "Don't have an account? ",
        createOne: "Create one",
        termsPrefix: "By signing in you agree to our ",
        termsLink: "Terms of Service",
      },

      // ── Register ──────────────────────────────────────────────────────────
      register: {
        nameRequired: "Full name is required.",
        emailRequired: "Email is required.",
        emailInvalid:
          "That doesn't look like a valid email. Try something like you@example.com",
        phoneInvalid: "Enter a valid phone number.",
        passwordRequired: "Password is required.",
        passwordMinLength: "Password must be at least 8 characters.",
        confirmPasswordRequired: "Please confirm your password.",
        passwordMismatch: "Passwords do not match.",
        errorGeneric: "Something went wrong. Please try again.",
        title: "Create your account",
        subtitle: "Order from Amazona in minutes",
        fullNameLabel: "Full name",
        namePlaceholder: "Your name",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        phoneLabel: "Phone number",
        phoneHint: "Optional — needed for delivery updates",
        passwordLabel: "Password",
        passwordPlaceholder: "Min. 8 characters",
        confirmPasswordLabel: "Confirm password",
        confirmPasswordPlaceholder: "Repeat your password",
        creatingAccount: "Creating account…",
        createAccount: "Create account",
        haveAccount: "Already have an account? ",
        signIn: "Sign in",
      },

      // ── Verify email ──────────────────────────────────────────────────────
      verifyEmail: {
        checkTitle: "Check your email",
        checkBody:
          "We've sent a verification link to your email address. Click the link to activate your account.",
        spamNote:
          "Didn't receive it? Check your spam folder or resend the link below.",
        resendButton: "Resend verification email",
        resentSuccess: "New verification email sent!",
        noEmailFallback:
          "Please register again to receive a new verification link.",
        backToLogin: "Back to login",
        verifyingTitle: "Verifying your email…",
        verifyingBody: "This will only take a moment.",
        successTitle: "Email Verified!",
        successBody: "Your account is ready. You can now sign in.",
        signIn: "Sign in to your account",
        errorTitle: "Verification Failed",
        errorBody: "This link is invalid or has expired.",
      },

      // ── Contact page ──────────────────────────────────────────────────────
      contact: {
        title: "Contact Us",
        sendMessageTitle: "Send a Message",
        messageSentTitle: "Message Sent!",
        messageSentBody: "We'll get back to you soon.",
        sendAnother: "Send another message",
        fullNameLabel: "Full Name",
        emailLabel: "Email",
        phoneLabel: "Phone",
        subjectLabel: "Subject",
        subjectGeneral: "General Inquiry",
        subjectOrderIssue: "Order Issue",
        subjectFeedback: "Feedback",
        subjectPartnership: "Partnership",
        messageLabel: "Message",
        sending: "Sending…",
        sendMessageButton: "Send Message",
        restaurantInfoTitle: "Restaurant Info",
        addressLabel: "Address",
        openingHoursTitle: "Opening Hours",
        lunchLabel: "Lunch Mon-Fri:",
        closed: "Closed",
        mapLabel: "Map",
      },

      // ── About page ────────────────────────────────────────────────────────
      aboutPage: {
        title: "About Us",
        welcomeTitle: "Welcome to Ravintola Amazona",
        body1:
          "Ravintola Amazona is Lahti's most popular pizzeria and kebab restaurant. Founded in 2010, we have served our customers with quality ingredients and authentic recipes. We offer the best pizzas, kebabs and chicken dishes in Lahti.",
        body2:
          "We make all our food from fresh ingredients every day. Our goal is to provide the best quality and service.",
        established: "Est. 2010",
        location: "Lahti, Finland",
        cuisine: "Pizza & Kebab",
        qualityTitle: "Quality Ingredients",
        qualityBody: "We use only fresh and high-quality ingredients.",
        fastDeliveryTitle: "Fast Delivery",
        fastDeliveryBody: "Delivery in 30-45 minutes.",
        centralLocationTitle: "Central Lahti Location",
        centralLocationBody: "Aleksanterinkatu 3, easily accessible.",
        closed: "Closed",
      },

      // ── Guest orders page ─────────────────────────────────────────────────
      guestOrders: {
        title: "Find Your Orders",
        subtitle: "Enter your phone number to see your orders.",
        registerPromptTitle: "Create an account for easier management",
        registerPromptBody:
          "Order, track and manage all your orders in one place.",
        registerCta: "Register",
        findButton: "Find",
        noOrders: "No orders found for this phone number.",
      },

      // ── Order tracking page ───────────────────────────────────────────────
      orderTracking: {
        orderNumber: "Order Number",
        orderCancelled: "Order Cancelled",
        trackOrder: "Track Your Order",
        cancelledTitle: "Order has been cancelled",
        cancelledBody: "If you have questions, please contact the restaurant.",
        orderStatusTitle: "Order Status",
        currentStatus: "Current status",
        deliveryInfo: "Delivery Info",
        pickupFromRestaurant: "Pickup from restaurant",
        delivery: "Delivery",
        addressUnavailable: "Address not available",
        estimatedTimeLabel: "Estimated time:",
        minAbbrev: "min",
        orderedItems: "Ordered Items",
        total: "Total",
        cancelOrder: "Cancel Order",
        cancelNotAllowed:
          "Order can no longer be cancelled — the restaurant has already started preparation.",
        cancelling: "Cancelling…",
        backHome: "Back to Home",
        paymentMethod:{
          cash_on_delivery: "Cash on Delivery",
          card: "Card",
          online: "Online payment",
        }
      },

      // ── Order status labels ───────────────────────────────────────────────
      orderStatus: {
        pending: "Order Received",
        confirmed: "Confirmed",
        preparing: "Preparing",
        onTheWay: "On the Way",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },

      // ── Auth layout ───────────────────────────────────────────────────────
      authLayout: {
        quote: '"Food is the ingredient that binds us together."',
        headlineLine1: "Authentic flavours,",
        headlineLine2: "delivered fast.",
        subhead:
          "Wood-fired pizzas and more — straight from our kitchen to your door.",
        socialProof: "Loved by 2,000+ customers",
        mobileHeadline: "Authentic flavours, fast.",
        languageEnglish: "English",
        languageFinnish: "Suomi",
      },

      // ── Account page ──────────────────────────────────────────────────────
      account: {
        title: "My Account",
        tabs: {
          profile: "Profile",
          security: "Security",
          addresses: "Addresses",
        },
        profile: {
          title: "Personal information",
          subtitle: "Update your name and phone number",
          emailLabel: "Email",
          emailHint: "Email cannot be changed",
          success: "Profile updated successfully!",
          fullNameLabel: "Full name",
          phoneLabel: "Phone number",
          phoneHint: "Used for delivery notifications",
          saving: "Saving…",
          saved: "Saved",
          saveChanges: "Save changes",
          signOut: "Sign out",
          nameRequired: "Name is required.",
          updateError: "Failed to update profile.",
        },
        security: {
          title: "Change password",
          subtitle: "Choose a strong password with at least 8 characters",
          success: "Password changed successfully!",
          currentPassword: "Current password",
          newPassword: "New password",
          newPasswordHint: "Min. 8 characters",
          confirmPassword: "Confirm new password",
          confirmPasswordHint: "Repeat new password",
          updating: "Updating…",
          update: "Update password",
          updateError: "Failed to change password.",
          errors: {
            currentRequired: "Current password is required.",
            newRequired: "New password is required.",
            minLength: "Must be at least 8 characters.",
            mismatch: "Passwords do not match.",
          },
        },
        addresses: {
          title: "Saved addresses",
          subtitle: "Manage your delivery addresses",
          defaultBadge: "Default",
          setDefault: "Set as default",
          editAria: "Edit address",
          deleteAria: "Delete address",
          confirmDeleteAria: "Confirm delete",
          saving: "Saving…",
          addNew: "Add new address",
          modal: {
            editTitle: "Edit address",
            addTitle: "Add new address",
            streetLabel: "Street address",
            cityLabel: "City",
            postalLabel: "Postal code",
            countryLabel: "Country",
            streetRequired: "Street address is required.",
            cityRequired: "City is required.",
            postalRequired: "Postal code is required.",
            countryRequired: "Country is required.",
            saveError: "Failed to save address. Please try again.",
            defaultLabel: "Set as default address",
            defaultHelp: "Used automatically at checkout",
            cancel: "Cancel",
            saveChanges: "Save changes",
            addAddress: "Add address",
          },
        },
      },
    },
  },
} as const;

const supportedLanguages: Language[] = ["fi", "en"];

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getSavedLanguage(),
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

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation("home");

  const setLanguage = (lang: Language) => {
    i18nInstance.changeLanguage(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // storage blocked — ignore
    }
  };

  const resolved = (
    i18nInstance.resolvedLanguage ?? i18nInstance.language
  ).split("-")[0];
  const language = (
    supportedLanguages.includes(resolved as Language) ? resolved : "fi"
  ) as Language;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}