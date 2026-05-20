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
    subtitle: 'Håll dig säker när du byter, säljer och köper på Tradezell',
    tabs: {
      guide: 'Guide',
      tools: 'Verktyg'
    },
    guide: {
      checkId: {
        title: 'Verifiera identitet',
        description: 'Innan du träffas för byte eller försäljning, kontrollera den andra personens pass eller internationella ID och bekräfta att det matchar Tradezell-profilen. Slutför personliga byten endast med verifierade användare.'
      },
      careful: {
        title: 'Möt på en offentlig plats',
        description: 'Genomför alltid byten på en livlig, välbelyst offentlig plats, t.ex. café, köpcentrum eller säker bytespunkt. Möt aldrig ensam i ett privat hem.'
      },
      scammers: {
        title: 'Akta dig för bedragare',
        description: 'Tradezell kommer aldrig att be om ditt kort-PIN, bankuppgifter, fullständigt lösenord, säkerhetskoder eller personlig information. Var misstänksam mot den som ber dig betala utanför appen.'
      },
      payment: {
        title: 'Betalningar i appen',
        description: 'Varje annonsfoto kostar $2,98 via vårt säkra betalningssystem. Håll betalningar inom Tradezell för ditt skydd. Avgifter gäller enligt policy när köpare byter till försäljning eller byte.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Dela appen',
        description: 'Berätta för vänner eller familj att du använder Tradezell. Dela dina mötesplaner med någon du litar på innan du byter eller säljer personligen.'
      },
      locationSharing: {
        title: 'Dela din plats',
        description: 'Dela din live-plats med en betrodd kontakt när du går till ett byte- eller försäljningsmöte. Aktivera platsdelning i enhetsinställningarna.'
      },
      verificationChecklist: {
        title: 'Checklista före byte',
        description: 'Innan ni möts: bekräfta ID-verifiering på profilen, granska annonsfoton, kom överens om föremål i chatten och välj en säker offentlig plats.'
      },
      reportIssues: {
        title: 'Rapportera ett problem',
        description: 'Rapportera misstänkta annonser, falska profiler eller osäkert beteende via appen. Du kan avmatcha när som helst om du ångrar dig.'
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