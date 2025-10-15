export default {
  navigation: {
    home: 'Hem',
    messages: 'Meddelanden',
    manage: 'Hantera',
    account: 'Konto'
  },
  common: {
    error: 'Fel',
    ok: 'OK',
    success: 'Framgång'
  },
  profile: {
    title: 'Profil',
    sections: {
      fullName: 'Fullständigt namn',
      email: 'E-post',
      gender: 'Kön',
      mobile: 'Telefon'
    },
    actions: {
      editInfo: 'Redigera information'
    }
  },
  account: {
    title: 'Konto',
    sections: {
      general: 'Allmänt',
      billingAndPlaces: 'Fakturering och platser',
      legal: 'Juridiskt',
      personal: 'Personligt',
      social: 'Socialt'
    },
    profileInfo: {
      personalInfo: 'Personlig information',
      safety: 'Säkerhet',
      language: 'Språk'
    },
    billingAndPlaces: {
      payment: 'Betalning',
      savedPlaces: 'Sparade platser',
      addPlace: 'Lägg till plats'
    },
    legal: {
      termsOfUse: 'Användarvillkor',
      privacyPolicy: 'Integritetspolicy'
    },
    personal: {
      reportBug: 'Rapportera bugg',
      logout: 'Logga ut'
    },
    social: {
      support: 'Support',
      shareApp: 'Dela app'
    },
    deleteAccount: 'Radera konto',
    modals: {
      logout: {
        title: 'Logga ut',
        message: 'Är du säker på att du vill logga ut?',
        cancel: 'Avbryt',
        confirm: 'Logga ut'
      },
      deleteAccount: {
        title: 'Radera konto',
        message: 'Vi beklagar att se dig gå. Vänligen kontakta vår kundtjänst för hjälp med att radera ditt konto. De kommer att hjälpa dig att säkerställa en smidig process och lösa dina problem.',
        cancel: 'Avbryt',
        contactSupport: 'Kontakta support'
      },
      savedPlaces: {
        title: 'Sparade platser',
        pickupLocation: 'Upphämtningsplats',
        dropoffLocation: 'Avlämningsplats',
        notSet: 'Ej inställt'
      },
      addPlace: {
        editTitle: 'Redigera {{type}} plats',
        addTitle: 'Lägg till {{type}} plats',
        address: 'Adress',
        addressPlaceholder: 'Välj plats',
        pickFromMap: 'Välj från karta',
        enterManually: 'Ange manuellt',
        mapHint: 'Tryck på kartan för att välja plats',
        updateLocation: 'Uppdatera plats',
        addLocation: 'Lägg till plats'
      }
    }
  },
  packageForm: {
    title: 'Skicka paket',
    pickupDetails: 'Upphämtningsdetaljer',
    dropoffDetails: 'Avlämningsdetaljer',
    sender: 'Avsändare',
    receiver: 'Mottagare',
    name: 'Namn',
    number: 'Nummer',
    weight: 'Vikt',
    price: 'Pris',
    location: 'Plats',
    pickFromMap: 'Välj från karta',
    enterManually: 'Ange manuellt',
    useThisAddress: 'Använd denna adress',
    enterPickupAddress: 'Ange upphämtningsadress',
    enterDropoffAddress: 'Ange leveransadress',
    addressNote: 'Vänligen ange den fullständiga adressen inklusive gata, stad och postnummer för exakta resultat.',
    moreDetails: 'Mer detaljer',
    pickupDateAndTime: 'Upphämtningsdatum och tid',
    timeZoneHint: 'Tidszon baseras på upphämtningsplats',
    timeZoneInfo: 'Tidszon baseras på upphämtningsplats',
    done: 'Klar',
    postJob: 'Publicera jobb',
    updateJob: 'Uppdatera jobb',
    mapHint: 'Tryck på kartan för att välja plats',
    dropoff: 'Avlämning',
    validation: {
      pickupNameRequired: 'Avsändarens namn krävs',
      pickupPhoneRequired: 'Avsändarens telefonnummer krävs',
      invalidPickupPhone: 'Ogiltigt telefonnummer för avsändare',
      pickupLocationRequired: 'Upphämtningsplats krävs',
      weightRequired: 'Vikt krävs',
      invalidWeight: 'Ogiltigt viktvärde',
      priceRequired: 'Pris krävs',
      invalidPrice: 'Ogiltigt prisvärde',
      invalidDate: 'Ogiltigt datum - måste vara idag eller i framtiden',
      receiverNameRequired: 'Mottagarens namn krävs',
      receiverPhoneRequired: 'Mottagarens telefonnummer krävs',
      invalidReceiverPhone: 'Ogiltigt telefonnummer för mottagare',
      receiverLocationRequired: 'Leveransplats krävs',
      fixErrors: 'Vänligen åtgärda följande fel',
      jobPostedSuccess: 'Jobb publicerat framgångsrikt',
      createPackageError: 'Kunde inte skapa paket. Vänligen försök igen.'
    },
    updateSuccess: 'Paket uppdaterat framgångsrikt',
    createSuccess: 'Paket skapat framgångsrikt',
    saveFailed: 'Kunde inte spara paket'
  },
  managePage: {
    title: 'Mina beställningar',
    tabs: {
      ongoing: 'Pågående',
      accepted: 'Accepterade',
      completed: 'Genomförda',
      canceled: 'Avbrutna'
    },
    deliveryOverview: 'Leveransöversikt',
    emptyStates: {
      ongoing: {
        title: 'Du har inga beställningar än',
        message: 'Du har inga pågående beställningar just nu'
      },
      accepted: {
        title: 'Inga accepterade beställningar',
        message: 'Du har inga accepterade beställningar just nu'
      },
      completed: {
        title: 'Genomförda beställningar visas här',
        message: 'Du har inga genomförda beställningar just nu'
      },
      canceled: {
        title: 'Listan över avbrutna beställningar är tom',
        message: 'Du har inga avbrutna beställningar just nu'
      }
    },
    orderStatus: {
      inProgress: 'Pågående',
      accepted: 'Accepterad',
      completed: 'Genomförd',
      canceled: 'Avbruten'
    },
    actions: {
      acceptDelivery: 'Acceptera leverans',
      cancelDelivery: 'Avbryt leverans',
      editDelivery: 'Redigera leverans',
      leaveReview: 'Lämna en recension',
      viewReview: 'Visa recension',
      sendMessage: 'Skicka meddelande'
    },
    deliveryCompleted: {
      title: 'Leverans slutförd!',
      message: 'Vänligen berätta för oss om din upplevelse och den service som tillhandahölls av din budbärare. Detta kommer att hjälpa oss att förbättra vårt system. Tack för att du använder PiqDrop!',
      leaveReview: 'Lämna omdöme',
      maybeLater: 'Kanske senare'
    },
    cancelConfirmation: {
      title: 'Bekräfta avbokning',
      from: 'Från:',
      to: 'Till:',
      date: 'Datum:',
      back: 'Tillbaka',
      confirmCancel: 'Ja, avboka!'
    }
  },
  orderDetail: {
    title: 'Beställningsdetaljer',
    pickupDetails: {
      title: 'Upphämtningsdetaljer',
      name: 'Namn:',
      number: 'Nummer:',
      weight: 'Vikt:',
      price: 'Pris:',
      location: 'Plats:',
      note: 'Anteckning'
    },
    dropoffDetails: {
      title: 'Avlämningsdetaljer',
      name: 'Namn:',
      number: 'Nummer:',
      location: 'Plats:',
      note: 'Anteckning'
    },
    orderConfirmation: {
      title: 'Beställningsbekräftelse',
      from: 'Från:',
      to: 'Till:',
      date: 'Datum:',
      back: 'Tillbaka',
      confirm: 'Ja, bekräfta!'
    },
    takeOrder: 'Ta beställning!'
  },
  review: {
    title: 'Lämna omdöme',
    viewTitle: 'Ditt omdöme',
    rider: 'Förare',
    experienceQuestion: 'Hur var din upplevelse med föraren?',
    writeReview: 'Skriv omdöme',
    enterReview: 'Ange omdöme',
    maybeLater: 'Kanske senare',
    submitReview: 'Skicka omdöme',
    submitting: 'Skickar...',
    yourRating: 'Ditt betyg',
    yourReview: 'Ditt omdöme',
    close: 'Stäng',
    validation: {
      selectRating: 'Vänligen välj betyg',
      writeReview: 'Vänligen skriv ett omdöme'
    },
    success: {
      title: 'Framgång',
      message: 'Omdöme skickat framgångsrikt'
    },
    error: {
      fetchFailed: 'Misslyckades att ladda omdöme'
    }
  },
  updateProfile: {
    title: 'Uppdatera information',
    firstName: 'Förnamn',
    lastName: 'Efternamn',
    mobile: 'Telefon',
    address: 'Adress',
    dateOfBirth: 'Födelsedatum',
    nationality: 'Nationalitet',
    gender: 'Kön',
    update: 'Uppdatera',
    updating: 'Uppdaterar...',
    success: 'Profil uppdaterad framgångsrikt',
    error: 'Kunde inte uppdatera profil. Vänligen försök igen.',
    validationError: 'Valideringsfel',
    invalidPhone: 'Ogiltigt telefonnummerformat',
    mapHint: 'Tryck på kartan för att välja plats',
    close: 'Stäng',
    done: 'Klar',
    cancel: 'Avbryt',
    selectLocation: 'Välj plats',
    manualEntry: 'Manuell inmatning',
    typeAddress: 'Ange adress här'
  },
  safety: {
    title: 'Säkerhetscenter',
    greeting: 'Hej',
    subtitle: 'Här är vad du behöver veta om säkerhet',
    tabs: {
      guide: 'Guide',
      tools: 'Verktyg'
    },
    guide: {
      checkId: {
        title: 'Kontrollera ID',
        description: 'Kontrollera budbärarens ID eller pass innan du lämnar dina saker, se till att det matchar profilen på plattformen.'
      },
      careful: {
        title: 'Var försiktig',
        description: 'Ta en selfie med din budbärare om möjligt. Detta gör det lättare att identifiera din budbärare om något händer, men publicera inte fotot och använd det inte för andra ändamål utan budbärarens tillstånd. Efter leverans av dina saker är du skyldig att ta bort fotot, att inte göra det kan ha konsekvenser.'
      },
      scammers: {
        title: 'Bedragare',
        description: 'Bedragare förfinar sina metoder, vi ringer dig aldrig oväntat för att be om ditt kort-PIN, bankdetaljer, fullständigt lösenord, kontosäkerhetskod, ccv (3 siffror) på baksidan av ditt kort, kontonummer (Micr) och personlig information. Var vaksam!'
      },
      payment: {
        title: 'Betalning',
        description: 'Betala aldrig offline eller överför pengar till ett annat konto. Vårt betalningssystem är utformat för att skydda våra användare.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Nödnummer',
        description: 'Spara dessa nödnummer: Lokal polis (911), PiqDrop support (1-800-PIQDROP) och dina lokala nödtjänster.'
      },
      locationSharing: {
        title: 'Platsdelning',
        description: 'Dela din plats i realtid med betrodda kontakter under leveransen. Aktivera platsdelning i dina enhetsinställningar för extra säkerhet.'
      },
      verificationChecklist: {
        title: 'Verifieringschecklista',
        description: 'Använd vår checklista före varje leverans: ID-verifiering, profilmatchning, betalningsbekräftelse och säkerhetskontroll av leveransplatsen.'
      },
      reportIssues: {
        title: 'Rapportera problem',
        description: 'Rapportera omedelbart eventuella säkerhetsproblem eller misstänkt aktivitet via appen. Vårt säkerhetsteam är tillgängligt dygnet runt för att hjälpa dig.'
      }
    }
  },
  report: {
    title: 'Rapportera',
    tabs: {
      guide: 'Guide',
      tools: 'Verktyg'
    },
    guide: {
      title: 'Hur man rapporterar',
      description: 'Rapportera omedelbart eventuellt misstänkt eller olämpligt beteende.'
    },
    tools: {
      title: 'Rapporteringsverktyg',
      description: 'Använd dessa verktyg för att rapportera och blockera användare, flagga innehåll eller kontakta support för omedelbar hjälp.',
      blockUser: 'Blockera användare: Tryck på användarprofilen och välj \'Blockera\' för att förhindra kontakt med dig',
      flagContent: 'Flagga innehåll: Använd flaggikonen på olämpligt innehåll',
      contactSupport: 'Kontakta support: Skicka e-post till support@piqdrop.com för omedelbar hjälp'
    },
    reportButton: 'Rapportera',
    modal: {
      title: 'Rapportera',
      options: {
        unsolicited: 'Oönskade förfrågningar om nakna eller sexuella bilder.',
        underage: 'Deltagare under 18 år.',
        spam: 'Spam'
      },
      emailSent: 'E-post skickad till support@piqdrop.com'
    }
  },
  faq: {
    title: 'FAQ',
    search: 'Sök',
    noFaqsFound: 'Inga FAQ hittades.',
    getSupport: 'Få support',
    loading: 'Laddar...',
    error: 'Kunde inte ladda FAQ'
  },
  supportService: {
    title: 'Kundtjänst',
    placeholder: 'Ange meddelande',
    today: 'Idag',
    customerService: {
      greeting: 'Hej!',
      intro: 'Jag är kundtjänst, finns det ett problem? Jag kan hjälpa dig att lösa det.'
    }
  },
  notification: {
    title: 'Notifiering',
    new: 'Ny',
    today: 'Idag',
    yesterday: 'Igår',
    newFeature: {
      title: 'Ny funktion tillgänglig',
      description: 'Vi har lagt till en ny funktion som låter dig anpassa dina profilinställningar och preferenser. Kolla in den!'
    },
    maintenance: {
      title: 'Underhållsuppdatering',
      description: 'Planerat underhåll är slutfört. Systemet fungerar nu med förbättrad stabilitet och prestanda.'
    }
  }
}; 