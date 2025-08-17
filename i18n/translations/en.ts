export default {
  navigation: {
    home: 'Home',
    messages: 'Messages',
    manage: 'Manage',
    account: 'Account'
  },
  common: {
    error: 'Error',
    ok: 'OK',
    success: 'Success'
  },
  profile: {
    title: 'Profile',
    sections: {
      fullName: 'Full Name',
      email: 'Email',
      gender: 'Gender',
      mobile: 'Mobile'
    },
    actions: {
      editInfo: 'Edit Info'
    }
  },
  account: {
    title: 'Account',
    sections: {
      general: 'General',
      billingAndPlaces: 'Billing and Places',
      legal: 'Legal',
      personal: 'Personal',
      social: 'Social'
    },
    profileInfo: {
      personalInfo: 'Personal Info',
      safety: 'Safety',
      language: 'Language'
    },
    billingAndPlaces: {
      payment: 'Payment',
      savedPlaces: 'Saved Places',
      addPlace: 'Add a Place'
    },
    legal: {
      termsOfUse: 'Terms of Use',
      privacyPolicy: 'Privacy Policy'
    },
    personal: {
      reportBug: 'Report a Bug',
      logout: 'Logout'
    },
    social: {
      support: 'Support',
      shareApp: 'Share app'
    },
    deleteAccount: 'Delete Account',
    modals: {
      logout: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        cancel: 'Cancel',
        confirm: 'Logout'
      },
      deleteAccount: {
        title: 'Delete Account',
        message: "We're sorry to see you go. Please contact our support team to assist you with account deletion. They'll help ensure a smooth process and address any concerns you may have.",
        cancel: 'Cancel',
        contactSupport: 'Contact Support'
      },
      savedPlaces: {
        title: 'Saved Places',
        pickupLocation: 'Pickup Location',
        dropoffLocation: 'Dropoff Location',
        notSet: 'Not set'
      },
      addPlace: {
        editTitle: 'Edit {{type}} Location',
        addTitle: 'Add {{type}} Location',
        address: 'Address',
        addressPlaceholder: 'Select location',
        pickFromMap: 'Pick from Map',
        enterManually: 'Enter Manually',
        mapHint: 'Tap on the map to select location',
        updateLocation: 'Update Location',
        addLocation: 'Add Location'
      }
    }
  },
  packageForm: {
    title: 'Send Package',
    pickupDetails: 'Pick-up details',
    dropoffDetails: 'Drop-off details',
    sender: 'Sender',
    receiver: 'Receiver',
    name: 'Name',
    number: 'Number',
    weight: 'Weight',
    price: 'Price',
    location: 'Location',
    pickFromMap: 'Pick from Map',
    enterManually: 'Enter Manually',
    useThisAddress: 'Use This Address',
    enterPickupAddress: 'Enter Pickup Address',
    enterDropoffAddress: 'Enter Dropoff Address',
    addressNote: 'Please enter the complete address including street, city, and postal code for accurate results.',
    moreDetails: 'More details',
    pickupDateAndLocation: 'Pickup date and location',
    pickupDateAndTime: 'Pickup date and location',
    timeZoneHint: 'Time zone is based on pickup location',
    timeZoneInfo: 'Time zone is based on pickup location',
    done: 'Done',
    postJob: 'Post Job',
    updateJob: 'Update Job',
    mapHint: 'Tap on the map to select location',
    dropoff: 'Drop-off',
    address: 'Address',
    city: 'City',
    state: 'Province/State',
    postalCode: 'Postal Code',
    country: 'Country',
    selectCountry: 'Select Country',
    searchCountries: 'Search countries...',
    fillRequiredFields: 'Please fill in all required fields',
    updating: 'Updating...',
    validation: {
      pickupNameRequired: 'Pickup name is required',
      pickupPhoneRequired: 'Pickup phone number is required',
      invalidPickupPhone: 'Invalid pickup phone number',
      pickupLocationRequired: 'Pickup location is required',
      weightRequired: 'Weight is required',
      invalidWeight: 'Invalid weight value',
      priceRequired: 'Price is required',
      invalidPrice: 'Invalid price value',
      invalidDate: 'Invalid date - must be today or future',
      receiverNameRequired: 'Receiver name is required',
      receiverPhoneRequired: 'Receiver phone number is required',
      invalidReceiverPhone: 'Invalid receiver phone number',
      receiverLocationRequired: 'Receiver location is required',
      fixErrors: 'Please fix the following errors',
      jobPostedSuccess: 'Job posted successfully',
      createPackageError: 'Failed to create package. Please try again.'
    },
    updateSuccess: 'Package updated successfully',
    createSuccess: 'Package created successfully',
    saveFailed: 'Failed to save package'
  },
  managePage: {
    title: 'My Orders',
    tabs: {
      ongoing: 'On going',
      accepted: 'Accepted',
      completed: 'Completed',
      canceled: 'Canceled'
    },
    deliveryOverview: 'Delivery overview',
    emptyStates: {
      ongoing: {
        title: "You don't have an order yet",
        message: "You don't have ongoing orders at this time"
      },
      accepted: {
        title: "No accepted orders",
        message: "You don't have accepted orders at this time"
      },
      completed: {
        title: "Completed orders will show here",
        message: "You don't have completed orders at this time"
      },
      canceled: {
        title: "Canceled orders list empty",
        message: "You don't have canceled orders at this time"
      }
    },
    orderStatus: {
      inProgress: 'In Progress',
      accepted: 'Accepted',
      completed: 'Completed',
      canceled: 'Canceled'
    },
    actions: {
      completeDelivery: 'Complete Delivery',
      cancelDelivery: 'Cancel Delivery',
      editDelivery: 'Edit Delivery',
      leaveReview: 'Leave a review',
      sendMessage: 'Send message'
    },
    deliveryCompleted: {
      title: 'Delivery completed!',
      message: "Please, let's know about your experience and the service provided to you by the dropper. This will enable us to improve our system. Thank you for using PiqDrop!",
      leaveReview: 'Leave a review',
      maybeLater: 'Maybe later'
    },
    cancelConfirmation: {
      title: 'Cancel Confirmation',
      from: 'From:',
      to: 'To:',
      date: 'Date:',
      back: 'Back',
      confirmCancel: 'Yes Cancel !'
    }
  },
  orderDetail: {
    title: 'Order Detail',
    pickupDetails: {
      title: 'Pick-up details',
      name: 'Name:',
      number: 'Number:',
      weight: 'Weight:',
      price: 'Price:',
      location: 'Location:',
      note: 'Note'
    },
    dropoffDetails: {
      title: 'Drop-off details',
      name: 'Name:',
      number: 'Number:',
      location: 'Location:',
      note: 'Note'
    }
  },
  payment: {
    title: 'Payment',
    orderSummary: 'Order Summary',
    paymentInformation: 'Payment Information',
    cardDetails: 'Card Details',
    escrowInfo: 'This payment will be held in escrow until a dropper accepts your package. If no dropper accepts within 24 hours, you will be automatically refunded.',
    payButton: 'Pay ${{amount}}',
    securityNotice: '🔒 Your payment information is secure and encrypted by Stripe',
    success: {
      title: 'Payment Successful',
      message: 'Your payment has been processed and is held in escrow. You will be refunded if no dropper accepts your package.'
    },
    error: {
      title: 'Payment Failed',
      message: 'There was an error processing your payment. Please try again.'
    },
    validation: {
      completeCardDetails: 'Please complete your card details',
      setupPayment: 'Setting up payment...',
      unableToLoad: 'Unable to load payment information'
    }
  },
  orderConfirmation: {
    title: 'Order Confirmation',
    from: 'From:',
    to: 'To:',
    date: 'Date:',
    back: 'Back',
    confirm: 'Yes Confirm !'
  },
  takeOrder: 'Take order!',
  review: {
    title: 'Leave a review',
    dropper: 'Dropper',
    experienceQuestion: 'How was your experience with the dropper?',
    writeReview: 'Write your Review',
    enterReview: 'Enter Review',
    maybeLater: 'Maybe later',
    submitReview: 'Submit review',
    submitting: 'Submitting...',
    validation: {
      selectRating: 'Please select a rating',
      writeReview: 'Please write a review'
    },
    success: {
      title: 'Success',
      message: 'Review submitted successfully'
    }
  },
  updateProfile: {
    title: 'Update Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    mobile: 'Mobile Number',
    address: 'Address',
    dateOfBirth: 'Date of birth',
    nationality: 'Nationality',
    gender: 'Gender',
    update: 'Update',
    updating: 'Updating...',
    success: 'Profile updated successfully',
    error: 'Failed to update profile. Please try again.',
    validationError: 'Validation Error',
    invalidPhone: 'Invalid phone number format',
    mapHint: 'Tap on the map to select location',
    close: 'Close',
    done: 'Done',
    cancel: 'Cancel',
    selectLocation: 'Select Location',
    manualEntry: 'Manual Entry',
    typeAddress: 'Type address here'
  },
  safety: {
    title: 'Safety Center',
    greeting: 'Hi',
    subtitle: "Here's what you need to know about safety",
    tabs: {
      guide: 'Guide',
      tools: 'Tools'
    },
    guide: {
      checkId: {
        title: 'Check ID',
        description: 'Check the ID card or passport of the dropper before giving them your items, make sure it matches with the profile on the platform.'
      },
      careful: {
        title: 'Careful',
        description: 'Take a selfie with your dropper if possible. it\'s easier to identify your dropper if anything should happen, however, don\'t post the picture or use it for any other purpose without the permission of the dropper, After your items have been dropped you are obligated to delete the photo, failure to do so might have consequences.'
      },
      scammers: {
        title: 'Scammers',
        description: 'scammers are upping their game, we will never call you out of the blue to ask for you card PIN, bank details, full password, account secure access code the ccv (3 digits) on the back of your card, account (Micr) number and personal information. Be vigilant!'
      },
      payment: {
        title: 'Payment',
        description: 'Never pay offline or move money to another account. Our payment system is built to protect our users.'
      }
    },
    tools: {
      emergencyContacts: {
        title: 'Emergency Contacts',
        description: 'Save these emergency numbers: Local Police (911), PiqDrop Support (1-800-PIQDROP), and your local emergency services.'
      },
      locationSharing: {
        title: 'Location Sharing',
        description: 'Share your live location with trusted contacts during drops. Enable location sharing in your device settings for added safety.'
      },
      verificationChecklist: {
        title: 'Verification Checklist',
        description: 'Use our verification checklist before each drop: ID verification, profile match, payment confirmation, and drop location safety check.'
      },
      reportIssues: {
        title: 'Report Issues',
        description: 'Report any safety concerns or suspicious activity immediately through the app. Our safety team is available 24/7 to assist you.'
      }
    }
  },
  report: {
    title: 'Report',
    tabs: {
      guide: 'Guide',
      tools: 'Tools'
    },
    guide: {
      title: 'How to report',
      description: 'Report all suspicious and inappropriate behavior immediately.'
    },
    tools: {
      title: 'Reporting Tools',
      description: 'Use these tools to report and block users, flag content, or contact support for immediate assistance.',
      blockUser: 'Block User: Tap on a user\'s profile and select \'Block\' to prevent them from contacting you',
      flagContent: 'Flag Content: Use the flag icon on any inappropriate content to report it',
      contactSupport: 'Contact Support: Email support@piqdrop.com for immediate assistance'
    },
    reportButton: 'Report',
    modal: {
      title: 'Report',
      options: {
        unsolicited: 'Unsolicited requests for any nude or sexual images.',
        underage: 'Member under 18.',
        spam: 'Spam'
      },
      emailSent: 'An email has been sent to support@piqdrop.com'
    }
  },
  faq: {
    title: 'FAQ',
    search: 'Search',
    noFaqsFound: 'No FAQs found.',
    getSupport: 'Get Support',
    loading: 'Loading...',
    error: 'Failed to load FAQs'
  },
  supportService: {
    title: 'Support Service',
    placeholder: 'Type a message',
    today: 'Today',
    customerService: {
      greeting: 'Hello, Good day!',
      intro: "I'm a Customer service, is there a problem? so i can help you solve it."
    }
  },
  notification: {
    title: 'Notification',
    new: 'New',
    today: 'Today',
    yesterday: 'Yesterday',
    newFeature: {
      title: 'New Feature Available',
      description: "We've added a new feature that allows you to customize your profile settings and preferences. Check it out!"
    },
    maintenance: {
      title: 'Maintenance Update',
      description: 'Scheduled maintenance has been completed. The system is now running with improved stability and performance.'
    }
  },
  paymentPreview: {
    title: 'Payment',
    packageSummary: 'Package Summary',
    weight: 'Weight',
    price: 'Price',
    cardDetails: 'Card Details',
    completeCardDetails: 'Please complete your card details',
    paymentSuccess: 'Your payment was successful!',
    packageCreationFailed: 'Failed to create package after payment.',
    paymentFailed: 'Payment failed. Please try again.',
    processing: 'Processing...',
    payNow: 'Pay Now',
    securityNotice: 'Your payment information is secure and encrypted by Stripe'
  }
}; 