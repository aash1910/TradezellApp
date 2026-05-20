export default {
  navigation: {
    home: 'الرئيسية',
    messages: 'الرسائل',
    manage: 'إدارة',
    account: 'الحساب'
  },
  common: {
    error: 'خطأ',
    ok: 'موافق',
    success: 'نجاح'
  },
  profile: {
    title: 'الملف الشخصي',
    sections: {
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      gender: 'الجنس',
      mobile: 'الجوال'
    },
    actions: {
      editInfo: 'تعديل المعلومات'
    }
  },
  account: {
    title: 'الحساب',
    sections: {
      general: 'عام',
      billingAndPlaces: 'الفوترة والأماكن',
      legal: 'قانوني',
      personal: 'شخصي',
      social: 'اجتماعي'
    },
    profileInfo: {
      personalInfo: 'المعلومات الشخصية',
      safety: 'السلامة',
      language: 'اللغة'
    },
    billingAndPlaces: {
      payment: 'الدفع',
      savedPlaces: 'الأماكن المحفوظة',
      addPlace: 'إضافة مكان'
    },
    legal: {
      termsOfUse: 'شروط الاستخدام',
      privacyPolicy: 'سياسة الخصوصية'
    },
    personal: {
      reportBug: 'الإبلاغ عن خطأ',
      logout: 'تسجيل الخروج'
    },
    social: {
      support: 'الدعم',
      shareApp: 'مشاركة التطبيق'
    },
    deleteAccount: 'حذف الحساب',
    modals: {
      logout: {
        title: 'تسجيل الخروج',
        message: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
        cancel: 'إلغاء',
        confirm: 'تسجيل الخروج'
      },
      deleteAccount: {
        title: 'حذف الحساب',
        message: 'نأسف لرؤيتك تغادر. يرجى الاتصال بفريق الدعم لدينا للمساعدة في حذف حسابك. سيساعدونك في ضمان عملية سلسة ومعالجة أي مخاوف قد تكون لديك.',
        cancel: 'إلغاء',
        contactSupport: 'اتصل بالدعم'
      },
      savedPlaces: {
        title: 'الأماكن المحفوظة',
        pickupLocation: 'موقع الاستلام',
        dropoffLocation: 'موقع التسليم',
        notSet: 'غير محدد'
      },
      addPlace: {
        editTitle: 'تعديل موقع {{type}}',
        addTitle: 'إضافة موقع {{type}}',
        address: 'العنوان',
        addressPlaceholder: 'اختر الموقع',
        pickFromMap: 'اختر من الخريطة',
        enterManually: 'أدخل يدويًا',
        mapHint: 'انقر على الخريطة لاختيار الموقع',
        updateLocation: 'تحديث الموقع',
        addLocation: 'إضافة موقع'
      }
    }
  },
  packageForm: {
    title: 'إرسال طرد',
    pickupDetails: 'تفاصيل الاستلام',
    dropoffDetails: 'تفاصيل التسليم',
    sender: 'المرسل',
    receiver: 'المستلم',
    name: 'الاسم',
    number: 'الرقم',
    weight: 'الوزن',
    price: 'السعر',
    location: 'الموقع',
    pickFromMap: 'اختر من الخريطة',
    enterManually: 'أدخل يدويًا',
    useThisAddress: 'استخدم هذا العنوان',
    enterPickupAddress: 'أدخل عنوان الاستلام',
    enterDropoffAddress: 'أدخل عنوان التسليم',
    addressNote: 'يرجى إدخال العنوان الكامل بما في ذلك الشارع والمدينة والرمز البريدي للحصول على نتائج دقيقة.',
    moreDetails: 'المزيد من التفاصيل',
    pickupDateAndTime: 'تاريخ وموقع الاستلام',
    timeZoneHint: 'المنطقة الزمنية تعتمد على موقع الاستلام',
    timeZoneInfo: 'المنطقة الزمنية تعتمد على موقع الاستلام',
    done: 'تم',
    postJob: 'نشر وظيفة',
    updateJob: 'تحديث الوظيفة',
    mapHint: 'انقر على الخريطة لاختيار الموقع',
    dropoff: 'التسليم',
    validation: {
      pickupNameRequired: 'اسم المرسل مطلوب',
      pickupPhoneRequired: 'رقم هاتف المرسل مطلوب',
      invalidPickupPhone: 'رقم هاتف المرسل غير صالح',
      pickupLocationRequired: 'موقع الاستلام مطلوب',
      weightRequired: 'الوزن مطلوب',
      invalidWeight: 'قيمة الوزن غير صالحة',
      priceRequired: 'السعر مطلوب',
      invalidPrice: 'قيمة السعر غير صالحة',
      invalidDate: 'تاريخ غير صالح - يجب أن يكون اليوم أو في المستقبل',
      receiverNameRequired: 'اسم المستلم مطلوب',
      receiverPhoneRequired: 'رقم هاتف المستلم مطلوب',
      invalidReceiverPhone: 'رقم هاتف المستلم غير صالح',
      receiverLocationRequired: 'موقع التسليم مطلوب',
      fixErrors: 'يرجى إصلاح الأخطاء التالية',
      jobPostedSuccess: 'تم نشر الوظيفة بنجاح',
      createPackageError: 'فشل في إنشاء الطرد. يرجى المحاولة مرة أخرى.'
    },
    updateSuccess: 'تم تحديث الطرد بنجاح',
    createSuccess: 'تم إنشاء الطرد بنجاح',
    saveFailed: 'فشل في حفظ الطرد'
  },
  managePage: {
    title: 'طلباتي',
    tabs: {
      ongoing: 'قيد التنفيذ',
      accepted: 'مقبول',
      completed: 'مكتمل',
      canceled: 'ملغي'
    },
    deliveryOverview: 'نظرة عامة على التسليم',
    emptyStates: {
      ongoing: {
        title: 'ليس لديك طلب حتى الآن',
        message: 'ليس لديك طلبات قيد التنفيذ في هذا الوقت'
      },
      accepted: {
        title: 'لا توجد طلبات مقبولة',
        message: 'ليس لديك طلبات مقبولة في هذا الوقت'
      },
      completed: {
        title: 'ستظهر الطلبات المكتملة هنا',
        message: 'ليس لديك طلبات مكتملة في هذا الوقت'
      },
      canceled: {
        title: 'قائمة الطلبات الملغاة فارغة',
        message: 'ليس لديك طلبات ملغاة في هذا الوقت'
      }
    },
    orderStatus: {
      inProgress: 'قيد التنفيذ',
      accepted: 'مقبول',
      completed: 'مكتمل',
      canceled: 'ملغي'
    },
    actions: {
      acceptDelivery: 'قبول التسليم',
      cancelDelivery: 'إلغاء التسليم',
      editDelivery: 'تعديل التسليم',
      leaveReview: 'ترك تقييم',
      viewReview: 'عرض التقييم',
      sendMessage: 'إرسال رسالة'
    },
    deliveryCompleted: {
      title: 'اكتمل التسليم!',
      message: 'يرجى إخبارنا عن تجربتك والخدمة التي قدمها لك المسلم. هذا سيمكننا من تحسين نظامنا. شكرًا لاستخدام PiqDrop!',
      leaveReview: 'ترك تقييم',
      maybeLater: 'ربما لاحقًا'
    },
    cancelConfirmation: {
      title: 'تأكيد الإلغاء',
      from: 'من:',
      to: 'إلى:',
      date: 'التاريخ:',
      back: 'رجوع',
      confirmCancel: 'نعم، إلغاء!'
    }
  },
  orderDetail: {
    title: 'تفاصيل الطلب',
    pickupDetails: {
      title: 'تفاصيل الاستلام',
      name: 'الاسم:',
      number: 'الرقم:',
      weight: 'الوزن:',
      price: 'السعر:',
      location: 'الموقع:',
      note: 'ملاحظة'
    },
    dropoffDetails: {
      title: 'تفاصيل التسليم',
      name: 'الاسم:',
      number: 'الرقم:',
      location: 'الموقع:',
      note: 'ملاحظة'
    },
    orderConfirmation: {
      title: 'تأكيد الطلب',
      from: 'من:',
      to: 'إلى:',
      date: 'التاريخ:',
      back: 'رجوع',
      confirm: 'نعم، تأكيد!'
    },
    takeOrder: 'استلام الطلب!'
  },
  review: {
    title: 'ترك تقييم',
    viewTitle: 'تقييمك',
    rider: 'السائق',
    experienceQuestion: 'كيف كانت تجربتك مع السائق؟',
    writeReview: 'اكتب تقييمك',
    enterReview: 'أدخل التقييم',
    maybeLater: 'ربما لاحقًا',
    submitReview: 'إرسال التقييم',
    submitting: 'جاري الإرسال...',
    yourRating: 'تقييمك',
    yourReview: 'مراجعتك',
    close: 'إغلاق',
    validation: {
      selectRating: 'يرجى اختيار تقييم',
      writeReview: 'يرجى كتابة تقييم'
    },
    success: {
      title: 'نجاح',
      message: 'تم إرسال التقييم بنجاح'
    },
    error: {
      fetchFailed: 'فشل تحميل التقييم'
    }
  },
  updateProfile: {
    title: 'تحديث المعلومات',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    mobile: 'رقم الجوال',
    address: 'العنوان',
    dateOfBirth: 'تاريخ الميلاد',
    nationality: 'الجنسية',
    gender: 'الجنس',
    update: 'تحديث',
    updating: 'جاري التحديث...',
    success: 'تم تحديث الملف الشخصي بنجاح',
    error: 'فشل في تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.',
    validationError: 'خطأ في التحقق',
    invalidPhone: 'تنسيق رقم هاتف غير صالح',
    mapHint: 'انقر على الخريطة لاختيار الموقع',
    close: 'إغلاق',
    done: 'تم',
    cancel: 'إلغاء',
    selectLocation: 'اختر الموقع',
    manualEntry: 'إدخال يدوي',
    typeAddress: 'اكتب العنوان هنا'
  },
  safety: {
    title: 'مركز السلامة',
    greeting: 'مرحبًا',
    subtitle: 'ابقَ آمناً أثناء التداول والبيع والشراء على Tradezell',
    tabs: {
      guide: 'الدليل',
      tools: 'الأدوات'
    },
    guide: {
      checkId: {
        title: 'التحقق من الهوية',
        description: 'قبل الاجتماع للتبادل أو البيع، تحقق من جواز السفر أو الهوية الدولية للشخص الآخر وتأكد من تطابقها مع ملفه على Tradezell. أكمل التبادلات الشخصية فقط مع مستخدمين موثقين.'
      },
      careful: {
        title: 'التقِ في مكان عام',
        description: 'أكمل التبادلات دائماً في مكان عام مزدحم ومضاء جيداً، مثل مقهى أو مركز تسوق أو نقطة تبادل آمنة. لا تلتقِ بمفردك في منزل خاص.'
      },
      scammers: {
        title: 'احذر المحتالين',
        description: 'لن يطلب Tradezell أبداً رقم PIN لبطاقتك أو تفاصيل البنك أو كلمة المرور الكاملة أو رموز الأمان أو المعلومات الشخصية. احذر من من يطلب الدفع خارج التطبيق أو تحويل الأموال لحساب آخر.'
      },
      payment: {
        title: 'المدفوعات داخل التطبيق',
        description: 'تُفرض رسوم 2.98 دولار لكل صورة إعلان عبر نظام الدفع الآمن. احتفظ بالمدفوعات داخل Tradezell لحمايتك. تُطبق الرسوم وفق سياستنا عندما ينتقل المشترون إلى البيع أو التداول.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'شارك التطبيق',
        description: 'أخبر الأصدقاء أو العائلة أنك تستخدم Tradezell. شارك خطط لقائك مع شخص تثق به قبل التبادل أو البيع شخصياً.'
      },
      locationSharing: {
        title: 'شارك موقعك',
        description: 'شارك موقعك المباشر مع جهة اتصال موثوقة عند التوجه لاجتماع تبادل أو بيع. فعّل مشاركة الموقع في إعدادات جهازك.'
      },
      verificationChecklist: {
        title: 'قائمة ما قبل التبادل',
        description: 'قبل الاجتماع: أكد التحقق من الهوية في الملف، راجع صور الإعلان، اتفق على العناصر في الدردشة، واختر مكاناً عاماً آمناً.'
      },
      reportIssues: {
        title: 'الإبلاغ عن مشكلة',
        description: 'أبلغ عن إعلانات مشبوهة أو ملفات مزيفة أو سلوك غير آمن عبر التطبيق. يمكنك إلغاء المطابقة في أي وقت إذا غيّرت رأيك.'
      }
    }
  },
  report: {
    title: 'تقرير',
    tabs: {
      guide: 'الدليل',
      tools: 'الأدوات'
    },
    guide: {
      title: 'كيفية الإبلاغ',
      description: 'أبلغ عن جميع السلوكيات المشبوهة وغير المناسبة على الفور.'
    },
    tools: {
      title: 'أدوات الإبلاغ',
      description: 'استخدم هذه الأدوات للإبلاغ عن المستخدمين وحظرهم، أو الإبلاغ عن المحتوى، أو الاتصال بالدعم للحصول على مساعدة فورية.',
      blockUser: 'حظر المستخدم: انقر على ملف المستخدم واختر \'حظر\' لمنعه من الاتصال بك',
      flagContent: 'الإبلاغ عن المحتوى: استخدم أيقونة الإبلاغ على أي محتوى غير مناسب',
      contactSupport: 'اتصل بالدعم: راسل support@piqdrop.com للحصول على مساعدة فورية'
    },
    reportButton: 'تقرير',
    modal: {
      title: 'تقرير',
      options: {
        unsolicited: 'طلبات غير مرغوب فيها لأي صور عارية أو جنسية.',
        underage: 'عضو أقل من 18 عامًا.',
        spam: 'بريد مزعج'
      },
      emailSent: 'تم إرسال بريد إلكتروني إلى support@piqdrop.com'
    }
  },
  faq: {
    title: 'الأسئلة الشائعة',
    search: 'بحث',
    noFaqsFound: 'لم يتم العثور على أسئلة شائعة.',
    getSupport: 'الحصول على الدعم',
    loading: 'جاري التحميل...',
    error: 'فشل في تحميل الأسئلة الشائعة'
  },
  supportService: {
    title: 'خدمة الدعم',
    placeholder: 'اكتب رسالة',
    today: 'اليوم',
    customerService: {
      greeting: 'مرحبًا، يوم سعيد!',
      intro: 'أنا خدمة العملاء، هل هناك مشكلة؟ حتى أتمكن من مساعدتك في حلها.'
    }
  },
  notification: {
    title: 'إشعار',
    new: 'جديد',
    today: 'اليوم',
    yesterday: 'الأمس',
    newFeature: {
      title: 'ميزة جديدة متاحة',
      description: 'لقد أضفنا ميزة جديدة تتيح لك تخصيص إعدادات ملفك الشخصي وتفضيلاتك. تحقق منها!'
    },
    maintenance: {
      title: 'تحديث الصيانة',
      description: 'اكتملت الصيانة المجدولة. النظام يعمل الآن مع تحسين الاستقرار والأداء.'
    }
  }
}; 