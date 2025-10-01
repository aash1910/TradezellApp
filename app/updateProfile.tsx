import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import CountryPicker, { Country, getCallingCode } from 'react-native-country-picker-modal';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { UserRoundedIcon } from '@/components/icons/UserRoundedIcon';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
import { LetterIcon } from '@/components/icons/LetterIcon';
import { ComplexGearIcon } from '@/components/icons/ComplexGearIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { SelectDownArrowIcon } from '@/components/icons/SelectDownArrowIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { CalendarIcon } from '@/components/icons/CalendarDateIcon';
import { SelectArrowIcon } from '@/components/icons/SelectArrowIcon';
import { COUNTRIES } from '@/components/countries';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { parsePhoneNumber } from 'libphonenumber-js';
import { uploadService } from '@/services/upload.service';
import { useTranslation } from 'react-i18next';

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

const GENDERS = [
  'Male',
  'Female',
  'Other'
];

interface UpdateUserData {
  first_name: string;
  last_name: string;
  mobile: string;
  address: string;
  date_of_birth: string | null;
  nationality: string;
  gender: string;
  latitude?: number;
  longitude?: number;
}

export default function UpdateProfileScreen() {
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<Country['cca2']>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<Country | null>(null);
  const [withCallingCode, setWithCallingCode] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [senderProfileImage, setSenderProfileImage] = useState(require('@/assets/img/profile-blank.png'));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'nationality' | 'gender'>('nationality');
  
  const [date, setDate] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [location, setLocation] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('map');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');

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

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setCountry(country);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) setDate(selectedDate);
    if (Platform.OS !== 'ios') setShowDateModal(false);
  };

  const formatDate = (d: Date | null): string => {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      if (region === null) {
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content'); 
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          // Set name by combining first_name and last_name
          setFirstName(user.first_name);
          setLastName(user.last_name);
          setEmail(user.email);
          setGender(user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other');
          setNationality(user.nationality);
          setDate(user.date_of_birth ? new Date(user.date_of_birth) : null);

          if (user.image) {
            setSenderProfileImage(user.image);
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

          if (user.address) {
            setLocation(user.address);
          }

          if (user.latitude && user.longitude) {
            setRegion({
              latitude: user.latitude as number,
              longitude: user.longitude as number,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setMarker({
              latitude: user.latitude as number,
              longitude: user.longitude as number,
            });
          }

        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
      }
    })();
  }, []);

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    //console.log(coords);
    //setMarker(coords);

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
        // Filter out null/undefined/empty strings and duplicates
        const uniqueParts = Array.from(new Set(parts.filter(Boolean)));
        const address = uniqueParts.join(', ');        
        setLocation(address);
        //console.log(address);
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        //console.log(region);
      } else {
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
      //setModalVisible(false);
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      //setModalVisible(false);
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

  // Add keyboard dismiss handler
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Add return key handler
  const handleReturnKey = () => {
    Keyboard.dismiss();
  };

  const openPicker = (type: 'nationality' | 'gender') => {
    setPickerType(type);
    setShowPicker(true);
  };

  const handlePickerChange = (value: string) => {
    if (pickerType === 'nationality') {
      setNationality(value);
    } else {
      setGender(value);
    }
  };

  const getPickerTitle = () => {
    return pickerType === 'nationality' ? 'Nationality' : 'Gender';
  };

  const getPickerItems = () => {
    const items = pickerType === 'nationality' ? COUNTRIES : GENDERS;
    return [
      { label: pickerType === 'nationality' ? 'Nationality' : 'Gender', value: '' },
      ...items.map(item => ({ label: item, value: item }))
    ];
  };

  const getSelectedValue = () => {
    return pickerType === 'nationality' ? nationality : gender;
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoading(true);
        try {
          // Compress image before upload
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'profile');
          console.log(response);
          if (response.data.image) {
            setSenderProfileImage(response.data.image);
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update profile image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      setShowImageOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoading(true);
        try {
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'profile');
          if (response.data.image) {
            setSenderProfileImage(response.data.image);
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update profile image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setShowImageOptions(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      // Validate phone number
      let mobile = phone ? `+${callingCode}${phone}` : '';
      if (mobile) {
        try {
          const phoneNumber = parsePhoneNumber(mobile);
          if (!phoneNumber || !phoneNumber.isValid()) {
            Alert.alert(t('updateProfile.validationError'), t('updateProfile.invalidPhone'));
            setIsLoading(false);
            return;
          }
          console.log(phoneNumber);
          mobile = phoneNumber.number as string;
        } catch (error) {
          Alert.alert(t('updateProfile.validationError'), t('updateProfile.invalidPhone'));
          setIsLoading(false);
          return;
        }
      }

      const userData: UpdateUserData = {
        first_name: firstName,
        last_name: lastName,
        mobile: mobile,
        address: location,
        date_of_birth: date && date instanceof Date ? date.toISOString().split('T')[0] : null,
        nationality: nationality,
        gender: gender.toLowerCase(),
      };

      if (marker) {
        userData.latitude = marker.latitude;
        userData.longitude = marker.longitude;
      }

      const response = await authService.updateUserProfile(userData);

      if (response) {
        Alert.alert(t('common.success'), t('updateProfile.success'));
        router.push('/(tabs)/account');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 422) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors)
          .flat()
          .join('\n');
        
        Alert.alert(
          t('updateProfile.validationError'),
          errorMessages,
          [{ text: t('common.ok'), style: 'default' }]
        );
      } else {
        // Handle other errors
        Alert.alert(
          t('common.error'),
          t('updateProfile.error'),
          [{ text: t('common.ok'), style: 'default' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('updateProfile.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.profileInfoRow}>
            <TouchableOpacity style={styles.editProfile} onPress={() => setShowImageOptions(true)}>
              <EditIcon size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileImage} onPress={() => setShowImageOptions(true)}>
              <Image source={{ uri: senderProfileImage ? `${baseURLWithoutApi}/${senderProfileImage}` : require('@/assets/img/profile-blank.png') }} style={styles.profileImage} />
            </TouchableOpacity>
            <Text style={styles.profileName}>{firstName} {lastName}</Text>
            <Text style={styles.profileUserName}>{email}</Text>
          </View>

          <Text style={styles.label}>{t('updateProfile.firstName')}</Text>
          <View style={styles.inputContainer}>
            <UserRoundedIcon size={20} color={COLORS.text} />
            <TextInput 
              placeholder={t('updateProfile.firstName')} 
              style={styles.input} 
              value={firstName} 
              onChangeText={setFirstName} 
              returnKeyType="done" 
              onSubmitEditing={handleReturnKey}
              textContentType="givenName"
              autoCapitalize="words"
              selectionColor={COLORS.primary}
              clearButtonMode="always"
            />
          </View>

          <Text style={styles.label}>{t('updateProfile.lastName')}</Text>
          <View style={styles.inputContainer}>
            <UserRoundedIcon size={20} color={COLORS.text} />
            <TextInput 
              placeholder={t('updateProfile.lastName')} 
              style={styles.input} 
              value={lastName} 
              onChangeText={setLastName} 
              returnKeyType="done" 
              onSubmitEditing={handleReturnKey}
              textContentType="familyName"
              autoCapitalize="words"
              selectionColor={COLORS.primary}
              clearButtonMode="always"
            />
          </View>

          <Text style={styles.label}>{t('updateProfile.mobile')}</Text>
          <View style={styles.inputContainer}>
            <CountryPicker
              countryCode={countryCode as Country["cca2"]}
              withFilter
              withFlag
              withCallingCode
              withAlphaFilter
              withCallingCodeButton
              withModal
              onSelect={onSelect}
            />
            <SelectDownArrowIcon size={16} color={COLORS.text} /> 
            <TextInput
              style={styles.input}
              placeholder={t('updateProfile.mobile')}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              returnKeyType="done"
              onSubmitEditing={handleReturnKey}
              textContentType="telephoneNumber"
              selectionColor={COLORS.primary}
              clearButtonMode="always"
            />
          </View>

          <Text style={styles.label}>{t('updateProfile.address')}</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <LocationIcon size={20} color={COLORS.text} /> 
            </TouchableOpacity>
            <TextInput 
              placeholder={t('updateProfile.address')} 
              value={location} 
              onChangeText={setLocation} 
              style={styles.input} 
              returnKeyType="done" 
              onSubmitEditing={handleReturnKey}
              textContentType="fullStreetAddress"
              selectionColor={COLORS.primary}
              clearButtonMode="always"
            />

            <Modal visible={modalVisible} animationType="slide">
              <View style={{ flex: 1 }}>
                {mode === 'map' && (
                  <>
                    {region && (
                      <>
                      <MapView
                        style={{ flex: 1 }}
                        region={region}
                        onPress={(e) => {
                          const coords = e.nativeEvent.coordinate;
                          setMarker(coords);
                        }}
                      >
                        {marker && <Marker coordinate={marker} />}
                      </MapView>
                      <Text style={styles.mapHint}>{t('updateProfile.mapHint')}</Text>
                      </>
                    )}
                  </>
                )}

                {mode === 'manual' && (
                  <View style={styles.manualContainer}>
                    <TextInput
                      placeholder={t('updateProfile.typeAddress')}
                      value={location}
                      onChangeText={setLocation}
                      style={styles.manualInput}
                      multiline
                      blurOnSubmit={true}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                        setModalVisible(false);
                      }}
                    />
                  </View>
                )}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleButton, mode === 'manual' && styles.activeToggle]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.toggleText}>{t('updateProfile.close')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, mode === 'map' && styles.activeToggle]}
                    onPress={() => {
                      if (marker) {
                        handleMapPress({ nativeEvent: { coordinate: marker } });
                      }
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.toggleText}>{t('updateProfile.done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <Text style={styles.label}>{t('updateProfile.dateOfBirth')}</Text>
          <View style={styles.rowContainer}>
            <View style={styles.rowItem}>
              <TouchableOpacity onPress={() => setShowDateModal(true)} style={styles.inputContainer}>
                <CalendarIcon size={20} color={COLORS.text} /> 
                <Text style={styles.input}>{formatDate(date) || t('updateProfile.dateOfBirth')}</Text>
              </TouchableOpacity>
            </View>

            <Modal visible={showDateModal} transparent animationType="slide">
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={handleDateChange}
                    style={styles.picker}
                  />
                  <TouchableOpacity onPress={() => setShowDateModal(false)} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>{t('updateProfile.done')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <Text style={styles.label}>{t('updateProfile.nationality')}</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => openPicker('nationality')}
          >
            <Text style={[styles.input, !nationality && { color: '#999' }]}>
              {nationality || t('updateProfile.nationality')}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.label}>{t('updateProfile.gender')}</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => openPicker('gender')}
          >
            <Text style={[styles.input, !gender && { color: '#999' }]}>
              {gender || t('updateProfile.gender')}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalPickerContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.cancelButton}>{t('updateProfile.cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.doneButton}>{t('updateProfile.done')}</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={getSelectedValue()}
                  onValueChange={handlePickerChange}
                  style={styles.modalPicker}
                >
                  {getPickerItems().map((item) => (
                    <Picker.Item key={item.label} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>

        </View>
      </Animated.ScrollView>

      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.imageModalContainer}>
          <View style={styles.imageModalContent}>
            <TouchableOpacity 
              style={styles.imageModalOption}
              onPress={pickImage}
            >
              <Text style={styles.imageModalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.imageModalOption}
              onPress={takePicture}
            >
              <Text style={styles.imageModalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.imageModalOption, styles.imageCancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.imageCancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? t('updateProfile.updating') : t('updateProfile.update')}
          </Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    marginLeft: 10,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    paddingVertical: 15,
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#f2f2f2',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapHint: {
    textAlign: 'center',
    padding: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    color: '#444',
  },
  manualContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  manualInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
  },
  rowItem: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary || '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
  },
  modalPickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  cancelButton: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontFamily: 'nunito-medium',
  },
  doneButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  modalPicker: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  disabledButton: {
    opacity: 0.7,
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageModalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  imageModalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  imageModalOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
    textAlign: 'center',
  },
  imageCancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  imageCancelOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: 'red',
    textAlign: 'center',
  },
});
