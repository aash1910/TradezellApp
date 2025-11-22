import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CountryPicker, { Country, getCallingCode } from 'react-native-country-picker-modal';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { UserRoundedIcon } from '@/components/icons/UserRoundedIcon';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
import { LetterIcon } from '@/components/icons/LetterIcon';
import { ComplexGearIcon } from '@/components/icons/ComplexGearIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { SelectDownArrowIcon } from '@/components/icons/SelectDownArrowIcon';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { parsePhoneNumber } from 'libphonenumber-js';

const HEADER_HEIGHT = 156;
const { width, height } = Dimensions.get('window');

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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); 
  const [country, setCountry] = useState<Country | null>(null);
  const [withCallingCode, setWithCallingCode] = useState(true);
  const [senderProfileImage, setSenderProfileImage] = useState(require('@/assets/img/profile-blank.png'));
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [countryCode, setCountryCode] = useState<Country['cca2']>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [phone, setPhone] = useState('');
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

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
  }, []);

  const loadUserData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        // Set name by combining first_name and last_name
        setName(`${user.first_name} ${user.last_name}`);
        setEmail(user.email);
        setGender(user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other');

        if (user.image) {
          const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
          setSenderProfileImage(user.image ? {uri: `${baseURLWithoutApi}/${user.image}`} : require('@/assets/img/profile-blank.png'));
        }
        
        // Set phone and country code from mobile if available
        if (user.mobile) {
          const phoneNumber = parsePhoneNumber(user.mobile);

          if (phoneNumber && phoneNumber.isValid()) {
            const cca2 = phoneNumber.country; // e.g., "US"
            const callCode = phoneNumber.countryCallingCode; // e.g., "1"
            const nationalNumber = phoneNumber.nationalNumber; // e.g., "2025550123"

            setCountryCode(cca2 as Country['cca2']);
            setCallingCode(callCode as string);
            setPhone(nationalNumber as string);
          } else {
            console.warn('Invalid phone number:', user.mobile);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

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
          <Text style={styles.pageTitle}>{t('profile.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.profileInfoRow}>
            <TouchableOpacity style={styles.editProfile} onPress={() => router.push('/updateProfile')}>
              <EditIcon size={20} />
            </TouchableOpacity>
            {senderProfileImage ? (  
              <Image source={senderProfileImage} style={styles.profileImage} />
            ) : (
              <Image source={require('@/assets/img/profile-blank.png')} style={styles.profileImage} />
            )}
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileUserName}>{email}</Text>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('profile.sections.fullName')}</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/updateProfile')}>
                <View style={styles.rowLeft}>
                  <UserRoundedIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{name}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('profile.sections.email')}</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/updateProfile')}>
                <View style={styles.rowLeft}>
                  <LetterIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{email}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('profile.sections.gender')}</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => router.push('/updateProfile')}>
                <View style={styles.rowLeft}>
                  <ComplexGearIcon size={20} color={COLORS.text} />
                  <Text style={styles.rowLabel}>{gender}</Text>
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {phone && (
          <View style={styles.innerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('profile.sections.mobile')}</Text>
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={[styles.row, {paddingVertical: 12}]} onPress={() => router.push('/updateProfile')}>
                <View style={styles.rowLeft}>
                  <CountryPicker
                    countryCode={countryCode as Country["cca2"]}
                    withFilter
                    withFlag
                    withCallingCode
                    withAlphaFilter
                    withCallingCodeButton
                    onSelect={() => {}}
                  />
                  <SelectDownArrowIcon size={16} color={COLORS.text} /> 
                  <TextInput
                    style={styles.input}
                    value={phone}
                    editable={false}
                  />
                </View>
                <RightArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          )}
        </View>
      </Animated.ScrollView>
      {!isKeyboardVisible && (
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.push('/updateProfile')}
          >
            <Text style={styles.continueButtonText}>{t('profile.actions.editInfo')}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  editProfile :{
    position: 'absolute',
    left: width/2 ,
    top: 45,
    zIndex: 1,
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
    color: COLORS.text,
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
  label: {
    marginTop: 18,
    fontFamily: 'nunito-bold',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 13,
    height: 54,
  },
  input: {
    marginLeft: 10,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    paddingVertical: 0,
    color: COLORS.text,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
