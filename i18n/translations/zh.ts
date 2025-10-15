export default {
  navigation: {
    home: '首页',
    messages: '消息',
    manage: '管理',
    account: '账户'
  },
  common: {
    error: '错误',
    ok: '确定',
    success: '成功'
  },
  profile: {
    title: '个人资料',
    sections: {
      fullName: '全名',
      email: '电子邮件',
      gender: '性别',
      mobile: '手机'
    },
    actions: {
      editInfo: '编辑信息'
    }
  },
  account: {
    title: '账户',
    sections: {
      general: '通用',
      billingAndPlaces: '账单和地点',
      legal: '法律',
      personal: '个人',
      social: '社交'
    },
    profileInfo: {
      personalInfo: '个人信息',
      safety: '安全',
      language: '语言'
    },
    billingAndPlaces: {
      payment: '支付',
      savedPlaces: '保存的地点',
      addPlace: '添加地点'
    },
    legal: {
      termsOfUse: '使用条款',
      privacyPolicy: '隐私政策'
    },
    personal: {
      reportBug: '报告错误',
      logout: '退出登录'
    },
    social: {
      support: '支持',
      shareApp: '分享应用'
    },
    deleteAccount: '删除账户',
    modals: {
      logout: {
        title: '退出登录',
        message: '您确定要退出登录吗？',
        cancel: '取消',
        confirm: '退出登录'
      },
      deleteAccount: {
        title: '删除账户',
        message: '很遗憾看到您离开。请联系我们的支持团队以协助您删除账户。他们将帮助确保流程顺利并解决您可能遇到的任何问题。',
        cancel: '取消',
        contactSupport: '联系支持'
      },
      savedPlaces: {
        title: '保存的地点',
        pickupLocation: '取件地点',
        dropoffLocation: '送件地点',
        notSet: '未设置'
      },
      addPlace: {
        editTitle: '编辑{{type}}地点',
        addTitle: '添加{{type}}地点',
        address: '地址',
        addressPlaceholder: '选择地点',
        pickFromMap: '从地图选择',
        enterManually: '手动输入',
        mapHint: '点击地图选择地点',
        updateLocation: '更新地点',
        addLocation: '添加地点'
      }
    }
  },
  packageForm: {
    title: '发送包裹',
    pickupDetails: '取件详情',
    dropoffDetails: '送件详情',
    sender: '发件人',
    receiver: '收件人',
    name: '姓名',
    number: '号码',
    weight: '重量',
    price: '价格',
    location: '地点',
    pickFromMap: '从地图选择',
    enterManually: '手动输入',
    useThisAddress: '使用此地址',
    enterPickupAddress: '输入取件地址',
    enterDropoffAddress: '输入送件地址',
    addressNote: '请输入完整地址，包括街道、城市和邮政编码，以获得准确结果。',
    moreDetails: '更多详情',
    pickupDateAndTime: '取件日期和地点',
    timeZoneHint: '时区基于取件地点',
    timeZoneInfo: '时区基于取件地点',
    done: '完成',
    postJob: '发布工作',
    updateJob: '更新工作',
    mapHint: '点击地图选择地点',
    dropoff: '送件',
    validation: {
      pickupNameRequired: '发件人姓名是必填项',
      pickupPhoneRequired: '发件人电话号码是必填项',
      invalidPickupPhone: '发件人电话号码无效',
      pickupLocationRequired: '取件地点是必填项',
      weightRequired: '重量是必填项',
      invalidWeight: '无效的重量值',
      priceRequired: '价格是必填项',
      invalidPrice: '无效的价格值',
      invalidDate: '无效的日期 - 必须是今天或未来的日期',
      receiverNameRequired: '收件人姓名是必填项',
      receiverPhoneRequired: '收件人电话号码是必填项',
      invalidReceiverPhone: '收件人电话号码无效',
      receiverLocationRequired: '送货地点是必填项',
      fixErrors: '请修复以下错误',
      jobPostedSuccess: '工作发布成功',
      createPackageError: '创建包裹失败。请重试。'
    },
    updateSuccess: '包裹更新成功',
    createSuccess: '包裹创建成功',
    saveFailed: '保存包裹失败'
  },
  managePage: {
    title: '我的订单',
    tabs: {
      ongoing: '进行中',
      accepted: '已接受',
      completed: '已完成',
      canceled: '已取消'
    },
    deliveryOverview: '配送概览',
    emptyStates: {
      ongoing: {
        title: '您还没有订单',
        message: '您目前没有进行中的订单'
      },
      accepted: {
        title: '没有已接受的订单',
        message: '您目前没有已接受的订单'
      },
      completed: {
        title: '已完成的订单将显示在这里',
        message: '您目前没有已完成的订单'
      },
      canceled: {
        title: '已取消的订单列表为空',
        message: '您目前没有已取消的订单'
      }
    },
    orderStatus: {
      inProgress: '进行中',
      accepted: '已接受',
      completed: '已完成',
      canceled: '已取消'
    },
    actions: {
      acceptDelivery: '接受配送',
      cancelDelivery: '取消配送',
      editDelivery: '编辑配送',
      leaveReview: '留下评价',
      viewReview: '查看评价',
      sendMessage: '发送消息'
    },
    deliveryCompleted: {
      title: '配送完成！',
      message: '请告诉我们您与配送员的体验和服务情况。这将帮助我们改进系统。感谢使用PiqDrop！',
      leaveReview: '留下评价',
      maybeLater: '稍后再说'
    },
    cancelConfirmation: {
      title: '确认取消',
      from: '从：',
      to: '到：',
      date: '日期：',
      back: '返回',
      confirmCancel: '是的，取消！'
    }
  },
  orderDetail: {
    title: '订单详情',
    pickupDetails: {
      title: '取件详情',
      name: '姓名：',
      number: '号码：',
      weight: '重量：',
      price: '价格：',
      location: '地点：',
      note: '备注'
    },
    dropoffDetails: {
      title: '送件详情',
      name: '姓名：',
      number: '号码：',
      location: '地点：',
      note: '备注'
    },
    orderConfirmation: {
      title: '订单确认',
      from: '从：',
      to: '到：',
      date: '日期：',
      back: '返回',
      confirm: '是的，确认！'
    },
    takeOrder: '接单！'
  },
  review: {
    title: '留下评价',
    viewTitle: '您的评价',
    rider: '骑手',
    experienceQuestion: '您与骑手的体验如何？',
    writeReview: '写下您的评价',
    enterReview: '输入评价',
    maybeLater: '稍后再说',
    submitReview: '提交评价',
    submitting: '提交中...',
    yourRating: '您的评分',
    yourReview: '您的评价',
    close: '关闭',
    validation: {
      selectRating: '请选择评分',
      writeReview: '请写下评价'
    },
    success: {
      title: '成功',
      message: '评价提交成功'
    },
    error: {
      fetchFailed: '加载评价失败'
    }
  },
  updateProfile: {
    title: '更新信息',
    firstName: '名',
    lastName: '姓',
    mobile: '手机号码',
    address: '地址',
    dateOfBirth: '出生日期',
    nationality: '国籍',
    gender: '性别',
    update: '更新',
    updating: '更新中...',
    success: '个人资料更新成功',
    error: '更新个人资料失败。请重试。',
    validationError: '验证错误',
    invalidPhone: '无效的电话号码格式',
    mapHint: '点击地图选择地点',
    close: '关闭',
    done: '完成',
    cancel: '取消',
    selectLocation: '选择地点',
    manualEntry: '手动输入',
    typeAddress: '在此输入地址'
  },
  safety: {
    title: '安全中心',
    greeting: '您好',
    subtitle: '以下是您需要了解的安全信息',
    tabs: {
      guide: '指南',
      tools: '工具'
    },
    guide: {
      checkId: {
        title: '检查身份证',
        description: '在交付物品前检查配送员的身份证或护照，确保与平台上的个人资料相符。'
      },
      careful: {
        title: '小心谨慎',
        description: '如果可能，与配送员一起自拍。如果发生任何事情，这将更容易识别您的配送员，但是，未经配送员许可，不要发布照片或将其用于其他目的。在您的物品交付后，您必须删除照片，否则可能会产生后果。'
      },
      scammers: {
        title: '诈骗者',
        description: '诈骗者正在升级他们的手段，我们绝不会突然打电话要求您的卡PIN码、银行详情、完整密码、账户安全访问码、卡背面的ccv（3位数字）、账户（Micr）号码和个人信息。请保持警惕！'
      },
      payment: {
        title: '支付',
        description: '永远不要线下支付或将钱转到另一个账户。我们的支付系统旨在保护我们的用户。'
      }
    },
    tools: {
      emergencyContacts: {
        title: '紧急联系人',
        description: '保存这些紧急号码：当地警察（911）、PiqDrop支持（1-800-PIQDROP）和您的当地紧急服务。'
      },
      locationSharing: {
        title: '位置共享',
        description: '在配送过程中与可信联系人共享您的实时位置。在设备设置中启用位置共享以增加安全性。'
      },
      verificationChecklist: {
        title: '验证清单',
        description: '每次配送前使用我们的验证清单：身份证验证、个人资料匹配、支付确认和配送地点安全检查。'
      },
      reportIssues: {
        title: '报告问题',
        description: '通过应用程序立即报告任何安全问题或可疑活动。我们的安全团队全天候为您提供帮助。'
      }
    }
  },
  report: {
    title: '报告',
    tabs: {
      guide: '指南',
      tools: '工具'
    },
    guide: {
      title: '如何报告',
      description: '立即报告所有可疑和不适当的行为。'
    },
    tools: {
      title: '报告工具',
      description: '使用这些工具报告和阻止用户、标记内容或联系支持获取即时帮助。',
      blockUser: '阻止用户：点击用户个人资料并选择"阻止"以防止他们联系您',
      flagContent: '标记内容：在任何不适当的内容上使用标记图标',
      contactSupport: '联系支持：发送邮件至support@piqdrop.com获取即时帮助'
    },
    reportButton: '报告',
    modal: {
      title: '报告',
      options: {
        unsolicited: '未经请求的裸体或性图片要求。',
        underage: '18岁以下成员。',
        spam: '垃圾信息'
      },
      emailSent: '邮件已发送至support@piqdrop.com'
    }
  },
  faq: {
    title: '常见问题',
    search: '搜索',
    noFaqsFound: '未找到常见问题。',
    getSupport: '获取支持',
    loading: '加载中...',
    error: '加载常见问题失败'
  },
  supportService: {
    title: '支持服务',
    placeholder: '输入消息',
    today: '今天',
    customerService: {
      greeting: '您好，祝您有美好的一天！',
      intro: '我是客服，有什么问题吗？我可以帮您解决。'
    }
  },
  notification: {
    title: '通知',
    new: '新',
    today: '今天',
    yesterday: '昨天',
    newFeature: {
      title: '新功能可用',
      description: '我们添加了一个新功能，允许您自定义个人资料设置和偏好。来看看吧！'
    },
    maintenance: {
      title: '维护更新',
      description: '计划维护已完成。系统现在以改进的稳定性和性能运行。'
    }
  }
}; 