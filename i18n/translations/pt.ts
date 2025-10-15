export default {
  navigation: {
    home: 'Início',
    messages: 'Mensagens',
    manage: 'Gerenciar',
    account: 'Conta'
  },
  common: {
    error: 'Erro',
    ok: 'OK',
    success: 'Sucesso'
  },
  profile: {
    title: 'Perfil',
    sections: {
      fullName: 'Nome Completo',
      email: 'E-mail',
      gender: 'Gênero',
      mobile: 'Celular'
    },
    actions: {
      editInfo: 'Editar Informações'
    }
  },
  account: {
    title: 'Conta',
    sections: {
      general: 'Geral',
      billingAndPlaces: 'Cobrança e Locais',
      legal: 'Legal',
      personal: 'Pessoal',
      social: 'Social'
    },
    profileInfo: {
      personalInfo: 'Informações Pessoais',
      safety: 'Segurança',
      language: 'Idioma'
    },
    billingAndPlaces: {
      payment: 'Pagamento',
      savedPlaces: 'Locais Salvos',
      addPlace: 'Adicionar Local'
    },
    legal: {
      termsOfUse: 'Termos de Uso',
      privacyPolicy: 'Política de Privacidade'
    },
    personal: {
      reportBug: 'Reportar Bug',
      logout: 'Sair'
    },
    social: {
      support: 'Suporte',
      shareApp: 'Compartilhar app'
    },
    deleteAccount: 'Excluir Conta',
    modals: {
      logout: {
        title: 'Sair',
        message: 'Tem certeza que deseja sair?',
        cancel: 'Cancelar',
        confirm: 'Sair'
      },
      deleteAccount: {
        title: 'Excluir Conta',
        message: 'Sentimos muito em vê-lo partir. Por favor, entre em contato com nossa equipe de suporte para ajudá-lo com a exclusão da conta. Eles ajudarão a garantir um processo tranquilo e abordar quaisquer preocupações que você possa ter.',
        cancel: 'Cancelar',
        contactSupport: 'Contatar Suporte'
      },
      savedPlaces: {
        title: 'Locais Salvos',
        pickupLocation: 'Local de Coleta',
        dropoffLocation: 'Local de Entrega',
        notSet: 'Não definido'
      },
      addPlace: {
        editTitle: 'Editar Local {{type}}',
        addTitle: 'Adicionar Local {{type}}',
        address: 'Endereço',
        addressPlaceholder: 'Selecionar local',
        pickFromMap: 'Escolher no Mapa',
        enterManually: 'Inserir Manualmente',
        mapHint: 'Toque no mapa para selecionar o local',
        updateLocation: 'Atualizar Local',
        addLocation: 'Adicionar Local'
      }
    }
  },
  packageForm: {
    title: 'Enviar Pacote',
    pickupDetails: 'Detalhes da Coleta',
    dropoffDetails: 'Detalhes da Entrega',
    sender: 'Remetente',
    receiver: 'Destinatário',
    name: 'Nome',
    number: 'Número',
    weight: 'Peso',
    price: 'Preço',
    location: 'Local',
    pickFromMap: 'Escolher no Mapa',
    enterManually: 'Inserir Manualmente',
    useThisAddress: 'Usar Este Endereço',
    enterPickupAddress: 'Inserir endereço de coleta',
    enterDropoffAddress: 'Inserir endereço de entrega',
    addressNote: 'Por favor, insira o endereço completo incluindo rua, cidade e código postal para resultados precisos.',
    moreDetails: 'Mais detalhes',
    pickupDateAndTime: 'Data e local da coleta',
    timeZoneHint: 'Fuso horário baseado no local de coleta',
    timeZoneInfo: 'Fuso horário baseado no local de coleta',
    done: 'Concluído',
    postJob: 'Publicar Trabalho',
    updateJob: 'Atualizar Trabalho',
    mapHint: 'Toque no mapa para selecionar o local',
    dropoff: 'Entrega',
    validation: {
      pickupNameRequired: 'Nome do remetente é obrigatório',
      pickupPhoneRequired: 'Número de telefone do remetente é obrigatório',
      invalidPickupPhone: 'Número de telefone do remetente inválido',
      pickupLocationRequired: 'Local de coleta é obrigatório',
      weightRequired: 'Peso é obrigatório',
      invalidWeight: 'Valor de peso inválido',
      priceRequired: 'Preço é obrigatório',
      invalidPrice: 'Valor de preço inválido',
      invalidDate: 'Data inválida - deve ser hoje ou no futuro',
      receiverNameRequired: 'Nome do destinatário é obrigatório',
      receiverPhoneRequired: 'Número de telefone do destinatário é obrigatório',
      invalidReceiverPhone: 'Número de telefone do destinatário inválido',
      receiverLocationRequired: 'Local de entrega é obrigatório',
      fixErrors: 'Por favor, corrija os seguintes erros',
      jobPostedSuccess: 'Trabalho publicado com sucesso',
      createPackageError: 'Falha ao criar pacote. Por favor, tente novamente.'
    },
    updateSuccess: 'Pacote atualizado com sucesso',
    createSuccess: 'Pacote criado com sucesso',
    saveFailed: 'Falha ao salvar pacote'
  },
  managePage: {
    title: 'Meus Pedidos',
    tabs: {
      ongoing: 'Em Andamento',
      accepted: 'Aceitos',
      completed: 'Concluídos',
      canceled: 'Cancelados'
    },
    deliveryOverview: 'Visão geral da entrega',
    emptyStates: {
      ongoing: {
        title: 'Você ainda não tem um pedido',
        message: 'Você não tem pedidos em andamento neste momento'
      },
      accepted: {
        title: 'Nenhum pedido aceito',
        message: 'Você não tem pedidos aceitos neste momento'
      },
      completed: {
        title: 'Pedidos concluídos aparecerão aqui',
        message: 'Você não tem pedidos concluídos neste momento'
      },
      canceled: {
        title: 'Lista de pedidos cancelados vazia',
        message: 'Você não tem pedidos cancelados neste momento'
      }
    },
    orderStatus: {
      inProgress: 'Em Andamento',
      accepted: 'Aceito',
      completed: 'Concluído',
      canceled: 'Cancelado'
    },
    actions: {
      acceptDelivery: 'Aceitar Entrega',
      cancelDelivery: 'Cancelar Entrega',
      editDelivery: 'Editar Entrega',
      leaveReview: 'Deixar Avaliação',
      viewReview: 'Ver Avaliação',
      sendMessage: 'Enviar mensagem'
    },
    deliveryCompleted: {
      title: 'Entrega concluída!',
      message: 'Por favor, nos conte sobre sua experiência e o serviço fornecido pelo entregador. Isso nos permitirá melhorar nosso sistema. Obrigado por usar o PiqDrop!',
      leaveReview: 'Deixar Avaliação',
      maybeLater: 'Talvez depois'
    },
    cancelConfirmation: {
      title: 'Confirmar Cancelamento',
      from: 'De:',
      to: 'Para:',
      date: 'Data:',
      back: 'Voltar',
      confirmCancel: 'Sim, Cancelar!'
    }
  },
  orderDetail: {
    title: 'Detalhes do Pedido',
    pickupDetails: {
      title: 'Detalhes da Coleta',
      name: 'Nome:',
      number: 'Número:',
      weight: 'Peso:',
      price: 'Preço:',
      location: 'Local:',
      note: 'Nota'
    },
    dropoffDetails: {
      title: 'Detalhes da Entrega',
      name: 'Nome:',
      number: 'Número:',
      location: 'Local:',
      note: 'Nota'
    },
    orderConfirmation: {
      title: 'Confirmação do Pedido',
      from: 'De:',
      to: 'Para:',
      date: 'Data:',
      back: 'Voltar',
      confirm: 'Sim, Confirmar!'
    },
    takeOrder: 'Aceitar pedido!'
  },
  review: {
    title: 'Deixar Avaliação',
    viewTitle: 'Sua Avaliação',
    rider: 'Motociclista',
    experienceQuestion: 'Como foi sua experiência com o motociclista?',
    writeReview: 'Escreva sua Avaliação',
    enterReview: 'Inserir Avaliação',
    maybeLater: 'Talvez depois',
    submitReview: 'Enviar avaliação',
    submitting: 'Enviando...',
    yourRating: 'Sua Avaliação',
    yourReview: 'Sua Avaliação',
    close: 'Fechar',
    validation: {
      selectRating: 'Por favor, selecione uma avaliação',
      writeReview: 'Por favor, escreva uma avaliação'
    },
    success: {
      title: 'Sucesso',
      message: 'Avaliação enviada com sucesso'
    },
    error: {
      fetchFailed: 'Falha ao carregar avaliação'
    }
  },
  updateProfile: {
    title: 'Atualizar Informações',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    mobile: 'Número de Celular',
    address: 'Endereço',
    dateOfBirth: 'Data de Nascimento',
    nationality: 'Nacionalidade',
    gender: 'Gênero',
    update: 'Atualizar',
    updating: 'Atualizando...',
    success: 'Perfil atualizado com sucesso',
    error: 'Falha ao atualizar perfil. Por favor, tente novamente.',
    validationError: 'Erro de Validação',
    invalidPhone: 'Formato de número de telefone inválido',
    mapHint: 'Toque no mapa para selecionar o local',
    close: 'Fechar',
    done: 'Concluído',
    cancel: 'Cancelar',
    selectLocation: 'Selecionar Local',
    manualEntry: 'Entrada Manual',
    typeAddress: 'Digite o endereço aqui'
  },
  safety: {
    title: 'Centro de Segurança',
    greeting: 'Olá',
    subtitle: 'Aqui está o que você precisa saber sobre segurança',
    tabs: {
      guide: 'Guia',
      tools: 'Ferramentas'
    },
    guide: {
      checkId: {
        title: 'Verificar ID',
        description: 'Verifique o cartão de identidade ou passaporte do entregador antes de entregar seus itens, certifique-se de que corresponde ao perfil na plataforma.'
      },
      careful: {
        title: 'Cuidado',
        description: 'Tire uma selfie com seu entregador se possível. Será mais fácil identificar seu entregador se algo acontecer, no entanto, não poste a foto ou use-a para qualquer outro propósito sem a permissão do entregador. Após a entrega dos seus itens, você é obrigado a excluir a foto, a falha em fazê-lo pode ter consequências.'
      },
      scammers: {
        title: 'Golpistas',
        description: 'Os golpistas estão melhorando suas táticas, nunca ligaremos para você do nada para pedir seu PIN do cartão, detalhes bancários, senha completa, código de acesso seguro da conta, o ccv (3 dígitos) na parte de trás do seu cartão, número da conta (Micr) e informações pessoais. Esteja vigilante!'
      },
      payment: {
        title: 'Pagamento',
        description: 'Nunca pague offline ou transfira dinheiro para outra conta. Nosso sistema de pagamento foi construído para proteger nossos usuários.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Contatos de Emergência',
        description: 'Salve estes números de emergência: Polícia Local (911), Suporte PiqDrop (1-800-PIQDROP) e seus serviços de emergência locais.'
      },
      locationSharing: {
        title: 'Compartilhamento de Localização',
        description: 'Compartilhe sua localização em tempo real com contatos confiáveis durante as entregas. Ative o compartilhamento de localização nas configurações do seu dispositivo para maior segurança.'
      },
      verificationChecklist: {
        title: 'Lista de Verificação',
        description: 'Use nossa lista de verificação antes de cada entrega: verificação de ID, correspondência de perfil, confirmação de pagamento e verificação de segurança do local de entrega.'
      },
      reportIssues: {
        title: 'Reportar Problemas',
        description: 'Reporte imediatamente quaisquer preocupações de segurança ou atividades suspeitas através do aplicativo. Nossa equipe de segurança está disponível 24/7 para ajudá-lo.'
      }
    }
  },
  report: {
    title: 'Reportar',
    tabs: {
      guide: 'Guia',
      tools: 'Ferramentas'
    },
    guide: {
      title: 'Como reportar',
      description: 'Reporte imediatamente todos os comportamentos suspeitos e inadequados.'
    },
    tools: {
      title: 'Ferramentas de Denúncia',
      description: 'Use estas ferramentas para reportar e bloquear usuários, sinalizar conteúdo ou contatar o suporte para assistência imediata.',
      blockUser: 'Bloquear Usuário: Toque no perfil do usuário e selecione \'Bloquear\' para impedir que ele entre em contato com você',
      flagContent: 'Sinalizar Conteúdo: Use o ícone de sinalização em qualquer conteúdo inadequado para reportá-lo',
      contactSupport: 'Contatar Suporte: Envie um e-mail para support@piqdrop.com para assistência imediata'
    },
    reportButton: 'Reportar',
    modal: {
      title: 'Reportar',
      options: {
        unsolicited: 'Solicitações não solicitadas de imagens nuas ou sexuais.',
        underage: 'Membro menor de 18 anos.',
        spam: 'Spam'
      },
      emailSent: 'Um e-mail foi enviado para support@piqdrop.com'
    }
  },
  faq: {
    title: 'FAQ',
    search: 'Pesquisar',
    noFaqsFound: 'Nenhuma FAQ encontrada.',
    getSupport: 'Obter Suporte',
    loading: 'Carregando...',
    error: 'Falha ao carregar FAQs'
  },
  supportService: {
    title: 'Serviço de Suporte',
    placeholder: 'Digite uma mensagem',
    today: 'Hoje',
    customerService: {
      greeting: 'Olá, Bom dia!',
      intro: 'Sou um atendente ao cliente, há algum problema? Para que eu possa ajudá-lo a resolvê-lo.'
    }
  },
  notification: {
    title: 'Notificação',
    new: 'Novo',
    today: 'Hoje',
    yesterday: 'Ontem',
    newFeature: {
      title: 'Nova Funcionalidade Disponível',
      description: 'Adicionamos uma nova funcionalidade que permite personalizar suas configurações e preferências de perfil. Confira!'
    },
    maintenance: {
      title: 'Atualização de Manutenção',
      description: 'A manutenção programada foi concluída. O sistema agora está rodando com estabilidade e desempenho melhorados.'
    }
  }
}; 