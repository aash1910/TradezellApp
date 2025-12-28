import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, TextInput, Alert, FlatList, ScrollView } from 'react-native';
import { router } from 'expo-router';
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
import { LocationIcon } from '@/components/icons/LocationIcon';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
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
  nationality?: string;
  gender?: string;
  latitude?: number;
  longitude?: number;
}

const PickerColumn = ({ items, selectedValue, onValueChange, width = 100 }: {
  items: (string | number)[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  width?: number;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const index = items.findIndex(
      (item, idx) => (typeof item === 'number' ? item : idx) === selectedValue
    );
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ y: index * 48, animated: true });
    }
  }, [selectedValue, items.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.pickerColumn, { width }]}
      showsVerticalScrollIndicator={false}
      snapToInterval={40}
      decelerationRate="fast"
    >
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.pickerItem,
            selectedValue === (typeof item === 'number' ? item : index) && styles.pickerItemSelected
          ]}
          onPress={() => onValueChange(typeof item === 'number' ? item : index)}
        >
          <Text style={[
            styles.pickerItemText,
            selectedValue === (typeof item === 'number' ? item : index) && styles.pickerItemTextSelected
          ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Custom Date Picker Component
const CustomDatePicker = ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => {
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i).reverse();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleDateChange = () => {
    const newDate = new Date(Date.UTC(selectedYear, selectedMonth, selectedDay));
    onChange(newDate);
  };

  const handleValueChange = (type: 'year' | 'month' | 'day', value: number) => {
    if (type === 'year') {
      setSelectedYear(value);
    } else if (type === 'month') {
      setSelectedMonth(value);
    } else if (type === 'day') {
      setSelectedDay(value);
    }
  };

  return (
    <>
      <View style={styles.customDatePicker}>
        <View style={styles.pickerColumnContainer}>
          <Text style={styles.pickerColumnLabel}>Day</Text>
          <PickerColumn
            items={days}
            selectedValue={selectedDay}
            onValueChange={(value) => handleValueChange('day', value)}
            width={80}
          />
        </View>
        <View style={styles.pickerColumnContainer}>
          <Text style={styles.pickerColumnLabel}>Month</Text>
          <PickerColumn
            items={months}
            selectedValue={selectedMonth}
            onValueChange={(value) => handleValueChange('month', value)}
            width={130}
          />
        </View>
        <View style={styles.pickerColumnContainer}>
          <Text style={styles.pickerColumnLabel}>Year</Text>
          <PickerColumn
            items={years}
            selectedValue={selectedYear}
            onValueChange={(value) => handleValueChange('year', value)}
            width={90}
          />
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDateChange()} style={styles.modalButton}>
        <Text style={styles.modalButtonText}>Done</Text>
      </TouchableOpacity>
    </>
  );
};

export default function UpdateProfileScreen() {
  const insets = useSafeAreaInsets();
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
  const [isNationalityModalVisible, setIsNationalityModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [nationalitySearchQuery, setNationalitySearchQuery] = useState('');
  const [genderSearchQuery, setGenderSearchQuery] = useState('');
  const [filteredNationalities, setFilteredNationalities] = useState<{label: string; value: string}[]>([]);
  const [filteredGenders, setFilteredGenders] = useState<{label: string; value: string}[]>([]);
  
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

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
    setShowDateModal(false);
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
          // Only set gender if it exists, otherwise leave it empty
          if (user.gender) {
            setGender(user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other');
          } else {
            setGender('');
          }
          // Only set nationality if it exists
          setNationality(user.nationality || '');
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

  const getNationalityItems = () => {
    return [
      { label: 'Select Nationality', value: '' },
      ...COUNTRIES.map(country => ({ label: country, value: country }))
    ];
  };

  const getGenderItems = () => {
    return [
      { label: 'Select Gender', value: '' },
      ...GENDERS.map(gender => ({ label: gender, value: gender }))
    ];
  };

  const handleNationalitySearch = (text: string) => {
    setNationalitySearchQuery(text);
    if (text.trim() === '') {
      setFilteredNationalities(getNationalityItems());
    } else {
      const filtered = getNationalityItems().filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNationalities(filtered);
    }
  };

  const handleGenderSearch = (text: string) => {
    setGenderSearchQuery(text);
    if (text.trim() === '') {
      setFilteredGenders(getGenderItems());
    } else {
      const filtered = getGenderItems().filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredGenders(filtered);
    }
  };

  const openNationalityModal = () => {
    setIsNationalityModalVisible(true);
    setNationalitySearchQuery('');
    setFilteredNationalities(getNationalityItems());
  };

  const openGenderModal = () => {
    setIsGenderModalVisible(true);
    setGenderSearchQuery('');
    setFilteredGenders(getGenderItems());
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
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
          Alert.alert(
            'Upload Failed', 
            'Failed to upload profile image. Please try uploading again.',
            [{ text: 'OK' }]
          );
        } finally {
            setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(
        'Error', 
        'Failed to take picture. Please try uploading again.',
        [{ text: 'OK' }]
      );
      setShowImageOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
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
          Alert.alert(
            'Upload Failed', 
            'Failed to upload profile image. Please try uploading again.',
            [{ text: 'OK' }]
          );
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error', 
        'Failed to pick image. Please try uploading again.',
        [{ text: 'OK' }]
      );
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
      };

      // Only include nationality and gender if they are provided
      if (nationality) {
        userData.nationality = nationality;
      }
      if (gender) {
        userData.gender = gender.toLowerCase();
      }

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
    <>
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
                <View style={[styles.toggleContainer, { paddingBottom: Math.max(insets.bottom, 30) }]}>
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
                <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity 
                      onPress={() => setShowDateModal(false)} 
                      style={styles.modalCloseButton}
                    >
                      <Text style={styles.modalCloseButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <CustomDatePicker
                    value={date || new Date()}
                    onChange={handleDateChange}
                  />
                </View>
              </View>
            </Modal>
          </View>

          <Text style={styles.label}>{t('updateProfile.nationality')}</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={openNationalityModal}
          >
            <Text style={[styles.input, !nationality && { color: '#999' }]}>
              {nationality || t('updateProfile.nationality')}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.label}>{t('updateProfile.gender')}</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={openGenderModal}
          >
            <Text style={[styles.input, !gender && { color: '#999' }]}>
              {gender || t('updateProfile.gender')}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          {/* Nationality Modal */}
          <Modal
            visible={isNationalityModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsNationalityModalVisible(false)}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalOverlay}
            >
              <View style={[styles.searchModalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.searchModalHeader}>
                  <Text style={styles.searchModalTitle}>{t('updateProfile.nationality')}</Text>
                  <TouchableOpacity onPress={() => setIsNationalityModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search nationalities"
                  value={nationalitySearchQuery}
                  onChangeText={handleNationalitySearch}
                  autoFocus={false}
                />
                
                <FlatList
                  data={filteredNationalities}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => {
                        setNationality(item.value);
                        setIsNationalityModalVisible(false);
                      }}
                    >
                      <Text style={styles.listItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.flatList}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Gender Modal */}
          <Modal
            visible={isGenderModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsGenderModalVisible(false)}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalOverlay}
            >
              <View style={[styles.searchModalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.searchModalHeader}>
                  <Text style={styles.searchModalTitle}>{t('updateProfile.gender')}</Text>
                  <TouchableOpacity onPress={() => setIsGenderModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search gender"
                  value={genderSearchQuery}
                  onChangeText={handleGenderSearch}
                  autoFocus={false}
                />
                
                <FlatList
                  data={filteredGenders}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => {
                        setGender(item.value);
                        setIsGenderModalVisible(false);
                      }}
                    >
                      <Text style={styles.listItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.flatList}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </KeyboardAvoidingView>
          </Modal>

        </View>
        {isKeyboardVisible && (
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
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
        )}
      </Animated.ScrollView>

      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.imageModalContainer}>
          <View style={[styles.imageModalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
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
    </KeyboardAvoidingView>
    {!isKeyboardVisible && (
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
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
    )}
    </>
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
    paddingBottom: 24 + (Platform.OS === 'android' ? 24 : 0),
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary || '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary || '#007bff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  picker: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
    minHeight: 300,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  searchModalTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.subtitle,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    fontSize: 16,
    fontFamily: 'nunito-medium',
    color: COLORS.text,
  },
  flatList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'nunito-medium',
    color: COLORS.text,
  },
  disabledButton: {
    opacity: 0.7,
  },
  customDatePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 240,
  },
  pickerColumn: {
    height: 200,
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary || '#007bff',
    borderRadius: 12,
    shadowColor: COLORS.primary || '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 17,
  },
  pickerColumnContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: 0.5,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
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
