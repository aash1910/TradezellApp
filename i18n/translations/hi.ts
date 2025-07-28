export default {
  navigation: {
    home: 'होम',
    messages: 'संदेश',
    manage: 'प्रबंधित करें',
    account: 'खाता'
  },
  common: {
    error: 'त्रुटि',
    ok: 'ठीक है',
    success: 'सफलता'
  },
  profile: {
    title: 'प्रोफ़ाइल',
    sections: {
      fullName: 'पूरा नाम',
      email: 'ईमेल',
      gender: 'लिंग',
      mobile: 'मोबाइल'
    },
    actions: {
      editInfo: 'जानकारी संपादित करें'
    }
  },
  account: {
    title: 'खाता',
    sections: {
      general: 'सामान्य',
      billingAndPlaces: 'बिलिंग और स्थान',
      legal: 'कानूनी',
      personal: 'व्यक्तिगत',
      social: 'सामाजिक'
    },
    profileInfo: {
      personalInfo: 'व्यक्तिगत जानकारी',
      safety: 'सुरक्षा',
      language: 'भाषा'
    },
    billingAndPlaces: {
      payment: 'भुगतान',
      savedPlaces: 'सहेजे गए स्थान',
      addPlace: 'स्थान जोड़ें'
    },
    legal: {
      termsOfUse: 'उपयोग की शर्तें',
      privacyPolicy: 'गोपनीयता नीति'
    },
    personal: {
      reportBug: 'बग की रिपोर्ट करें',
      logout: 'लॉग आउट'
    },
    social: {
      support: 'सहायता',
      shareApp: 'ऐप शेयर करें'
    },
    deleteAccount: 'खाता हटाएं',
    modals: {
      logout: {
        title: 'लॉग आउट',
        message: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
        cancel: 'रद्द करें',
        confirm: 'लॉग आउट'
      },
      deleteAccount: {
        title: 'खाता हटाएं',
        message: 'आपको जाते हुए देखकर हमें खेद है। कृपया खाता हटाने में सहायता के लिए हमारी सहायता टीम से संपर्क करें। वे एक सहज प्रक्रिया सुनिश्चित करने और आपकी किसी भी चिंता को दूर करने में मदद करेंगे।',
        cancel: 'रद्द करें',
        contactSupport: 'सहायता से संपर्क करें'
      },
      savedPlaces: {
        title: 'सहेजे गए स्थान',
        pickupLocation: 'पिकअप स्थान',
        dropoffLocation: 'ड्रॉपऑफ स्थान',
        notSet: 'सेट नहीं'
      },
      addPlace: {
        editTitle: '{{type}} स्थान संपादित करें',
        addTitle: '{{type}} स्थान जोड़ें',
        address: 'पता',
        addressPlaceholder: 'स्थान चुनें',
        pickFromMap: 'मानचित्र से चुनें',
        enterManually: 'मैन्युअल रूप से दर्ज करें',
        mapHint: 'स्थान चुनने के लिए मानचित्र पर टैप करें',
        updateLocation: 'स्थान अपडेट करें',
        addLocation: 'स्थान जोड़ें'
      }
    }
  },
  packageForm: {
    title: 'पैकेज भेजें',
    pickupDetails: 'पिकअप विवरण',
    dropoffDetails: 'ड्रॉपऑफ विवरण',
    sender: 'प्रेषक',
    receiver: 'प्राप्तकर्ता',
    name: 'नाम',
    number: 'नंबर',
    weight: 'वजन',
    price: 'मूल्य',
    location: 'स्थान',
    pickFromMap: 'मानचित्र से चुनें',
    enterManually: 'मैन्युअल रूप से दर्ज करें',
    useThisAddress: 'इस पते का उपयोग करें',
    enterPickupAddress: 'पिकअप पता दर्ज करें',
    enterDropoffAddress: 'ड्रॉपऑफ पता दर्ज करें',
    addressNote: 'सटीक परिणामों के लिए कृपया सड़क, शहर और पिन कोड सहित पूरा पता दर्ज करें।',
    moreDetails: 'अधिक विवरण',
    pickupDateAndTime: 'पिकअप तिथि और स्थान',
    timeZoneHint: 'समय क्षेत्र पिकअप स्थान पर आधारित है',
    timeZoneInfo: 'समय क्षेत्र पिकअप स्थान पर आधारित है',
    done: 'हो गया',
    postJob: 'नौकरी पोस्ट करें',
    updateJob: 'नौकरी अपडेट करें',
    mapHint: 'स्थान चुनने के लिए मानचित्र पर टैप करें',
    dropoff: 'ड्रॉपऑफ',
    validation: {
      pickupNameRequired: 'भेजने वाले का नाम आवश्यक है',
      pickupPhoneRequired: 'भेजने वाले का फोन नंबर आवश्यक है',
      invalidPickupPhone: 'भेजने वाले का अमान्य फोन नंबर',
      pickupLocationRequired: 'पिकअप स्थान आवश्यक है',
      weightRequired: 'वजन आवश्यक है',
      invalidWeight: 'अमान्य वजन मान',
      priceRequired: 'मूल्य आवश्यक है',
      invalidPrice: 'अमान्य मूल्य मान',
      invalidDate: 'अमान्य तिथि - आज या भविष्य की तिथि होनी चाहिए',
      receiverNameRequired: 'प्राप्तकर्ता का नाम आवश्यक है',
      receiverPhoneRequired: 'प्राप्तकर्ता का फोन नंबर आवश्यक है',
      invalidReceiverPhone: 'प्राप्तकर्ता का अमान्य फोन नंबर',
      receiverLocationRequired: 'डिलीवरी स्थान आवश्यक है',
      fixErrors: 'कृपया निम्नलिखित त्रुटियों को ठीक करें',
      jobPostedSuccess: 'नौकरी सफलतापूर्वक पोस्ट की गई',
      createPackageError: 'पैकेज बनाने में विफल। कृपया पुनः प्रयास करें।'
    },
    updateSuccess: 'पैकेज सफलतापूर्वक अपडेट किया गया',
    createSuccess: 'पैकेज सफलतापूर्वक बनाया गया',
    saveFailed: 'पैकेज सहेजने में विफल'
  },
  managePage: {
    title: 'मेरे ऑर्डर',
    tabs: {
      ongoing: 'चल रहे',
      accepted: 'स्वीकृत',
      completed: 'पूर्ण',
      canceled: 'रद्द'
    },
    deliveryOverview: 'डिलीवरी अवलोकन',
    emptyStates: {
      ongoing: {
        title: 'आपके पास अभी तक कोई ऑर्डर नहीं है',
        message: 'आपके पास इस समय चल रहे ऑर्डर नहीं हैं'
      },
      accepted: {
        title: 'कोई स्वीकृत ऑर्डर नहीं',
        message: 'आपके पास इस समय स्वीकृत ऑर्डर नहीं हैं'
      },
      completed: {
        title: 'पूर्ण ऑर्डर यहां दिखाई देंगे',
        message: 'आपके पास इस समय पूर्ण ऑर्डर नहीं हैं'
      },
      canceled: {
        title: 'रद्द किए गए ऑर्डर की सूची खाली है',
        message: 'आपके पास इस समय रद्द किए गए ऑर्डर नहीं हैं'
      }
    },
    orderStatus: {
      inProgress: 'प्रगति पर',
      accepted: 'स्वीकृत',
      completed: 'पूर्ण',
      canceled: 'रद्द'
    },
    actions: {
      completeDelivery: 'डिलीवरी पूरी करें',
      cancelDelivery: 'डिलीवरी रद्द करें',
      editDelivery: 'डिलीवरी संपादित करें',
      leaveReview: 'समीक्षा छोड़ें',
      sendMessage: 'संदेश भेजें'
    },
    deliveryCompleted: {
      title: 'डिलीवरी पूर्ण!',
      message: 'कृपया, ड्रॉपर द्वारा आपको प्रदान की गई सेवा और आपके अनुभव के बारे में हमें बताएं। यह हमें अपने सिस्टम को बेहतर बनाने में सक्षम करेगा। PiqDrop का उपयोग करने के लिए धन्यवाद!',
      leaveReview: 'समीक्षा छोड़ें',
      maybeLater: 'शायद बाद में'
    },
    cancelConfirmation: {
      title: 'रद्द करने की पुष्टि',
      from: 'से:',
      to: 'तक:',
      date: 'तिथि:',
      back: 'वापस',
      confirmCancel: 'हां, रद्द करें!'
    }
  },
  orderDetail: {
    title: 'ऑर्डर विवरण',
    pickupDetails: {
      title: 'पिकअप विवरण',
      name: 'नाम:',
      number: 'नंबर:',
      weight: 'वजन:',
      price: 'मूल्य:',
      location: 'स्थान:',
      note: 'नोट'
    },
    dropoffDetails: {
      title: 'ड्रॉपऑफ विवरण',
      name: 'नाम:',
      number: 'नंबर:',
      location: 'स्थान:',
      note: 'नोट'
    },
    orderConfirmation: {
      title: 'ऑर्डर पुष्टि',
      from: 'से:',
      to: 'तक:',
      date: 'तिथि:',
      back: 'वापस',
      confirm: 'हां, पुष्टि करें!'
    },
    takeOrder: 'ऑर्डर लें!'
  },
  review: {
    title: 'समीक्षा छोड़ें',
    dropper: 'ड्रॉपर',
    experienceQuestion: 'ड्रॉपर के साथ आपका अनुभव कैसा रहा?',
    writeReview: 'अपनी समीक्षा लिखें',
    enterReview: 'समीक्षा दर्ज करें',
    maybeLater: 'शायद बाद में',
    submitReview: 'समीक्षा जमा करें',
    submitting: 'जमा कर रहे हैं...',
    validation: {
      selectRating: 'कृपया रेटिंग चुनें',
      writeReview: 'कृपया समीक्षा लिखें'
    },
    success: {
      title: 'सफलता',
      message: 'समीक्षा सफलतापूर्वक जमा की गई'
    }
  },
  updateProfile: {
    title: 'जानकारी अपडेट करें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    mobile: 'मोबाइल नंबर',
    address: 'पता',
    dateOfBirth: 'जन्म तिथि',
    nationality: 'राष्ट्रीयता',
    gender: 'लिंग',
    update: 'अपडेट',
    updating: 'अपडेट कर रहे हैं...',
    success: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
    error: 'प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
    validationError: 'सत्यापन त्रुटि',
    invalidPhone: 'अमान्य फोन नंबर प्रारूप',
    mapHint: 'स्थान चुनने के लिए मानचित्र पर टैप करें',
    close: 'बंद करें',
    done: 'हो गया',
    cancel: 'रद्द करें',
    selectLocation: 'स्थान चुनें',
    manualEntry: 'मैन्युअल प्रविष्टि',
    typeAddress: 'यहां पता टाइप करें'
  },
  safety: {
    title: 'सुरक्षा केंद्र',
    greeting: 'नमस्ते',
    subtitle: 'सुरक्षा के बारे में आपको क्या जानने की आवश्यकता है',
    tabs: {
      guide: 'मार्गदर्शिका',
      tools: 'उपकरण'
    },
    guide: {
      checkId: {
        title: 'आईडी की जांच करें',
        description: 'अपनी वस्तुओं को देने से पहले ड्रॉपर के आईडी कार्ड या पासपोर्ट की जांच करें, सुनिश्चित करें कि यह प्लेटफॉर्म पर प्रोफ़ाइल से मेल खाता है।'
      },
      careful: {
        title: 'सावधान',
        description: 'यदि संभव हो तो अपने ड्रॉपर के साथ सेल्फी लें। यदि कुछ होता है तो अपने ड्रॉपर की पहचान करना आसान होगा, हालांकि, ड्रॉपर की अनुमति के बिना तस्वीर को पोस्ट न करें या किसी अन्य उद्देश्य के लिए उपयोग न करें। आपकी वस्तुओं के ड्रॉप होने के बाद आप तस्वीर को हटाने के लिए बाध्य हैं, ऐसा करने में विफलता के परिणाम हो सकते हैं।'
      },
      scammers: {
        title: 'स्कैमर्स',
        description: 'स्कैमर्स अपना खेल बढ़ा रहे हैं, हम आपको कभी भी आपके कार्ड पिन, बैंक विवरण, पूरा पासवर्ड, खाता सुरक्षित पहुंच कोड, आपके कार्ड के पीछे का ccv (3 अंक), खाता (Micr) नंबर और व्यक्तिगत जानकारी मांगने के लिए अचानक कॉल नहीं करेंगे। सतर्क रहें!'
      },
      payment: {
        title: 'भुगतान',
        description: 'कभी भी ऑफलाइन भुगतान न करें या दूसरे खाते में पैसा न भेजें। हमारी भुगतान प्रणाली हमारे उपयोगकर्ताओं की सुरक्षा के लिए बनाई गई है।'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'आपातकालीन संपर्क',
        description: 'इन आपातकालीन नंबरों को सहेजें: स्थानीय पुलिस (911), PiqDrop सहायता (1-800-PIQDROP), और आपकी स्थानीय आपातकालीन सेवाएं।'
      },
      locationSharing: {
        title: 'स्थान साझा करना',
        description: 'ड्रॉप के दौरान विश्वसनीय संपर्कों के साथ अपना लाइव स्थान साझा करें। अतिरिक्त सुरक्षा के लिए अपनी डिवाइस सेटिंग्स में स्थान साझा करना सक्षम करें।'
      },
      verificationChecklist: {
        title: 'सत्यापन चेकलिस्ट',
        description: 'प्रत्येक ड्रॉप से पहले हमारी सत्यापन चेकलिस्ट का उपयोग करें: आईडी सत्यापन, प्रोफ़ाइल मिलान, भुगतान पुष्टि, और ड्रॉप स्थान सुरक्षा जांच।'
      },
      reportIssues: {
        title: 'समस्याओं की रिपोर्ट करें',
        description: 'ऐप के माध्यम से तुरंत किसी भी सुरक्षा चिंता या संदिग्ध गतिविधि की रिपोर्ट करें। हमारी सुरक्षा टीम आपकी सहायता के लिए 24/7 उपलब्ध है।'
      }
    }
  },
  report: {
    title: 'रिपोर्ट',
    tabs: {
      guide: 'मार्गदर्शिका',
      tools: 'उपकरण'
    },
    guide: {
      title: 'कैसे रिपोर्ट करें',
      description: 'सभी संदिग्ध और अनुचित व्यवहार की तुरंत रिपोर्ट करें।'
    },
    tools: {
      title: 'रिपोर्टिंग उपकरण',
      description: 'उपयोगकर्ताओं को रिपोर्ट और ब्लॉक करने, कंटेंट को फ्लैग करने, या तत्काल सहायता के लिए सहायता से संपर्क करने के लिए इन उपकरणों का उपयोग करें।',
      blockUser: 'उपयोगकर्ता को ब्लॉक करें: उपयोगकर्ता के प्रोफ़ाइल पर टैप करें और उन्हें आपसे संपर्क करने से रोकने के लिए \'ब्लॉक\' चुनें',
      flagContent: 'कंटेंट को फ्लैग करें: किसी भी अनुचित कंटेंट पर फ्लैग आइकन का उपयोग करें',
      contactSupport: 'तत्काल सहायता के लिए support@piqdrop.com पर ईमेल करें'
    },
    reportButton: 'रिपोर्ट',
    modal: {
      title: 'रिपोर्ट',
      options: {
        unsolicited: 'किसी भी नग्न या यौन छवियों के लिए अनचाहे अनुरोध।',
        underage: '18 वर्ष से कम उम्र के सदस्य।',
        spam: 'स्पैम'
      },
      emailSent: 'support@piqdrop.com पर एक ईमेल भेजा गया है'
    }
  },
  faq: {
    title: 'अक्सर पूछे जाने वाले प्रश्न',
    search: 'खोज',
    noFaqsFound: 'कोई अक्सर पूछे जाने वाले प्रश्न नहीं मिले।',
    getSupport: 'सहायता प्राप्त करें',
    loading: 'लोड हो रहा है...',
    error: 'अक्सर पूछे जाने वाले प्रश्न लोड करने में विफल'
  },
  supportService: {
    title: 'सहायता सेवा',
    placeholder: 'संदेश टाइप करें',
    today: 'आज',
    customerService: {
      greeting: 'नमस्ते, शुभ दिन!',
      intro: 'मैं एक ग्राहक सेवा हूं, क्या कोई समस्या है? ताकि मैं आपकी मदद कर सकूं।'
    }
  },
  notification: {
    title: 'सूचना',
    new: 'नया',
    today: 'आज',
    yesterday: 'कल',
    newFeature: {
      title: 'नई सुविधा उपलब्ध',
      description: 'हमने एक नई सुविधा जोड़ी है जो आपको अपनी प्रोफ़ाइल सेटिंग्स और प्राथमिकताओं को अनुकूलित करने की अनुमति देती है। इसे देखें!'
    },
    maintenance: {
      title: 'रखरखाव अपडेट',
      description: 'निर्धारित रखरखाव पूरा हो गया है। सिस्टम अब बेहतर स्थिरता और प्रदर्शन के साथ चल रहा है।'
    }
  }
}; 