export default {
  navigation: {
    home: 'Inicio',
    messages: 'Mensajes',
    manage: 'Gestionar',
    account: 'Cuenta'
  },
  common: {
    error: 'Error',
    ok: 'Aceptar',
    success: 'Éxito'
  },
  profile: {
    title: 'Perfil',
    sections: {
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      gender: 'Género',
      mobile: 'Móvil'
    },
    actions: {
      editInfo: 'Editar Información'
    }
  },
  account: {
    title: 'Cuenta',
    sections: {
      general: 'General',
      billingAndPlaces: 'Facturación y Lugares',
      legal: 'Legal',
      personal: 'Personal',
      social: 'Social'
    },
    profileInfo: {
      personalInfo: 'Información Personal',
      safety: 'Seguridad',
      language: 'Idioma'
    },
    billingAndPlaces: {
      payment: 'Pago',
      savedPlaces: 'Lugares Guardados',
      addPlace: 'Agregar un Lugar'
    },
    legal: {
      termsOfUse: 'Términos de Uso',
      privacyPolicy: 'Política de Privacidad'
    },
    personal: {
      reportBug: 'Reportar un Error',
      logout: 'Cerrar Sesión'
    },
    social: {
      support: 'Soporte',
      shareApp: 'Compartir App'
    },
    deleteAccount: 'Eliminar Cuenta',
    modals: {
      logout: {
        title: 'Cerrar Sesión',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        cancel: 'Cancelar',
        confirm: 'Cerrar Sesión'
      },
      deleteAccount: {
        title: 'Eliminar Cuenta',
        message: 'Lamentamos verte partir. Por favor, contacta a nuestro equipo de soporte para ayudarte con la eliminación de la cuenta. Te ayudarán a asegurar un proceso sin problemas y abordarán cualquier inquietud que puedas tener.',
        cancel: 'Cancelar',
        contactSupport: 'Contactar Soporte'
      },
      savedPlaces: {
        title: 'Lugares Guardados',
        pickupLocation: 'Ubicación de Recogida',
        dropoffLocation: 'Ubicación de Entrega',
        notSet: 'No establecido'
      },
      addPlace: {
        editTitle: 'Editar Ubicación de {{type}}',
        addTitle: 'Agregar Ubicación de {{type}}',
        address: 'Dirección',
        addressPlaceholder: 'Seleccionar ubicación',
        pickFromMap: 'Elegir del Mapa',
        enterManually: 'Ingresar Manualmente',
        mapHint: 'Toca el mapa para seleccionar la ubicación',
        updateLocation: 'Actualizar Ubicación',
        addLocation: 'Agregar Ubicación'
      }
    }
  },
  packageForm: {
    title: 'Enviar Paquete',
    pickupDetails: 'Detalles de recogida',
    dropoffDetails: 'Detalles de entrega',
    sender: 'Remitente',
    receiver: 'Destinatario',
    name: 'Nombre',
    number: 'Número',
    weight: 'Peso',
    price: 'Precio',
    location: 'Ubicación',
    pickFromMap: 'Elegir del Mapa',
    enterManually: 'Ingresar Manualmente',
    useThisAddress: 'Usar Esta Dirección',
    enterPickupAddress: 'Ingresar dirección de recogida',
    enterDropoffAddress: 'Ingresar dirección de entrega',
    addressNote: 'Por favor ingresa la dirección completa incluyendo calle, ciudad y código postal para resultados precisos.',
    moreDetails: 'Más detalles',
    pickupDateAndTime: 'Fecha y ubicación de recogida',
    timeZoneHint: 'La zona horaria se basa en la ubicación de recogida',
    timeZoneInfo: 'La zona horaria se basa en la ubicación de recogida',
    done: 'Listo',
    postJob: 'Publicar Trabajo',
    updateJob: 'Actualizar Trabajo',
    mapHint: 'Toca el mapa para seleccionar la ubicación',
    dropoff: 'Entrega',
    validation: {
      pickupNameRequired: 'El nombre del remitente es obligatorio',
      pickupPhoneRequired: 'El número de teléfono del remitente es obligatorio',
      invalidPickupPhone: 'Número de teléfono del remitente inválido',
      pickupLocationRequired: 'La ubicación de recogida es obligatoria',
      weightRequired: 'El peso es obligatorio',
      invalidWeight: 'Valor de peso inválido',
      priceRequired: 'El precio es obligatorio',
      invalidPrice: 'Valor de precio inválido',
      invalidDate: 'Fecha inválida - debe ser hoy o en el futuro',
      receiverNameRequired: 'El nombre del destinatario es obligatorio',
      receiverPhoneRequired: 'El número de teléfono del destinatario es obligatorio',
      invalidReceiverPhone: 'Número de teléfono del destinatario inválido',
      receiverLocationRequired: 'La ubicación de entrega es obligatoria',
      fixErrors: 'Por favor corrija los siguientes errores',
      jobPostedSuccess: 'Trabajo publicado con éxito',
      createPackageError: 'Error al crear el paquete. Por favor, inténtelo de nuevo.'
    },
    updateSuccess: 'Paquete actualizado exitosamente',
    createSuccess: 'Paquete creado exitosamente',
    saveFailed: 'Error al guardar el paquete'
  },
  managePage: {
    title: 'Mis Pedidos',
    tabs: {
      ongoing: 'En curso',
      accepted: 'Aceptados',
      completed: 'Completados',
      canceled: 'Cancelados'
    },
    deliveryOverview: 'Resumen de entrega',
    emptyStates: {
      ongoing: {
        title: "No tienes ningún pedido aún",
        message: "No tienes pedidos en curso en este momento"
      },
      accepted: {
        title: "Sin pedidos aceptados",
        message: "No tienes pedidos aceptados en este momento"
      },
      completed: {
        title: "Los pedidos completados aparecerán aquí",
        message: "No tienes pedidos completados en este momento"
      },
      canceled: {
        title: "Lista de pedidos cancelados vacía",
        message: "No tienes pedidos cancelados en este momento"
      }
    },
    orderStatus: {
      inProgress: 'En Progreso',
      accepted: 'Aceptado',
      completed: 'Completado',
      canceled: 'Cancelado'
    },
    actions: {
      completeDelivery: 'Completar Entrega',
      cancelDelivery: 'Cancelar Entrega',
      editDelivery: 'Editar Entrega',
      leaveReview: 'Dejar una reseña',
      sendMessage: 'Enviar mensaje'
    },
    deliveryCompleted: {
      title: '¡Entrega completada!',
      message: "Por favor, cuéntanos sobre tu experiencia y el servicio proporcionado por el repartidor. Esto nos ayudará a mejorar nuestro sistema. ¡Gracias por usar PiqDrop!",
      leaveReview: 'Dejar una reseña',
      maybeLater: 'Quizás después'
    },
    cancelConfirmation: {
      title: 'Confirmar Cancelación',
      from: 'Desde:',
      to: 'Hasta:',
      date: 'Fecha:',
      back: 'Volver',
      confirmCancel: '¡Sí, Cancelar!'
    }
  },
  orderDetail: {
    title: 'Detalle del Pedido',
    pickupDetails: {
      title: 'Detalles de recogida',
      name: 'Nombre:',
      number: 'Número:',
      weight: 'Peso:',
      price: 'Precio:',
      location: 'Ubicación:',
      note: 'Nota'
    },
    dropoffDetails: {
      title: 'Detalles de entrega',
      name: 'Nombre:',
      number: 'Número:',
      location: 'Ubicación:',
      note: 'Nota'
    },
    orderConfirmation: {
      title: 'Confirmación del Pedido',
      from: 'Desde:',
      to: 'Hasta:',
      date: 'Fecha:',
      back: 'Volver',
      confirm: '¡Sí, Confirmar!'
    },
    takeOrder: '¡Tomar pedido!'
  },
  review: {
    title: 'Dejar una reseña',
    dropper: 'Repartidor',
    experienceQuestion: '¿Cómo fue tu experiencia con el repartidor?',
    writeReview: 'Escribe tu reseña',
    enterReview: 'Ingresa tu reseña',
    maybeLater: 'Quizás después',
    submitReview: 'Enviar reseña',
    submitting: 'Enviando...',
    validation: {
      selectRating: 'Por favor selecciona una calificación',
      writeReview: 'Por favor escribe una reseña'
    },
    success: {
      title: 'Éxito',
      message: 'Reseña enviada exitosamente'
    }
  },
  updateProfile: {
    title: 'Actualizar Información',
    firstName: 'Nombre',
    lastName: 'Apellido',
    mobile: 'Número de Móvil',
    address: 'Dirección',
    dateOfBirth: 'Fecha de nacimiento',
    nationality: 'Nacionalidad',
    gender: 'Género',
    update: 'Actualizar',
    updating: 'Actualizando...',
    success: 'Perfil actualizado exitosamente',
    error: 'Error al actualizar el perfil. Por favor, inténtelo de nuevo.',
    validationError: 'Error de Validación',
    invalidPhone: 'Formato de número de teléfono inválido',
    mapHint: 'Toque en el mapa para seleccionar la ubicación',
    close: 'Cerrar',
    done: 'Listo',
    cancel: 'Cancelar',
    selectLocation: 'Seleccionar Ubicación',
    manualEntry: 'Entrada Manual',
    typeAddress: 'Escriba la dirección aquí'
  },
  safety: {
    title: 'Centro de Seguridad',
    greeting: 'Hola',
    subtitle: 'Esto es lo que necesitas saber sobre seguridad',
    tabs: {
      guide: 'Guía',
      tools: 'Herramientas'
    },
    guide: {
      checkId: {
        title: 'Verificar ID',
        description: 'Verifica el documento de identidad o pasaporte del dropper antes de entregarle tus artículos, asegúrate de que coincida con el perfil en la plataforma.'
      },
      careful: {
        title: 'Cuidado',
        description: 'Toma una selfie con tu dropper si es posible. Es más fácil identificar a tu dropper si algo sucede, sin embargo, no publiques la foto ni la uses para ningún otro propósito sin el permiso del dropper. Después de que tus artículos hayan sido entregados, estás obligado a eliminar la foto, no hacerlo podría tener consecuencias.'
      },
      scammers: {
        title: 'Estafadores',
        description: 'Los estafadores están mejorando sus técnicas, nunca te llamaremos de la nada para pedirte tu PIN de tarjeta, detalles bancarios, contraseña completa, código de acceso seguro de la cuenta, el CVV (3 dígitos) en la parte posterior de tu tarjeta, número de cuenta (Micr) e información personal. ¡Mantente alerta!'
      },
      payment: {
        title: 'Pago',
        description: 'Nunca pagues fuera de línea ni transfieras dinero a otra cuenta. Nuestro sistema de pago está diseñado para proteger a nuestros usuarios.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Contactos de Emergencia',
        description: 'Guarda estos números de emergencia: Policía Local (911), Soporte PiqDrop (1-800-PIQDROP) y tus servicios de emergencia locales.'
      },
      locationSharing: {
        title: 'Compartir Ubicación',
        description: 'Comparte tu ubicación en vivo con contactos de confianza durante las entregas. Habilita el uso compartido de ubicación en la configuración de tu dispositivo para mayor seguridad.'
      },
      verificationChecklist: {
        title: 'Lista de Verificación',
        description: 'Usa nuestra lista de verificación antes de cada entrega: verificación de ID, coincidencia de perfil, confirmación de pago y verificación de seguridad de la ubicación de entrega.'
      },
      reportIssues: {
        title: 'Reportar Problemas',
        description: 'Reporta cualquier preocupación de seguridad o actividad sospechosa inmediatamente a través de la aplicación. Nuestro equipo de seguridad está disponible las 24 horas para ayudarte.'
      }
    }
  },
  report: {
    title: 'Reportar',
    tabs: {
      guide: 'Guía',
      tools: 'Herramientas'
    },
    guide: {
      title: 'Cómo reportar',
      description: 'Reporta inmediatamente cualquier comportamiento sospechoso o inapropiado.'
    },
    tools: {
      title: 'Herramientas de Reporte',
      description: 'Utiliza estas herramientas para reportar y bloquear usuarios, marcar contenido o contactar al soporte para asistencia inmediata.',
      blockUser: 'Bloquear Usuario: Toca el perfil de un usuario y selecciona \'Bloquear\' para evitar que te contacte',
      flagContent: 'Marcar Contenido: Usa el ícono de bandera en cualquier contenido inapropiado para reportarlo',
      contactSupport: 'Contactar Soporte: Envía un correo a support@piqdrop.com para asistencia inmediata'
    },
    reportButton: 'Reportar',
    modal: {
      title: 'Reportar',
      options: {
        unsolicited: 'Solicitudes no solicitadas de imágenes desnudas o sexuales.',
        underage: 'Miembro menor de 18 años.',
        spam: 'Spam'
      },
      emailSent: 'Se ha enviado un correo a support@piqdrop.com'
    }
  },
  faq: {
    title: 'Preguntas Frecuentes',
    search: 'Buscar',
    noFaqsFound: 'No se encontraron preguntas frecuentes.',
    getSupport: 'Obtener Soporte',
    loading: 'Cargando...',
    error: 'Error al cargar las preguntas frecuentes'
  },
  supportService: {
    title: 'Servicio de Soporte',
    placeholder: 'Escribe un mensaje',
    today: 'Hoy',
    customerService: {
      greeting: '¡Hola, buen día!',
      intro: 'Soy un servicio al cliente, ¿hay algún problema? para poder ayudarte a resolverlo.'
    }
  },
  notification: {
    title: 'Notificación',
    new: 'Nuevo',
    today: 'Hoy',
    yesterday: 'Ayer',
    newFeature: {
      title: 'Nueva Función Disponible',
      description: 'Hemos agregado una nueva función que te permite personalizar la configuración y preferencias de tu perfil. ¡Échale un vistazo!'
    },
    maintenance: {
      title: 'Actualización de Mantenimiento',
      description: 'El mantenimiento programado ha sido completado. El sistema ahora está funcionando con estabilidad y rendimiento mejorados.'
    }
  }
}; 