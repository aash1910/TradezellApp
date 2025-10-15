export default {
  navigation: {
    home: 'Startseite',
    messages: 'Nachrichten',
    manage: 'Verwalten',
    account: 'Konto'
  },
  common: {
    error: 'Fehler',
    ok: 'OK',
    success: 'Erfolg'
  },
  profile: {
    title: 'Profil',
    sections: {
      fullName: 'Vollständiger Name',
      email: 'E-Mail',
      gender: 'Geschlecht',
      mobile: 'Telefon'
    },
    actions: {
      editInfo: 'Informationen bearbeiten'
    }
  },
  account: {
    title: 'Konto',
    sections: {
      general: 'Allgemein',
      billingAndPlaces: 'Abrechnung und Orte',
      legal: 'Rechtliches',
      personal: 'Persönlich',
      social: 'Sozial'
    },
    profileInfo: {
      personalInfo: 'Persönliche Informationen',
      safety: 'Sicherheit',
      language: 'Sprache'
    },
    billingAndPlaces: {
      payment: 'Zahlung',
      savedPlaces: 'Gespeicherte Orte',
      addPlace: 'Ort hinzufügen'
    },
    legal: {
      termsOfUse: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzerklärung'
    },
    personal: {
      reportBug: 'Fehler melden',
      logout: 'Abmelden'
    },
    social: {
      support: 'Support',
      shareApp: 'App teilen'
    },
    deleteAccount: 'Konto löschen',
    modals: {
      logout: {
        title: 'Abmelden',
        message: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
        cancel: 'Abbrechen',
        confirm: 'Abmelden'
      },
      deleteAccount: {
        title: 'Konto löschen',
        message: 'Es tut uns leid, Sie gehen zu sehen. Bitte kontaktieren Sie unseren Kundenservice, um Ihnen beim Löschen Ihres Kontos zu helfen. Sie werden Ihnen helfen, einen reibungslosen Prozess sicherzustellen und Ihre Probleme zu lösen.',
        cancel: 'Abbrechen',
        contactSupport: 'Support kontaktieren'
      },
      savedPlaces: {
        title: 'Gespeicherte Orte',
        pickupLocation: 'Abholort',
        dropoffLocation: 'Abgabeort',
        notSet: 'Nicht festgelegt'
      },
      addPlace: {
        editTitle: '{{type}} Ort bearbeiten',
        addTitle: '{{type}} Ort hinzufügen',
        address: 'Adresse',
        addressPlaceholder: 'Ort auswählen',
        pickFromMap: 'Aus Karte auswählen',
        enterManually: 'Manuell eingeben',
        mapHint: 'Tippen Sie auf die Karte, um einen Ort auszuwählen',
        updateLocation: 'Ort aktualisieren',
        addLocation: 'Ort hinzufügen'
      }
    }
  },
  packageForm: {
    title: 'Paket senden',
    pickupDetails: 'Abholdetails',
    dropoffDetails: 'Abgabedetails',
    sender: 'Absender',
    receiver: 'Empfänger',
    name: 'Name',
    number: 'Nummer',
    weight: 'Gewicht',
    price: 'Preis',
    location: 'Ort',
    pickFromMap: 'Aus Karte auswählen',
    enterManually: 'Manuell eingeben',
    useThisAddress: 'Diese Adresse verwenden',
    enterPickupAddress: 'Abholadresse eingeben',
    enterDropoffAddress: 'Lieferadresse eingeben',
    addressNote: 'Bitte geben Sie die vollständige Adresse einschließlich Straße, Stadt und Postleitzahl für genaue Ergebnisse ein.',
    moreDetails: 'Weitere Details',
    pickupDateAndTime: 'Abholtermin und -zeit',
    timeZoneHint: 'Zeitzone basiert auf Abholort',
    timeZoneInfo: 'Zeitzone basiert auf Abholort',
    done: 'Fertig',
    postJob: 'Auftrag veröffentlichen',
    updateJob: 'Auftrag aktualisieren',
    mapHint: 'Tippen Sie auf die Karte, um einen Ort auszuwählen',
    dropoff: 'Abgabe',
    validation: {
      pickupNameRequired: 'Name des Absenders ist erforderlich',
      pickupPhoneRequired: 'Telefonnummer des Absenders ist erforderlich',
      invalidPickupPhone: 'Ungültige Telefonnummer des Absenders',
      pickupLocationRequired: 'Abholort ist erforderlich',
      weightRequired: 'Gewicht ist erforderlich',
      invalidWeight: 'Ungültiger Gewichtswert',
      priceRequired: 'Preis ist erforderlich',
      invalidPrice: 'Ungültiger Preiswert',
      invalidDate: 'Ungültiges Datum - muss heute oder in der Zukunft sein',
      receiverNameRequired: 'Name des Empfängers ist erforderlich',
      receiverPhoneRequired: 'Telefonnummer des Empfängers ist erforderlich',
      invalidReceiverPhone: 'Ungültige Telefonnummer des Empfängers',
      receiverLocationRequired: 'Lieferort ist erforderlich',
      fixErrors: 'Bitte korrigieren Sie die folgenden Fehler',
      jobPostedSuccess: 'Auftrag erfolgreich veröffentlicht',
      createPackageError: 'Fehler beim Erstellen des Pakets. Bitte versuchen Sie es erneut.'
    },
    updateSuccess: 'Paket erfolgreich aktualisiert',
    createSuccess: 'Paket erfolgreich erstellt',
    saveFailed: 'Paket konnte nicht gespeichert werden'
  },
  managePage: {
    title: 'Meine Aufträge',
    tabs: {
      ongoing: 'Laufend',
      accepted: 'Akzeptiert',
      completed: 'Abgeschlossen',
      canceled: 'Storniert'
    },
    deliveryOverview: 'Lieferübersicht',
    emptyStates: {
      ongoing: {
        title: 'Sie haben noch keine Aufträge',
        message: 'Sie haben derzeit keine laufenden Aufträge'
      },
      accepted: {
        title: 'Keine akzeptierten Aufträge',
        message: 'Sie haben derzeit keine akzeptierten Aufträge'
      },
      completed: {
        title: 'Abgeschlossene Aufträge werden hier angezeigt',
        message: 'Sie haben derzeit keine abgeschlossenen Aufträge'
      },
      canceled: {
        title: 'Liste der stornierten Aufträge ist leer',
        message: 'Sie haben derzeit keine stornierten Aufträge'
      }
    },
    orderStatus: {
      inProgress: 'In Bearbeitung',
      accepted: 'Akzeptiert',
      completed: 'Abgeschlossen',
      canceled: 'Storniert'
    },
    actions: {
      acceptDelivery: 'Lieferung annehmen',
      cancelDelivery: 'Lieferung stornieren',
      editDelivery: 'Lieferung bearbeiten',
      leaveReview: 'Bewertung abgeben',
      viewReview: 'Bewertung anzeigen',
      sendMessage: 'Nachricht senden'
    },
    deliveryCompleted: {
      title: 'Lieferung abgeschlossen!',
      message: 'Bitte teilen Sie uns Ihre Erfahrung und den Service mit, den Ihr Kurier erbracht hat. Dies wird uns helfen, unser System zu verbessern. Vielen Dank für die Nutzung von PiqDrop!',
      leaveReview: 'Bewertung abgeben',
      maybeLater: 'Vielleicht später'
    },
    cancelConfirmation: {
      title: 'Stornierung bestätigen',
      from: 'Von:',
      to: 'An:',
      date: 'Datum:',
      back: 'Zurück',
      confirmCancel: 'Ja, stornieren!'
    }
  },
  orderDetail: {
    title: 'Auftragsdetails',
    pickupDetails: {
      title: 'Abholdetails',
      name: 'Name:',
      number: 'Nummer:',
      weight: 'Gewicht:',
      price: 'Preis:',
      location: 'Ort:',
      note: 'Notiz'
    },
    dropoffDetails: {
      title: 'Abgabedetails',
      name: 'Name:',
      number: 'Nummer:',
      location: 'Ort:',
      note: 'Notiz'
    },
    orderConfirmation: {
      title: 'Auftragsbestätigung',
      from: 'Von:',
      to: 'An:',
      date: 'Datum:',
      back: 'Zurück',
      confirm: 'Ja, bestätigen!'
    },
    takeOrder: 'Auftrag annehmen!'
  },
  review: {
    title: 'Bewertung abgeben',
    viewTitle: 'Ihre Bewertung',
    rider: 'Fahrer',
    experienceQuestion: 'Wie war Ihre Erfahrung mit dem Fahrer?',
    writeReview: 'Bewertung schreiben',
    enterReview: 'Bewertung eingeben',
    maybeLater: 'Vielleicht später',
    submitReview: 'Bewertung absenden',
    submitting: 'Wird gesendet...',
    yourRating: 'Ihre Bewertung',
    yourReview: 'Ihre Bewertung',
    close: 'Schließen',
    validation: {
      selectRating: 'Bitte wählen Sie eine Bewertung',
      writeReview: 'Bitte schreiben Sie eine Bewertung'
    },
    success: {
      title: 'Erfolg',
      message: 'Bewertung erfolgreich gesendet'
    },
    error: {
      fetchFailed: 'Bewertung konnte nicht geladen werden'
    }
  },
  updateProfile: {
    title: 'Informationen aktualisieren',
    firstName: 'Vorname',
    lastName: 'Nachname',
    mobile: 'Telefon',
    address: 'Adresse',
    dateOfBirth: 'Geburtsdatum',
    nationality: 'Nationalität',
    gender: 'Geschlecht',
    update: 'Aktualisieren',
    updating: 'Wird aktualisiert...',
    success: 'Profil erfolgreich aktualisiert',
    error: 'Profil konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    validationError: 'Validierungsfehler',
    invalidPhone: 'Ungültiges Telefonnummerformat',
    mapHint: 'Tippen Sie auf die Karte, um einen Ort auszuwählen',
    close: 'Schließen',
    done: 'Fertig',
    cancel: 'Abbrechen',
    selectLocation: 'Ort auswählen',
    manualEntry: 'Manuelle Eingabe',
    typeAddress: 'Adresse hier eingeben'
  },
  safety: {
    title: 'Sicherheitscenter',
    greeting: 'Hallo',
    subtitle: 'Hier ist, was Sie über Sicherheit wissen müssen',
    tabs: {
      guide: 'Anleitung',
      tools: 'Werkzeuge'
    },
    guide: {
      checkId: {
        title: 'ID überprüfen',
        description: 'Überprüfen Sie den Ausweis oder Pass des Kuriers, bevor Sie ihm Ihre Sachen übergeben, stellen Sie sicher, dass er mit dem Profil auf der Plattform übereinstimmt.'
      },
      careful: {
        title: 'Seien Sie vorsichtig',
        description: 'Machen Sie wenn möglich ein Selfie mit Ihrem Kurier. Dies erleichtert die Identifizierung Ihres Kuriers, falls etwas passiert, veröffentlichen Sie das Foto jedoch nicht und verwenden Sie es nicht für andere Zwecke ohne Erlaubnis des Kuriers. Nach der Lieferung Ihrer Sachen sind Sie verpflichtet, das Foto zu löschen, nicht zu tun kann Konsequenzen haben.'
      },
      scammers: {
        title: 'Betrüger',
        description: 'Betrüger verfeinern ihre Methoden, wir rufen Sie nie unerwartet an, um nach Ihrer Karten-PIN, Bankdaten, vollständigem Passwort, Kontosicherheitscode, ccv (3 Ziffern) auf der Rückseite Ihrer Karte, Kontonummer (Micr) und persönlichen Informationen zu fragen. Seien Sie wachsam!'
      },
      payment: {
        title: 'Zahlung',
        description: 'Zahlen Sie nie offline oder überweisen Sie Geld auf ein anderes Konto. Unser Zahlungssystem ist darauf ausgelegt, unsere Benutzer zu schützen.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Notfallkontakte',
        description: 'Speichern Sie diese Notfallnummern: Lokale Polizei (911), PiqDrop Support (1-800-PIQDROP) und Ihre lokalen Notdienste.'
      },
      locationSharing: {
        title: 'Standortfreigabe',
        description: 'Teilen Sie Ihren Standort in Echtzeit mit vertrauenswürdigen Kontakten während der Lieferung. Aktivieren Sie die Standortfreigabe in Ihren Geräteeinstellungen für zusätzliche Sicherheit.'
      },
      verificationChecklist: {
        title: 'Verifizierungscheckliste',
        description: 'Verwenden Sie unsere Checkliste vor jeder Lieferung: ID-Verifizierung, Profilübereinstimmung, Zahlungsbestätigung und Sicherheitsüberprüfung des Lieferorts.'
      },
      reportIssues: {
        title: 'Probleme melden',
        description: 'Melden Sie sofort alle Sicherheitsprobleme oder verdächtige Aktivitäten über die App. Unser Sicherheitsteam ist rund um die Uhr verfügbar, um Ihnen zu helfen.'
      }
    }
  },
  report: {
    title: 'Melden',
    tabs: {
      guide: 'Anleitung',
      tools: 'Werkzeuge'
    },
    guide: {
      title: 'Wie man meldet',
      description: 'Melden Sie sofort verdächtiges oder unangemessenes Verhalten.'
    },
    tools: {
      title: 'Meldewerkzeuge',
      description: 'Verwenden Sie diese Werkzeuge, um Benutzer zu melden und zu blockieren, Inhalte zu kennzeichnen oder den Support für sofortige Hilfe zu kontaktieren.',
      blockUser: 'Benutzer blockieren: Tippen Sie auf das Benutzerprofil und wählen Sie \'Blockieren\', um Kontakt mit Ihnen zu verhindern',
      flagContent: 'Inhalt kennzeichnen: Verwenden Sie das Kennzeichnungssymbol für unangemessene Inhalte',
      contactSupport: 'Support kontaktieren: Senden Sie eine E-Mail an support@piqdrop.com für sofortige Hilfe'
    },
    reportButton: 'Melden',
    modal: {
      title: 'Melden',
      options: {
        unsolicited: 'Unaufgeforderte Anfragen nach nackten oder sexuellen Bildern.',
        underage: 'Teilnehmer unter 18 Jahren.',
        spam: 'Spam'
      },
      emailSent: 'E-Mail an support@piqdrop.com gesendet'
    }
  },
  faq: {
    title: 'FAQ',
    search: 'Suchen',
    noFaqsFound: 'Keine FAQs gefunden.',
    getSupport: 'Support erhalten',
    loading: 'Wird geladen...',
    error: 'FAQs konnten nicht geladen werden'
  },
  supportService: {
    title: 'Kundenservice',
    placeholder: 'Nachricht eingeben',
    today: 'Heute',
    customerService: {
      greeting: 'Hallo!',
      intro: 'Ich bin der Kundenservice, gibt es ein Problem? Ich kann Ihnen helfen, es zu lösen.'
    }
  },
  notification: {
    title: 'Benachrichtigung',
    new: 'Neu',
    today: 'Heute',
    yesterday: 'Gestern',
    newFeature: {
      title: 'Neue Funktion verfügbar',
      description: 'Wir haben eine neue Funktion hinzugefügt, mit der Sie Ihre Profileinstellungen und Präferenzen anpassen können. Schauen Sie es sich an!'
    },
    maintenance: {
      title: 'Wartungsupdate',
      description: 'Geplante Wartung ist abgeschlossen. Das System läuft jetzt mit verbesserter Stabilität und Leistung.'
    }
  }
}; 