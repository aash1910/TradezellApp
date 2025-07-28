export default {
  navigation: {
    home: 'Accueil',
    messages: 'Messages',
    manage: 'Gérer',
    account: 'Compte'
  },
  common: {
    error: 'Erreur',
    ok: 'OK',
    success: 'Succès'
  },
  profile: {
    title: 'Profil',
    sections: {
      fullName: 'Nom complet',
      email: 'E-mail',
      gender: 'Genre',
      mobile: 'Téléphone'
    },
    actions: {
      editInfo: 'Modifier les informations'
    }
  },
  account: {
    title: 'Compte',
    sections: {
      general: 'Général',
      billingAndPlaces: 'Facturation et lieux',
      legal: 'Légal',
      personal: 'Personnel',
      social: 'Social'
    },
    profileInfo: {
      personalInfo: 'Informations personnelles',
      safety: 'Sécurité',
      language: 'Langue'
    },
    billingAndPlaces: {
      payment: 'Paiement',
      savedPlaces: 'Lieux enregistrés',
      addPlace: 'Ajouter un lieu'
    },
    legal: {
      termsOfUse: 'Conditions d\'utilisation',
      privacyPolicy: 'Politique de confidentialité'
    },
    personal: {
      reportBug: 'Signaler un bug',
      logout: 'Déconnexion'
    },
    social: {
      support: 'Support',
      shareApp: 'Partager l\'application'
    },
    deleteAccount: 'Supprimer le compte',
    modals: {
      logout: {
        title: 'Déconnexion',
        message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        cancel: 'Annuler',
        confirm: 'Déconnexion'
      },
      deleteAccount: {
        title: 'Supprimer le compte',
        message: 'Nous sommes désolés de vous voir partir. Veuillez contacter notre service client pour vous aider à supprimer votre compte. Ils vous aideront à assurer un processus fluide et à résoudre vos problèmes.',
        cancel: 'Annuler',
        contactSupport: 'Contacter le support'
      },
      savedPlaces: {
        title: 'Lieux enregistrés',
        pickupLocation: 'Lieu de ramassage',
        dropoffLocation: 'Lieu de livraison',
        notSet: 'Non défini'
      },
      addPlace: {
        editTitle: 'Modifier le lieu {{type}}',
        addTitle: 'Ajouter un lieu {{type}}',
        address: 'Adresse',
        addressPlaceholder: 'Sélectionner un lieu',
        pickFromMap: 'Choisir sur la carte',
        enterManually: 'Saisir manuellement',
        mapHint: 'Appuyez sur la carte pour sélectionner un lieu',
        updateLocation: 'Mettre à jour le lieu',
        addLocation: 'Ajouter le lieu'
      }
    }
  },
  packageForm: {
    title: 'Envoyer un colis',
    pickupDetails: 'Détails de ramassage',
    dropoffDetails: 'Détails de livraison',
    sender: 'Expéditeur',
    receiver: 'Destinataire',
    name: 'Nom',
    number: 'Numéro',
    weight: 'Poids',
    price: 'Prix',
    location: 'Lieu',
    pickFromMap: 'Choisir sur la carte',
    enterManually: 'Saisir manuellement',
    useThisAddress: 'Utiliser cette adresse',
    enterPickupAddress: 'Saisir l\'adresse de ramassage',
    enterDropoffAddress: 'Saisir l\'adresse de livraison',
    addressNote: 'Veuillez saisir l\'adresse complète incluant la rue, la ville et le code postal pour des résultats précis.',
    moreDetails: 'Plus de détails',
    pickupDateAndTime: 'Date et heure de ramassage',
    timeZoneHint: 'Le fuseau horaire est basé sur le lieu de ramassage',
    timeZoneInfo: 'Le fuseau horaire est basé sur le lieu de ramassage',
    done: 'Terminé',
    postJob: 'Publier la tâche',
    updateJob: 'Mettre à jour la tâche',
    mapHint: 'Appuyez sur la carte pour sélectionner un lieu',
    dropoff: 'Livraison',
    validation: {
      pickupNameRequired: 'Le nom de l\'expéditeur est requis',
      pickupPhoneRequired: 'Le numéro de téléphone de l\'expéditeur est requis',
      invalidPickupPhone: 'Numéro de téléphone de l\'expéditeur invalide',
      pickupLocationRequired: 'L\'emplacement de ramassage est requis',
      weightRequired: 'Le poids est requis',
      invalidWeight: 'Valeur de poids invalide',
      priceRequired: 'Le prix est requis',
      invalidPrice: 'Valeur de prix invalide',
      invalidDate: 'Date invalide - doit être aujourd\'hui ou dans le futur',
      receiverNameRequired: 'Le nom du destinataire est requis',
      receiverPhoneRequired: 'Le numéro de téléphone du destinataire est requis',
      invalidReceiverPhone: 'Numéro de téléphone du destinataire invalide',
      receiverLocationRequired: 'L\'emplacement de livraison est requis',
      fixErrors: 'Veuillez corriger les erreurs suivantes',
      jobPostedSuccess: 'Travail publié avec succès',
      createPackageError: 'Échec de la création du colis. Veuillez réessayer.'
    },
    updateSuccess: 'Colis mis à jour avec succès',
    createSuccess: 'Colis créé avec succès',
    saveFailed: 'Échec de l\'enregistrement du colis'
  },
  managePage: {
    title: 'Mes commandes',
    tabs: {
      ongoing: 'En cours',
      accepted: 'Acceptées',
      completed: 'Terminées',
      canceled: 'Annulées'
    },
    deliveryOverview: 'Aperçu de la livraison',
    emptyStates: {
      ongoing: {
        title: 'Vous n\'avez pas encore de commandes',
        message: 'Vous n\'avez pas de commandes en cours pour le moment'
      },
      accepted: {
        title: 'Aucune commande acceptée',
        message: 'Vous n\'avez pas de commandes acceptées pour le moment'
      },
      completed: {
        title: 'Les commandes terminées apparaîtront ici',
        message: 'Vous n\'avez pas de commandes terminées pour le moment'
      },
      canceled: {
        title: 'La liste des commandes annulées est vide',
        message: 'Vous n\'avez pas de commandes annulées pour le moment'
      }
    },
    orderStatus: {
      inProgress: 'En cours',
      accepted: 'Acceptée',
      completed: 'Terminée',
      canceled: 'Annulée'
    },
    actions: {
      completeDelivery: 'Terminer la livraison',
      cancelDelivery: 'Annuler la livraison',
      editDelivery: 'Modifier la livraison',
      leaveReview: 'Laisser un avis',
      sendMessage: 'Envoyer un message'
    },
    deliveryCompleted: {
      title: 'Livraison terminée !',
      message: 'Veuillez nous faire part de votre expérience et du service fourni par votre livreur. Cela nous permettra d\'améliorer notre système. Merci d\'utiliser PiqDrop !',
      leaveReview: 'Laisser un avis',
      maybeLater: 'Peut-être plus tard'
    },
    cancelConfirmation: {
      title: 'Confirmation d\'annulation',
      from: 'De :',
      to: 'À :',
      date: 'Date :',
      back: 'Retour',
      confirmCancel: 'Oui, annuler !'
    }
  },
  orderDetail: {
    title: 'Détails de la commande',
    pickupDetails: {
      title: 'Détails de ramassage',
      name: 'Nom :',
      number: 'Numéro :',
      weight: 'Poids :',
      price: 'Prix :',
      location: 'Lieu :',
      note: 'Note'
    },
    dropoffDetails: {
      title: 'Détails de livraison',
      name: 'Nom :',
      number: 'Numéro :',
      location: 'Lieu :',
      note: 'Note'
    },
    orderConfirmation: {
      title: 'Confirmation de commande',
      from: 'De :',
      to: 'À :',
      date: 'Date :',
      back: 'Retour',
      confirm: 'Oui, confirmer !'
    },
    takeOrder: 'Accepter la commande !'
  },
  review: {
    title: 'Laisser un avis',
    dropper: 'Livreur',
    experienceQuestion: 'Comment était votre expérience avec le livreur ?',
    writeReview: 'Écrire un avis',
    enterReview: 'Saisir un avis',
    maybeLater: 'Peut-être plus tard',
    submitReview: 'Soumettre l\'avis',
    submitting: 'Soumission...',
    validation: {
      selectRating: 'Veuillez sélectionner une note',
      writeReview: 'Veuillez écrire un avis'
    },
    success: {
      title: 'Succès',
      message: 'Avis soumis avec succès'
    }
  },
  updateProfile: {
    title: 'Mettre à jour les informations',
    firstName: 'Prénom',
    lastName: 'Nom',
    mobile: 'Téléphone',
    address: 'Adresse',
    dateOfBirth: 'Date de naissance',
    nationality: 'Nationalité',
    gender: 'Genre',
    update: 'Mettre à jour',
    updating: 'Mise à jour...',
    success: 'Profil mis à jour avec succès',
    error: 'Échec de la mise à jour du profil. Veuillez réessayer.',
    validationError: 'Erreur de validation',
    invalidPhone: 'Format de numéro de téléphone invalide',
    mapHint: 'Appuyez sur la carte pour sélectionner un lieu',
    close: 'Fermer',
    done: 'Terminé',
    cancel: 'Annuler',
    selectLocation: 'Sélectionner un lieu',
    manualEntry: 'Saisie manuelle',
    typeAddress: 'Saisissez l\'adresse ici'
  },
  safety: {
    title: 'Centre de sécurité',
    greeting: 'Bonjour',
    subtitle: 'Voici ce que vous devez savoir sur la sécurité',
    tabs: {
      guide: 'Guide',
      tools: 'Outils'
    },
    guide: {
      checkId: {
        title: 'Vérifier l\'identité',
        description: 'Vérifiez la pièce d\'identité ou le passeport du livreur avant de lui remettre vos affaires, assurez-vous qu\'il correspond au profil sur la plateforme.'
      },
      careful: {
        title: 'Soyez prudent',
        description: 'Prenez un selfie avec votre livreur si possible. Cela facilitera l\'identification de votre livreur si quelque chose se produit, cependant, ne publiez pas la photo et ne l\'utilisez pas à d\'autres fins sans l\'autorisation du livreur. Après la livraison de vos affaires, vous êtes tenu de supprimer la photo, ne pas le faire peut avoir des conséquences.'
      },
      scammers: {
        title: 'Arnaqueurs',
        description: 'Les arnaqueurs perfectionnent leurs méthodes, nous ne vous appellerons jamais de manière inattendue pour demander le code PIN de votre carte, les détails bancaires, le mot de passe complet, le code d\'accès sécurisé au compte, le ccv (3 chiffres) au dos de votre carte, le numéro de compte (Micr) et les informations personnelles. Soyez vigilant !'
      },
      payment: {
        title: 'Paiement',
        description: 'Ne payez jamais hors ligne ou ne transférez pas d\'argent sur un autre compte. Notre système de paiement est conçu pour protéger nos utilisateurs.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Contacts d\'urgence',
        description: 'Enregistrez ces numéros d\'urgence : Police locale (911), Support PiqDrop (1-800-PIQDROP) et vos services d\'urgence locaux.'
      },
      locationSharing: {
        title: 'Partage de localisation',
        description: 'Partagez votre localisation en temps réel avec des contacts de confiance pendant la livraison. Activez le partage de localisation dans les paramètres de votre appareil pour une sécurité accrue.'
      },
      verificationChecklist: {
        title: 'Liste de vérification',
        description: 'Utilisez notre liste de vérification avant chaque livraison : vérification de l\'identité, correspondance du profil, confirmation du paiement et vérification de la sécurité du lieu de livraison.'
      },
      reportIssues: {
        title: 'Signaler des problèmes',
        description: 'Signalez immédiatement tout problème de sécurité ou activité suspecte via l\'application. Notre équipe de sécurité est disponible 24/7 pour vous aider.'
      }
    }
  },
  report: {
    title: 'Signaler',
    tabs: {
      guide: 'Guide',
      tools: 'Outils'
    },
    guide: {
      title: 'Comment signaler',
      description: 'Signalez immédiatement tout comportement suspect ou inapproprié.'
    },
    tools: {
      title: 'Outils de signalement',
      description: 'Utilisez ces outils pour signaler et bloquer des utilisateurs, marquer du contenu ou contacter le support pour une assistance immédiate.',
      blockUser: 'Bloquer un utilisateur : Appuyez sur le profil de l\'utilisateur et sélectionnez \'Bloquer\' pour empêcher tout contact avec vous',
      flagContent: 'Marquer du contenu : Utilisez l\'icône de marquage sur tout contenu inapproprié',
      contactSupport: 'Contacter le support : Envoyez un e-mail à support@piqdrop.com pour une assistance immédiate'
    },
    reportButton: 'Signaler',
    modal: {
      title: 'Signaler',
      options: {
        unsolicited: 'Demandes non sollicitées d\'images nues ou sexuelles.',
        underage: 'Participant âgé de moins de 18 ans.',
        spam: 'Spam'
      },
      emailSent: 'E-mail envoyé à support@piqdrop.com'
    }
  },
  faq: {
    title: 'FAQ',
    search: 'Rechercher',
    noFaqsFound: 'Aucune FAQ trouvée.',
    getSupport: 'Obtenir de l\'aide',
    loading: 'Chargement...',
    error: 'Échec du chargement des FAQ'
  },
  supportService: {
    title: 'Service client',
    placeholder: 'Saisir un message',
    today: 'Aujourd\'hui',
    customerService: {
      greeting: 'Bonjour !',
      intro: 'Je suis le service client, y a-t-il un problème ? Je peux vous aider à le résoudre.'
    }
  },
  notification: {
    title: 'Notification',
    new: 'Nouveau',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    newFeature: {
      title: 'Nouvelle fonctionnalité disponible',
      description: 'Nous avons ajouté une nouvelle fonctionnalité qui vous permet de personnaliser les paramètres et préférences de votre profil. Découvrez-la !'
    },
    maintenance: {
      title: 'Mise à jour de maintenance',
      description: 'La maintenance planifiée est terminée. Le système fonctionne maintenant avec une stabilité et des performances améliorées.'
    }
  }
}; 