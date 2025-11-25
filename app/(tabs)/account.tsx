import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Share, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import Icon from 'react-native-vector-icons/Feather'; // or any icon library
import { UserRoundedIcon } from '@/components/icons/UserRoundedIcon';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
import { LetterIcon } from '@/components/icons/LetterIcon';
import { SafetyIcon } from '@/components/icons/SafetyIcon';
import { WalletIcon } from '@/components/icons/WalletIcon';
import { PlaceIcon } from '@/components/icons/PlaceIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { FileIcon } from '@/components/icons/FileIcon';
import { ShieldKeyholeIcon } from '@/components/icons/ShieldKeyholeIcon';
import { BugIcon } from '@/components/icons/BugIcon';
import { FrameIcon } from '@/components/icons/FrameIcon';
import { HeadphonesRoundIcon } from '@/components/icons/HeadphonesRoundIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { TrashBinMinimalistic2Icon } from '@/components/icons/TrashBinMinimalistic2Icon';
import { LogoutIcon } from '@/components/icons/LogoutIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEADER_HEIGHT = 156;
const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#424242',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
  divider: '#D9DFD9',
};

interface Place {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SavedPlaces {
  pickup: Place | null;
  dropoff: Place | null;
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showSavedPlacesModal, setShowSavedPlacesModal] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); 
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaces>({
    pickup: null,
    dropoff: null
  });
  const [newPlaceType, setNewPlaceType] = useState<'pickup' | 'dropoff'>('pickup');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [locationMode, setLocationMode] = useState('map');
  const [marker, setMarker] = useState({
    latitude: 59.33422549602568,
    longitude: 18.05871074765847,
  });
  const [region, setRegion] = useState({
    latitude: 59.33422549602568,
    longitude: 18.05871074765847,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    getLanguage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, [])
  );

  const getUser = async () => {
    const user = await authService.getCurrentUser();
    setUser(user);
  };

  const getLanguage = async () => {
    const user = await authService.getCurrentUser();

    // Load saved language from user settings
    if (user?.settings) {
      const settings = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
      if (settings.language && SUPPORTED_LANGUAGES.some(lang => lang.code === settings.language)) {
        setSelectedLanguage(settings.language);
      }
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const openLegalModal = (title: string, content: string) => {
    setLegalContent({ title, content });
    setShowLegalModal(true);
  };

  const loadSavedPlaces = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.settings) {
        const settings = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
        if (settings.place) {
          setSavedPlaces({
            pickup: settings.place.pickup ? {
              id: Date.now(),
              name: 'Pickup',
              address: settings.place.pickup.address,
              latitude: settings.place.pickup.latitude,
              longitude: settings.place.pickup.longitude
            } : null,
            dropoff: settings.place.dropoff ? {
              id: Date.now(),
              name: 'Dropoff',
              address: settings.place.dropoff.address,
              latitude: settings.place.dropoff.latitude,
              longitude: settings.place.dropoff.longitude
            } : null
          });
        }
      }
    } catch (error) {
      console.error('Error loading saved places:', error);
    }
  };

  const savePlaceToSettings = async (type: 'pickup' | 'dropoff', place: Place | null) => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const currentSettings = user.settings ? 
          (typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings) 
          : {};

        // Ensure place object exists and preserve existing places
        const currentPlaces = currentSettings.place || {};
        
        const updatedSettings = {
          ...currentSettings,
          place: {
            ...currentPlaces, // Preserve all existing places
            [type]: place ? {
              address: place.address,
              latitude: place.latitude,
              longitude: place.longitude
            } : null
          }
        };

        const updatedUser = await authService.updateUserSettings(updatedSettings);
        setUser(updatedUser);

        // Update local state
        setSavedPlaces(prev => ({
          ...prev,
          [type]: place
        }));
      }
    } catch (error) {
      console.error('Error saving place:', error);
      Alert.alert('Error', 'Failed to save place. Please try again.');
    }
  };

  // Load saved places when component mounts
  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const handleDeletePlace = async (type: 'pickup' | 'dropoff') => {
    await savePlaceToSettings(type, null);
  };

  const handleEditPlace = (id: number) => {
    // TODO: Implement edit functionality
    console.log('Edit place:', id);
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);

    try {
      const geocode = await Location.reverseGeocodeAsync(coords);
      if (geocode.length > 0) {
        const place = geocode[0];
        const parts = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.postalCode,
          place.country
        ];
        const uniqueParts = Array.from(new Set(parts.filter(Boolean)));
        const address = uniqueParts.join(', ');        
        setNewPlaceAddress(address);
      } else {
        setNewPlaceAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setNewPlaceAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const geocodedLocations = await Location.geocodeAsync(address);
      if (geocodedLocations && geocodedLocations.length > 0) {
        const { latitude, longitude } = geocodedLocations[0];
        setMarker({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        return { latitude, longitude };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleAddPlace = async () => {
    if (!newPlaceAddress) return;

    try {
      let coordinates;
      
      if (locationMode === 'manual') {
        // For manual address entry, get coordinates through geocoding
        coordinates = await geocodeAddress(newPlaceAddress);
        if (!coordinates) {
          Alert.alert('Error', 'Could not find location for the entered address. Please try again or use the map.');
          return;
        }
      } else {
        // For map mode, use the marker coordinates
        if (!marker) {
          Alert.alert('Error', 'Please select a location on the map.');
          return;
        }
        coordinates = marker;
      }

      const newPlace: Place = {
        id: Date.now(),
        name: newPlaceType === 'pickup' ? 'Pickup' : 'Dropoff',
        address: newPlaceAddress,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };

      await savePlaceToSettings(newPlaceType, newPlace);
      setNewPlaceAddress('');
      setMarker({
        latitude: 0,
        longitude: 0,
      });
      setShowAddPlaceModal(false);
    } catch (error) {
      console.error('Error adding place:', error);
      Alert.alert('Error', 'Failed to add place. Please try again.');
    }
  };

  // Add debounced geocoding when address is entered manually
  useEffect(() => {
    if (locationMode === 'manual' && newPlaceAddress) {
      const timer = setTimeout(() => {
        geocodeAddress(newPlaceAddress);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timer);
    }
  }, [locationMode, newPlaceAddress]);

  const handleLanguageChange = async (language: string) => {
    try {
      // Get current user and their settings
      const user = await authService.getCurrentUser();
      if (user) {
        // Parse existing settings or create new object
        const currentSettings = user.settings ? 
          (typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings) 
          : {};

        // Update settings with new language
        const updatedSettings = {
          ...currentSettings,
          language: language
        };

        // Update i18n and local state
        await i18n.changeLanguage(language); 
        setSelectedLanguage(language);
        setShowLanguageModal(false);

        // Save to server
        const updatedUser = await authService.updateUserSettings(updatedSettings);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t('account.modals.deleteAccount.title'),
      'Are you sure you want to delete your account? This action cannot be undone. Your account will be permanently deleted within 30 days.',
      [
        {
          text: t('account.modals.deleteAccount.cancel'),
          style: 'cancel',
          onPress: () => setShowDeleteAccountModal(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAccount(true);
              setShowDeleteAccountModal(false);
              
              // Call the authenticated delete endpoint
              await api.delete('/account/delete');
              
              // Clear local storage
              await AsyncStorage.multiRemove(['auth_token', 'user', 'remember_me']);
              
              // Show success message
              Alert.alert(
                'Account Deleted',
                'Your account has been deleted successfully. You will be logged out now.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to login
                      router.replace('/login');
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Delete account error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to delete account. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 86) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('account.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.profileInfoRow}>
            {user?.image ? (
              <Image source={{ uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${user?.image}` }} style={styles.profileImage} />
            ) : (
              <Image source={require('@/assets/img/profile-blank.png')} style={styles.profileImage} />
            )}
            <Text style={styles.profileName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.profileUserName}>{user?.email}</Text>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('account.sections.general')}</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
                <View style={styles.rowLeft}>
                  <UserRoundedIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.profileInfo.personalInfo')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => router.push('/safety')}>
                <View style={styles.rowLeft}>
                  <SafetyIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.profileInfo.safety')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => setShowLanguageModal(true)}>
                <View style={styles.rowLeft}>
                  <LetterIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.profileInfo.language')}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.selectedLanguage}>
                    {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}
                  </Text>
                  <RightArrowIcon size={20} color={COLORS.text} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('account.sections.billingAndPlaces')}</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.card}>
              {/* <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                  <WalletIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>Payment</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity> */}
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => setShowSavedPlacesModal(true)}>
                <View style={styles.rowLeft}>
                  <PlaceIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.billingAndPlaces.savedPlaces')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => setShowSavedPlacesModal(true)}>
                <View style={styles.rowLeft}>
                  <PlusIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.billingAndPlaces.addPlace')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('account.sections.legal')}</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.row}
                onPress={() => openLegalModal(
                  t('account.legal.termsOfUse'),
                  'Welcome to PiqDrop. By using our service, you agree to these Terms of Use. Please read them carefully.\n\n1. Service Description\nPiqDrop is a delivery service platform that connects users with delivery partners. We facilitate the delivery of items between users and delivery partners, but we are not a delivery service provider.\n\n2. User Accounts\nYou must be at least 18 years old to use PiqDrop. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information when creating your account.\n\n3. User Conduct\nYou agree to use PiqDrop only for lawful purposes and in accordance with these Terms. You will not:\n- Use the service for any illegal purposes\n- Harass, abuse, or harm others\n- Attempt to gain unauthorized access to any part of the service\n- Interfere with the proper working of the service\n\n4. Delivery Services\n- Delivery partners are independent contractors, not employees of PiqDrop\n- Delivery times are estimates and not guaranteed\n- You are responsible for providing accurate delivery information\n- We reserve the right to refuse service to anyone\n\n5. Payment Terms\n- All payments must be made through our approved payment methods\n- Prices are subject to change without notice\n- Additional fees may apply for special delivery requests\n- Refunds are subject to our refund policy\n\n6. Intellectual Property\nAll content, features, and functionality of PiqDrop are owned by us and are protected by copyright, trademark, and other intellectual property laws.\n\n7. Limitation of Liability\nPiqDrop is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.\n\n8. Modifications to Terms\nWe reserve the right to modify these terms at any time. We will notify users of any material changes via the app or email.\n\n9. Termination\nWe may terminate or suspend your access to PiqDrop immediately, without prior notice, for any breach of these Terms.\n\n10. Governing Law\nThese Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PiqDrop operates.\n\n11. Contact Information\nFor questions about these Terms, please contact our support team through the app or at support@piqdrop.com.'
                )}
              >
                <View style={styles.rowLeft}>
                  <FileIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.legal.termsOfUse')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.row}
                onPress={() => openLegalModal(
                  t('account.legal.privacyPolicy'),
                  'Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.\n\n1. Information We Collect\nWe collect information that you provide directly to us, including but not limited to your name, email address, phone number, delivery addresses, and any other information you choose to provide.\n\n2. How We Use Your Information\nWe use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and our users. This includes processing your orders, communicating with you about your account, and sending you updates about our services.\n\n3. Information Sharing and Disclosure\nWe do not share your personal information with third parties except as described in this privacy policy. We may share your information with delivery partners, payment processors, and service providers who assist us in operating our platform.\n\n4. Data Security\nWe implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.\n\n5. Your Rights and Choices\nYou have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications and manage your privacy preferences through your account settings.\n\n6. Cookies and Tracking Technologies\nWe use cookies and similar tracking technologies to collect information about your browsing activities and preferences. This helps us improve your experience and provide personalized content.\n\n7. Children\'s Privacy\nOur services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.\n\n8. International Data Transfers\nYour information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in compliance with applicable data protection laws.\n\n9. Data Retention\nWe retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.\n\n10. Changes to This Policy\nWe may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.'
                )}
              >
                <View style={styles.rowLeft}>
                  <ShieldKeyholeIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.legal.privacyPolicy')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('account.sections.personal')}</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/report')}>
                <View style={styles.rowLeft}>
                  <BugIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.personal.reportBug')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={() => setShowLogoutModal(true)}>
                <View style={styles.rowLeft}>
                  <FrameIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.personal.logout')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('account.sections.social')}</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/faq')}>
                <View style={styles.rowLeft}>
                  <HeadphonesRoundIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.social.support')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.row}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: 'Check out PiqDrop - Your trusted delivery companion! Download now: https://piqdrop.com',
                      title: 'Share PiqDrop App'
                    });
                  } catch (error) {
                    console.error('Error sharing:', error);
                  }
                }}
              >
                <View style={styles.rowLeft}>
                  <ShareIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{t('account.social.shareApp')}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.innerContainer, {paddingTop: 8}]}>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => setShowDeleteAccountModal(true)}>
                <View style={styles.rowLeft}>
                  <TrashBinMinimalistic2Icon size={20} color={'#FF4949'} />
                  <Text style={[styles.rowLabel, {color: '#FF4949'}]}>{t('account.deleteAccount')}</Text>
                </View>
                <RightArrowIcon size={20} color={'#FF4949'} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </Animated.ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <LogoutIcon size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>{t('account.modals.logout.title')}</Text>
            <Text style={styles.modalText}>{t('account.modals.logout.message')}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>{t('account.modals.logout.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={async () => {
                  try {
                    setIsLoggingOut(true);
                    await authService.logout();
                    setShowLogoutModal(false);
                    router.replace('/login');
                  } catch (error: any) {
                    console.error('Logout failed:', error);
                    setShowLogoutModal(false);
                    router.replace('/login');
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color={COLORS.buttonText} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>{t('account.modals.logout.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDeleteAccountModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteAccountModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDeleteAccountModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(255, 73, 73, 0.1)' }]}>
              <TrashBinMinimalistic2Icon size={48} color={'#FF4949'} />
            </View>
            <Text style={styles.modalTitle}>{t('account.modals.deleteAccount.title')}</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action cannot be undone. Your account and all associated data will be permanently deleted within 30 days.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowDeleteAccountModal(false)}
                disabled={isDeletingAccount}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  {t('account.modals.deleteAccount.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#FF4949' }]} 
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showLegalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.legalModalContainer}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>{legalContent.title}</Text>
              <TouchableOpacity 
                style={styles.legalModalCloseButton}
                onPress={() => setShowLegalModal(false)}
              >
                <Icon name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalModalContent} contentContainerStyle={[styles.legalModalContentContainer, { paddingBottom: Math.max(insets.bottom, 48) }]}>
              <Text style={styles.legalModalText}>{legalContent.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSavedPlacesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSavedPlacesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.savedPlacesModalContainer}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>{t('account.modals.savedPlaces.title')}</Text>
              <TouchableOpacity 
                style={styles.legalModalCloseButton}
                onPress={() => setShowSavedPlacesModal(false)}
              >
                <Icon name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.savedPlacesList} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
              {/* Pickup Location */}
              <View style={styles.savedPlaceItem}>
                <View style={styles.savedPlaceInfo}>
                  <Text style={styles.savedPlaceName}>{t('account.modals.savedPlaces.pickupLocation')}</Text>
                  <Text style={styles.savedPlaceAddress}>
                    {savedPlaces.pickup ? savedPlaces.pickup.address : t('account.modals.savedPlaces.notSet')}
                  </Text>
                </View>
                <View style={styles.savedPlaceActions}>
                  <TouchableOpacity 
                    style={styles.savedPlaceActionButton}
                    onPress={() => {
                      setNewPlaceType('pickup');
                      if (savedPlaces.pickup) {
                        setNewPlaceAddress(savedPlaces.pickup.address);
                        setMarker({
                          latitude: savedPlaces.pickup.latitude,
                          longitude: savedPlaces.pickup.longitude
                        });
                        setRegion({
                          latitude: savedPlaces.pickup.latitude,
                          longitude: savedPlaces.pickup.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01
                        });
                      }
                      setShowAddPlaceModal(true);
                      setShowSavedPlacesModal(false);
                    }}
                  >
                    {savedPlaces.pickup ? (
                      <EditIcon size={20} color={COLORS.primary} />
                    ) : (
                      <PlusIcon size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dropoff Location */}
              <View style={styles.savedPlaceItem}>
                <View style={styles.savedPlaceInfo}>
                  <Text style={styles.savedPlaceName}>{t('account.modals.savedPlaces.dropoffLocation')}</Text>
                  <Text style={styles.savedPlaceAddress}>
                    {savedPlaces.dropoff ? savedPlaces.dropoff.address : t('account.modals.savedPlaces.notSet')}
                  </Text>
                </View>
                <View style={styles.savedPlaceActions}>
                  <TouchableOpacity 
                    style={styles.savedPlaceActionButton}
                    onPress={() => {
                      setNewPlaceType('dropoff');
                      if (savedPlaces.dropoff) {
                        setNewPlaceAddress(savedPlaces.dropoff.address);
                        setMarker({
                          latitude: savedPlaces.dropoff.latitude,
                          longitude: savedPlaces.dropoff.longitude
                        });
                        setRegion({
                          latitude: savedPlaces.dropoff.latitude,
                          longitude: savedPlaces.dropoff.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01
                        });
                      }
                      setShowAddPlaceModal(true);
                      setShowSavedPlacesModal(false);
                    }}
                  >
                    {savedPlaces.dropoff ? (
                      <EditIcon size={20} color={COLORS.primary} />
                    ) : (
                      <PlusIcon size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddPlaceModal}
        animationType="slide"
        onRequestClose={() => setShowAddPlaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addPlaceModalContainer}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>
                {savedPlaces[newPlaceType] ? 
                  t('account.modals.addPlace.editTitle', { type: newPlaceType === 'pickup' ? 'Pickup' : 'Dropoff' }) :
                  t('account.modals.addPlace.addTitle', { type: newPlaceType === 'pickup' ? 'Pickup' : 'Dropoff' })}
              </Text>
              <TouchableOpacity 
                style={styles.legalModalCloseButton}
                onPress={() => setShowAddPlaceModal(false)}
              >
                <Icon name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.addPlaceForm}>
              <Text style={styles.label}>{t('account.modals.addPlace.address')}</Text>
              <View style={styles.inputContainer}>
                <LocationIcon size={20} color={COLORS.text} />
                <TextInput
                  style={styles.input}
                  placeholder={t('account.modals.addPlace.addressPlaceholder')}
                  value={newPlaceAddress}
                  onChangeText={setNewPlaceAddress}
                  onFocus={() => setLocationMode('manual')}
                />
              </View>

              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, locationMode === 'map' && styles.activeToggle]}
                  onPress={() => setLocationMode('map')}
                >
                  <Text style={styles.toggleText}>{t('account.modals.addPlace.pickFromMap')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, locationMode === 'manual' && styles.activeToggle]}
                  onPress={() => setLocationMode('manual')}
                >
                  <Text style={styles.toggleText}>{t('account.modals.addPlace.enterManually')}</Text>
                </TouchableOpacity>
              </View>

              {locationMode === 'map' && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={region}
                    onPress={handleMapPress}
                  >
                    {marker && <Marker coordinate={marker} />}
                  </MapView>
                  <Text style={styles.mapHint}>{t('account.modals.addPlace.mapHint')}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.continueButton, !newPlaceAddress && styles.disabledButton]}
                onPress={handleAddPlace}
                disabled={!newPlaceAddress}
              >
                <Text style={styles.continueButtonText}>
                  {savedPlaces[newPlaceType] ? 
                    t('account.modals.addPlace.updateLocation') :
                    t('account.modals.addPlace.addLocation')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContainer, { height: 600 }]}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Icon name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.modalIconContainer}>
              <LetterIcon size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>{t('account.profileInfo.language')}</Text>
            <ScrollView style={[styles.languageOptions, { height: 400 }]}>
              {SUPPORTED_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === language.code && styles.selectedLanguageOption
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage === language.code && styles.selectedLanguageOptionText
                  ]}>
                    {language.name}
                  </Text>
                  {selectedLanguage === language.code && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel]} 
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                {t('account.modals.logout.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    paddingBottom: 86,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 60,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  leftArrow: {
    width: 44,
    height: 44,
    position: 'absolute',
    left: 16,
    top: 52,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 44,
  },
  form: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  profileInfoRow: {
    flexDirection: 'column', 
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -59,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileName: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  profileUserName: {
    fontFamily: 'nunito-semibold',
    fontSize: 14,
    letterSpacing: 0.2,
    color: COLORS.subtitle,
  },
  innerContainer: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    letterSpacing: 0.2,
    color: COLORS.subtitle,
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 0,
    overflow: 'hidden',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 19,
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'nunito-semibold',
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(85, 176, 134, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  modalButtonTextCancel: {
    color: COLORS.text,
  },
  modalButtonTextConfirm: {
    color: COLORS.buttonText,
  },
  legalModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  legalModalTitle: {
    fontSize: 20,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  legalModalCloseButton: {
    padding: 4,
  },
  legalModalContent: {
    padding: 20,
  },
  legalModalContentContainer: {
    paddingBottom: 48,
  },
  legalModalText: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
    lineHeight: 24,
  },
  savedPlacesModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
  },
  savedPlacesList: {
    padding: 20,
  },
  savedPlaceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  savedPlaceInfo: {
    flex: 1,
    marginRight: 16,
  },
  savedPlaceName: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  savedPlaceAddress: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
  },
  savedPlaceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  savedPlaceActionButton: {
    padding: 8,
  },
  addPlaceModalContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
  },
  addPlaceForm: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  mapContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapHint: {
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
    backgroundColor: COLORS.backgroundWrapper,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.buttonText,
  },
  disabledButton: {
    opacity: 0.5,
  },
  selectedLanguage: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
  },
  languageOptions: {
    width: '100%',
    marginBottom: 24,
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(85, 176, 134, 0.1)',
  },
  languageOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-semibold',
    color: COLORS.text,
  },
  selectedLanguageOptionText: {
    color: COLORS.primary,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
