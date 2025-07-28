export default {
  navigation: {
    home: 'ホーム',
    messages: 'メッセージ',
    manage: '管理',
    account: 'アカウント'
  },
  common: {
    error: 'エラー',
    ok: 'OK',
    success: '成功'
  },
  profile: {
    title: 'プロフィール',
    sections: {
      fullName: '氏名',
      email: 'メールアドレス',
      gender: '性別',
      mobile: '電話番号'
    },
    actions: {
      editInfo: '情報を編集'
    }
  },
  account: {
    title: 'アカウント',
    sections: {
      general: '一般',
      billingAndPlaces: '請求と場所',
      legal: '法的',
      personal: '個人',
      social: 'ソーシャル'
    },
    profileInfo: {
      personalInfo: '個人情報',
      safety: 'セキュリティ',
      language: '言語'
    },
    billingAndPlaces: {
      payment: '支払い',
      savedPlaces: '保存された場所',
      addPlace: '場所を追加'
    },
    legal: {
      termsOfUse: '利用規約',
      privacyPolicy: 'プライバシーポリシー'
    },
    personal: {
      reportBug: 'バグを報告',
      logout: 'ログアウト'
    },
    social: {
      support: 'サポート',
      shareApp: 'アプリを共有'
    },
    deleteAccount: 'アカウントを削除',
    modals: {
      logout: {
        title: 'ログアウト',
        message: 'ログアウトしてもよろしいですか？',
        cancel: 'キャンセル',
        confirm: 'ログアウト'
      },
      deleteAccount: {
        title: 'アカウントを削除',
        message: 'お別れを残念に思います。アカウントの削除については、サポートチームにお問い合わせください。彼らがスムーズなプロセスを支援し、お客様の問題を解決いたします。',
        cancel: 'キャンセル',
        contactSupport: 'サポートに連絡'
      },
      savedPlaces: {
        title: '保存された場所',
        pickupLocation: '受け取り場所',
        dropoffLocation: '配達場所',
        notSet: '未設定'
      },
      addPlace: {
        editTitle: '{{type}}の場所を編集',
        addTitle: '{{type}}の場所を追加',
        address: '住所',
        addressPlaceholder: '場所を選択',
        pickFromMap: '地図から選択',
        enterManually: '手動で入力',
        mapHint: '地図をタップして場所を選択',
        updateLocation: '場所を更新',
        addLocation: '場所を追加'
      }
    }
  },
  packageForm: {
    title: '荷物を送る',
    pickupDetails: '受け取り詳細',
    dropoffDetails: '配達詳細',
    sender: '送り主',
    receiver: '受取人',
    name: '名前',
    number: '番号',
    weight: '重量',
    price: '価格',
    location: '場所',
    pickFromMap: '地図から選択',
    enterManually: '手動で入力',
    useThisAddress: 'この住所を使用',
    enterPickupAddress: '集荷住所を入力',
    enterDropoffAddress: '配達住所を入力',
    addressNote: '正確な結果を得るために、通り、都市、郵便番号を含む完全な住所を入力してください。',
    addressNote: '正確な結果を得るために、通り、都市、郵便番号を含む完全な住所を入力してください。',
    moreDetails: '詳細',
    pickupDateAndTime: '受け取り日時',
    timeZoneHint: 'タイムゾーンは受け取り場所に基づいています',
    timeZoneInfo: 'タイムゾーンは受け取り場所に基づいています',
    done: '完了',
    postJob: '仕事を投稿',
    updateJob: '仕事を更新',
    mapHint: '地図をタップして場所を選択',
    dropoff: '配達',
    validation: {
      pickupNameRequired: '送り主の名前は必須です',
      pickupPhoneRequired: '送り主の電話番号は必須です',
      invalidPickupPhone: '送り主の電話番号が無効です',
      pickupLocationRequired: '集荷場所は必須です',
      weightRequired: '重量は必須です',
      invalidWeight: '無効な重量値です',
      priceRequired: '価格は必須です',
      invalidPrice: '無効な価格値です',
      invalidDate: '無効な日付 - 今日以降の日付である必要があります',
      receiverNameRequired: '受取人の名前は必須です',
      receiverPhoneRequired: '受取人の電話番号は必須です',
      invalidReceiverPhone: '受取人の電話番号が無効です',
      receiverLocationRequired: '配達先は必須です',
      fixErrors: '以下のエラーを修正してください',
      jobPostedSuccess: '仕事が正常に投稿されました',
      createPackageError: 'パッケージの作成に失敗しました。もう一度お試しください。'
    },
    updateSuccess: '荷物が正常に更新されました',
    createSuccess: '荷物が正常に作成されました',
    saveFailed: '荷物の保存に失敗しました'
  },
  managePage: {
    title: 'マイオーダー',
    tabs: {
      ongoing: '進行中',
      accepted: '受付済み',
      completed: '完了',
      canceled: 'キャンセル済み'
    },
    deliveryOverview: '配達概要',
    emptyStates: {
      ongoing: {
        title: 'まだオーダーがありません',
        message: '現在進行中のオーダーはありません'
      },
      accepted: {
        title: '受付済みのオーダーはありません',
        message: '現在受付済みのオーダーはありません'
      },
      completed: {
        title: '完了したオーダーはここに表示されます',
        message: '現在完了したオーダーはありません'
      },
      canceled: {
        title: 'キャンセルされたオーダーのリストは空です',
        message: '現在キャンセルされたオーダーはありません'
      }
    },
    orderStatus: {
      inProgress: '進行中',
      accepted: '受付済み',
      completed: '完了',
      canceled: 'キャンセル済み'
    },
    actions: {
      completeDelivery: '配達完了',
      cancelDelivery: '配達キャンセル',
      editDelivery: '配達編集',
      leaveReview: 'レビューを書く',
      sendMessage: 'メッセージを送る'
    },
    deliveryCompleted: {
      title: '配達完了！',
      message: '配達員のサービスについてのご意見をお聞かせください。これにより、システムの改善が可能になります。PiqDropをご利用いただきありがとうございます！',
      leaveReview: 'レビューを残す',
      maybeLater: '後で'
    },
    cancelConfirmation: {
      title: 'キャンセルの確認',
      from: '送り主:',
      to: '受取人:',
      date: '日付:',
      back: '戻る',
      confirmCancel: 'はい、キャンセルします！'
    }
  },
  orderDetail: {
    title: 'オーダー詳細',
    pickupDetails: {
      title: '受け取り詳細',
      name: '名前:',
      number: '番号:',
      weight: '重量:',
      price: '価格:',
      location: '場所:',
      note: 'メモ'
    },
    dropoffDetails: {
      title: '配達詳細',
      name: '名前:',
      number: '番号:',
      location: '場所:',
      note: 'メモ'
    },
    orderConfirmation: {
      title: 'オーダー確認',
      from: '送り主:',
      to: '受取人:',
      date: '日付:',
      back: '戻る',
      confirm: 'はい、確認します！'
    },
    takeOrder: 'オーダーを受ける！'
  },
  review: {
    title: 'レビューを残す',
    dropper: '配達員',
    experienceQuestion: '配達員との経験はいかがでしたか？',
    writeReview: 'レビューを書く',
    enterReview: 'レビューを入力',
    maybeLater: '後で',
    submitReview: 'レビューを送信',
    submitting: '送信中...',
    validation: {
      selectRating: '評価を選択してください',
      writeReview: 'レビューを書いてください'
    },
    success: {
      title: '成功',
      message: 'レビューが正常に送信されました'
    }
  },
  updateProfile: {
    title: '情報を更新',
    firstName: '名',
    lastName: '姓',
    mobile: '電話番号',
    address: '住所',
    dateOfBirth: '生年月日',
    nationality: '国籍',
    gender: '性別',
    update: '更新',
    updating: '更新中...',
    success: 'プロフィールが正常に更新されました',
    error: 'プロフィールの更新に失敗しました。もう一度お試しください。',
    validationError: '検証エラー',
    invalidPhone: '無効な電話番号形式です',
    mapHint: '地図をタップして場所を選択',
    close: '閉じる',
    done: '完了',
    cancel: 'キャンセル',
    selectLocation: '場所を選択',
    manualEntry: '手動入力',
    typeAddress: 'ここに住所を入力'
  },
  safety: {
    title: 'セキュリティセンター',
    greeting: 'こんにちは',
    subtitle: 'セキュリティについて知っておくべきこと',
    tabs: {
      guide: 'ガイド',
      tools: 'ツール'
    },
    guide: {
      checkId: {
        title: 'IDを確認',
        description: '荷物を渡す前に配達員の身分証明書やパスポートを確認し、プラットフォーム上のプロフィールと一致することを確認してください。'
      },
      careful: {
        title: '注意を払う',
        description: '可能であれば、配達員と一緒に自撮り写真を撮ってください。これは何かが起こった場合に配達員を特定しやすくしますが、配達員の許可なしに写真を公開したり他の目的で使用したりしないでください。荷物の配達後は、写真を削除する義務があります。これを怠ると結果が生じる可能性があります。'
      },
      scammers: {
        title: '詐欺師',
        description: '詐欺師はその手法を洗練させています。私たちは決して突然電話をかけて、カードのPIN、銀行口座の詳細、完全なパスワード、アカウントのセキュアアクセスコード、カード裏面のccv（3桁）、口座番号（Micr）、個人情報を求めることはありません。注意を払ってください！'
      },
      payment: {
        title: '支払い',
        description: 'オフラインで支払ったり、別の口座に送金したりしないでください。私たちの支払いシステムはユーザーを保護するために作られています。'
      }
    },
    tools: {
      emergencyContacts: {
        title: '緊急連絡先',
        description: 'これらの緊急連絡先を保存してください：地元の警察（911）、PiqDropサポート（1-800-PIQDROP）、および地元の緊急サービス。'
      },
      locationSharing: {
        title: '位置情報共有',
        description: '配達中に信頼できる連絡先とリアルタイムで位置情報を共有してください。デバイスの設定で位置情報共有を有効にして、セキュリティを強化してください。'
      },
      verificationChecklist: {
        title: '確認チェックリスト',
        description: '各配達前にこのチェックリストを使用してください：ID確認、プロフィールの一致、支払い確認、配達場所の安全性確認。'
      },
      reportIssues: {
        title: '問題を報告',
        description: 'セキュリティの問題や不審な活動があれば、アプリを通じてすぐに報告してください。私たちのセキュリティチームは24時間365日、あなたをサポートするために利用可能です。'
      }
    }
  },
  report: {
    title: '報告',
    tabs: {
      guide: 'ガイド',
      tools: 'ツール'
    },
    guide: {
      title: '報告方法',
      description: '不審または不適切な行動があれば、すぐに報告してください。'
    },
    tools: {
      title: '報告ツール',
      description: 'これらのツールを使用してユーザーを報告・ブロックし、コンテンツにフラグを立てたり、サポートに連絡して即時の支援を受けたりしてください。',
      blockUser: 'ユーザーをブロック：ユーザープロフィールをタップし、「ブロック」を選択して、そのユーザーとの接触を防ぎます',
      flagContent: 'コンテンツにフラグを立てる：不適切なコンテンツにフラグアイコンを使用します',
      contactSupport: 'サポートに連絡：即時の支援のためにsupport@piqdrop.comにメールを送信してください'
    },
    reportButton: '報告',
    modal: {
      title: '報告',
      options: {
        unsolicited: '裸体や性的な画像の不請合な要求。',
        underage: '18歳未満の参加者。',
        spam: 'スパム'
      },
      emailSent: 'メールがsupport@piqdrop.comに送信されました'
    }
  },
  faq: {
    title: 'よくある質問',
    search: '検索',
    noFaqsFound: 'FAQが見つかりませんでした。',
    getSupport: 'サポートを受ける',
    loading: '読み込み中...',
    error: 'FAQの読み込みに失敗しました'
  },
  supportService: {
    title: 'サポートサービス',
    placeholder: 'メッセージを入力',
    today: '今日',
    customerService: {
      greeting: 'こんにちは！',
      intro: 'カスタマーサービスです。何か問題はありますか？解決のお手伝いをさせていただきます。'
    }
  },
  notification: {
    title: '通知',
    new: '新着',
    today: '今日',
    yesterday: '昨日',
    newFeature: {
      title: '新機能が利用可能',
      description: 'プロフィールの設定と好みをカスタマイズできる新機能を追加しました。チェックしてみてください！'
    },
    maintenance: {
      title: 'メンテナンス更新',
      description: '予定されたメンテナンスが完了しました。システムは改善された安定性とパフォーマンスで動作しています。'
    }
  }
}; 