import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet, StatusBar,KeyboardAvoidingView, Platform, Modal, Keyboard, ActivityIndicator, Pressable, Dimensions, Alert } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import CountryPicker, { Country, getCallingCode } from 'react-native-country-picker-modal';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { authService } from '@/services/auth.service';
import { parsePhoneNumber } from 'libphonenumber-js';
import api from '@/services/api';
import { packageService } from '@/services/package.service';
import { Package } from '@/services/packageList.service';
import { useTranslation } from 'react-i18next';

import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BellIcon } from '@/components/icons/BellIcon';
import { UserRoundedIcon } from '@/components/icons/UserRoundedIcon';
import { SelectDownArrowIcon } from '@/components/icons/SelectDownArrowIcon';
import { WeightIcon } from '@/components/icons/WeightIcon';
import { MoneyIcon } from '@/components/icons/MoneyIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { TimeIcon } from '@/components/icons/TimeIcon';
import { InfoCircleIcon } from '@/components/icons/InfoCircleIcon';
import { SquareArrowUpIcon } from '@/components/icons/SquareArrowUpIcon';
import { SquareArrowDownIcon } from '@/components/icons/SquareArrowDownIcon';

const HEADER_HEIGHT = 375;
const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#919191',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
  inputBorder: '#EEEEEE',
  iconBackground: '#F0F0F0',
  facebook: '#1877F2',
  google: '#DB4437',
};

interface RouteParams {
  path: string;
  params?: {
    packageData?: string;
  };
}

export default function PackageEditScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [country, setCountry] = useState<Country | null>(null);
  const [withCallingCode, setWithCallingCode] = useState(true);
  const [senderProfileImage, setSenderProfileImage] = useState(require('@/assets/img/profile-blank.png'));
  const [name, setName] = useState(''); 
  const [countryCode, setCountryCode] = useState<Country['cca2']>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [locationDropOff, setLocationDropOff] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDropOffVisible, setModalDropOffVisible] = useState(false);
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(null);
  const [markerDropOff, setMarkerDropOff] = useState<{latitude: number; longitude: number} | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [regionDropOff, setRegionDropOff] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('map');
  const [details, setDetails] = useState('');
  const [detailsDropOff, setDetailsDropOff] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [nameDropOff, setNameDropOff] = useState('');
  const [phoneDropOff, setPhoneDropOff] = useState('');
  const [countryCodeDropOff, setCountryCodeDropOff] = useState<Country['cca2']>('US');
  const [callingCodeDropOff, setCallingCodeDropOff] = useState('1');
  const [countryDropOff, setCountryDropOff] = useState<Country | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) setDate(selectedDate);
    if (Platform.OS !== 'ios') setShowDateModal(false);
  };

  const handleTimeChange = (event: any, selectedTime: any) => {
    if (selectedTime) setTime(selectedTime);
    if (Platform.OS !== 'ios') setShowTimeModal(false);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (t: Date) =>
    t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setCountry(country);
  };

  const onSelectDropOff = (country: Country) => {
    setCountryCodeDropOff(country.cca2);
    setCallingCodeDropOff(country.callingCode[0]);
    setCountryDropOff(country);
  };

  const [activeTab, setActiveTab] = useState('pickup');
  const translateX = useSharedValue(0);

  const switchTab = (tab: 'pickup' | 'dropoff') => {
    setActiveTab(tab);
    translateX.value = withTiming(tab === 'pickup' ? 0 : -screenWidth, { duration: 250 });
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const { latitude, longitude } = currentLocation.coords;
        const initialRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(initialRegion);
        setRegionDropOff(initialRegion);
        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        alert('Error getting location. Please try again.');
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert(
        t('common.error'),
        error,
        [
          { text: t('common.ok'), onPress: () => setError(null) }
        ],
        { cancelable: false }
      );
    }
  }, [error]);

  useEffect(() => {
    const loadPackageData = () => {
      try {
        // Get package data from route params
        if (params.packageData) {
          const packageData = JSON.parse(params.packageData as string) as Package;
          
          // Update all state variables with package data
          setName(packageData.pickup.name || '');
          if (packageData.sender.image) {
            const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
            setSenderProfileImage(packageData.sender.image ? {uri: `${baseURLWithoutApi}/${packageData.sender.image}`} : require('@/assets/img/profile-blank.png'));
          }
          // Set phone and country code from mobile if available
          if (packageData.pickup.mobile) {
            const phoneNumber = parsePhoneNumber(packageData.pickup.mobile);

            if (phoneNumber && phoneNumber.isValid()) {
              const cca2 = phoneNumber.country; // e.g., "US"
              const callCode = phoneNumber.countryCallingCode; // e.g., "1"
              const nationalNumber = phoneNumber.nationalNumber; // e.g., "2025550123"

              setCountryCode(cca2 as Country['cca2']);
              setCallingCode(callCode as string);
              setPhone(nationalNumber as string);
            } else {
              console.warn('Invalid phone number:', packageData.pickup.mobile);
            }
          }
          setLocation(packageData.pickup.address || '');
          setDetails(packageData.pickup.details || '');
          setWeight(packageData.weight?.toString() || '');
          setPrice(packageData.price?.toString() || '');
          
          // Set pickup date and time
          if (packageData.pickup.date && packageData.pickup.time) {
            setDate(new Date(packageData.pickup.date));
            if (packageData.pickup.time && typeof packageData.pickup.time === 'string') {
              const [hours, minutes] = packageData.pickup.time.split(':');
              const timeDate = new Date();
              timeDate.setHours(parseInt(hours), parseInt(minutes));
              setTime(timeDate);
            }
          }

          // Set pickup coordinates
          if (packageData.pickup.coordinates?.lat && packageData.pickup.coordinates?.lng) {
            const pickupCoords = {
              latitude: parseFloat(packageData.pickup.coordinates.lat),
              longitude: parseFloat(packageData.pickup.coordinates.lng)
            };
            setMarker(pickupCoords);
            setRegion({
              ...pickupCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            });
          }

          // Set drop-off information
          setNameDropOff(packageData.drop.name || '');
          if (packageData.drop.mobile) {
            const phoneNumber = parsePhoneNumber(packageData.drop.mobile);

            if (phoneNumber && phoneNumber.isValid()) {
              const cca2 = phoneNumber.country; // e.g., "US"
              const callCode = phoneNumber.countryCallingCode; // e.g., "1"
              const nationalNumber = phoneNumber.nationalNumber; // e.g., "2025550123"

              setCountryCodeDropOff(cca2 as Country['cca2']);
              setCallingCodeDropOff(callCode as string);
              setPhoneDropOff(nationalNumber as string);
            } else {
              console.warn('Invalid phone number:', packageData.drop.mobile);
            }
          }
          setLocationDropOff(packageData.drop.address || '');
          setDetailsDropOff(packageData.drop.details || '');

          // Set drop-off coordinates
          if (packageData.drop.coordinates?.lat && packageData.drop.coordinates?.lng) {
            const dropCoords = {
              latitude: parseFloat(packageData.drop.coordinates.lat),
              longitude: parseFloat(packageData.drop.coordinates.lng)
            };
            setMarkerDropOff(dropCoords);
            setRegionDropOff({
              ...dropCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            });
          }

          switchTab('pickup');
          // translate to top of the screen
          scrollRef.current?.scrollTo({ y: 0, animated: true });

        }
      } catch (error) {
        console.error('Error loading package data:', error);
        Alert.alert('Error', 'Failed to load package data');
      }
    };

    loadPackageData();
  }, [params.packageData]);

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
        setLocation(address);
      } else {
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const handleMapPressDropOff = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerDropOff(coords);

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
        console.log("parts", parts);
        const uniqueParts = Array.from(new Set(parts.filter(Boolean)));
        const address = uniqueParts.join(', ');        
        setLocationDropOff(address);
      } else {
        setLocationDropOff(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setLocationDropOff(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const handleReturnKey = () => {
    Keyboard.dismiss();
  };

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Collect all validation errors
      const validationErrors = [];

      if (!name.trim()) {
        validationErrors.push(t('packageForm.validation.pickupNameRequired'));
      }

      // Validate pickup phone number
      var pickup_mobile = `+${callingCode}${phone.trim()}`;
      if (!phone.trim()) {
        validationErrors.push(t('packageForm.validation.pickupPhoneRequired'));
      } else {
        try {
          const pickupPhoneNumber = parsePhoneNumber(pickup_mobile);
          if (!pickupPhoneNumber || !pickupPhoneNumber.isValid()) {
            validationErrors.push(t('packageForm.validation.invalidPickupPhone'));
          }
          else{
            pickup_mobile = pickupPhoneNumber.number;
          }
        } catch (error) {
          validationErrors.push(t('packageForm.validation.invalidPickupPhone'));
        }
      }

      if (!location.trim()) {
        validationErrors.push(t('packageForm.validation.pickupLocationRequired'));
      }

      if (!weight){
        validationErrors.push(t('packageForm.validation.weightRequired'));
      }
      else if (isNaN(parseFloat(weight)) || parseFloat(weight) < 0.01) {
        validationErrors.push(t('packageForm.validation.invalidWeight'));
      }

      if (!price){
        validationErrors.push(t('packageForm.validation.priceRequired'));
      }
      else if (isNaN(parseFloat(price)) || parseFloat(price) < 0.01) {
        validationErrors.push(t('packageForm.validation.invalidPrice'));
      }

      // Validate pickup date is today or future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pickupDate = new Date(date);
      pickupDate.setHours(0, 0, 0, 0);
      if (pickupDate < today) {
        validationErrors.push(t('packageForm.validation.invalidDate'));
      }

      if (!nameDropOff.trim()) {
        validationErrors.push(t('packageForm.validation.receiverNameRequired'));
      }

      // Validate drop-off phone number
      var dropOff_mobile = `+${callingCodeDropOff}${phoneDropOff.trim()}`;
      if (!phoneDropOff.trim()) {
        validationErrors.push(t('packageForm.validation.receiverPhoneRequired'));
      } else {
        try {
          const dropOffPhoneNumber = parsePhoneNumber(dropOff_mobile);
          if (!dropOffPhoneNumber || !dropOffPhoneNumber.isValid()) {
            validationErrors.push(t('packageForm.validation.invalidReceiverPhone'));
          }
          else{
            dropOff_mobile = dropOffPhoneNumber.number;
          }
        } catch (error) {
          validationErrors.push(t('packageForm.validation.invalidReceiverPhone'));
        }
      }

      if (!locationDropOff.trim()) {
        validationErrors.push(t('packageForm.validation.receiverLocationRequired'));
      }

      // If there are validation errors, show them all
      if (validationErrors.length > 0) {
        setError(t('packageForm.validation.fixErrors') + '\n\n• ' + validationErrors.join('\n• '));
        return;
      }

      // Format date and time using local time
      const formattedDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      const packageData = {
        pickup_name: name.trim(),
        pickup_mobile: pickup_mobile,
        pickup_address: location.trim(),
        pickup_details: details.trim(),
        weight: parseFloat(weight),
        price: parseFloat(price),
        pickup_date: formattedDate,
        pickup_time: formattedTime,
        drop_name: nameDropOff.trim(),
        drop_mobile: dropOff_mobile,
        drop_address: locationDropOff.trim(),
        drop_details: detailsDropOff.trim(),
        pickup_lat: marker?.latitude,
        pickup_lng: marker?.longitude,
        drop_lat: markerDropOff?.latitude,
        drop_lng: markerDropOff?.longitude,
      };

      // Check if we're updating or creating
      let response;
      
      if (params.packageData) {
        const existingPackage = JSON.parse(params.packageData as string);
        response = await packageService.updatePackage(existingPackage.id, packageData);
        Alert.alert(t('common.success'), t('packageForm.updateSuccess'));
      } else {
        response = await packageService.createPackage(packageData);
        Alert.alert(t('common.success'), t('packageForm.createSuccess'));
      }

      router.push({
        pathname: '/(tabs)/orderDetail',
        params: { orderData: JSON.stringify(response.data) }
      });

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('packageForm.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace the Post Job button in both tabs with this new version
  const submitButton = (
    <TouchableOpacity 
      style={[
        styles.loginButton, 
        {marginTop: 35, marginBottom: activeTab === 'pickup' ? 90 : 27},
        isSubmitting && styles.disabledButton
      ]} 
      onPress={() => handleSubmit()}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <ActivityIndicator color={COLORS.buttonText} />
      ) : (
        <Text style={styles.loginText}>{t('packageForm.updateJob')}</Text>
      )}
    </TouchableOpacity>
  );

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
        <Animated.View style={[styles.header]}>
          {/* Toggle Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'pickup' && styles.activeButton]}
              onPress={() => switchTab('pickup')}
            >
              <SquareArrowUpIcon size={20} color={COLORS.background} />
              <Text style={styles.tabText}>
                {t('packageForm.pickupDetails')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'dropoff' && styles.activeButton]}
              onPress={() => switchTab('dropoff')}
            >
              <SquareArrowDownIcon size={20} color={COLORS.background} />
              <Text style={styles.tabText}>
                {t('packageForm.dropoffDetails')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.form}>
          {/* Sliding Content */}
          <View style={styles.sliderContainer}>
            <Animated.View style={[styles.animatedView, animatedStyles]}>
              <View style={styles.tabContent}>

                <View style={styles.senderProfileContainer}> 
                  <View style={styles.senderProfileImageContainer}>
                    <Image source={senderProfileImage} style={styles.senderProfileImage} />
                  </View>
                  <View style={styles.senderProfileTextContainer}> 
                    <Text style={styles.title}>{name || t('packageForm.sender')}</Text>
                    <Text style={styles.subtitle}>{t('packageForm.sender')}</Text>
                  </View>
                </View>
                
                <Text style={styles.label}>{t('packageForm.name')}</Text>
                <View style={styles.inputContainer}>
                  <UserRoundedIcon size={20} color={COLORS.text} />
                  <TextInput 
                    placeholder={t('packageForm.name')} 
                    value={name}  
                    onChangeText={setName} 
                    style={styles.input} 
                    textContentType="name" 
                    autoCapitalize="words" 
                    clearButtonMode="always" 
                    selectionColor={COLORS.primary} 
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey}
                    />
                </View>

                <Text style={styles.label}>{t('packageForm.number')}</Text>
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
                    placeholder={t('packageForm.number')}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    textContentType="telephoneNumber"
                    selectionColor={COLORS.primary}
                    clearButtonMode="always"
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey}
                  />
                </View>
              
                <View style={styles.rowContainer}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>{t('packageForm.weight')}</Text>
                    <View style={styles.inputContainer}>
                      <WeightIcon size={20} color={COLORS.text} /> 
                      <TextInput 
                        placeholder={t('packageForm.weight')} 
                        value={weight} 
                        onChangeText={setWeight} 
                        style={styles.input} 
                        keyboardType="numeric" 
                        returnKeyType="done" 
                        onSubmitEditing={handleReturnKey} />
                    </View>
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>{t('packageForm.price')}</Text>
                    <View style={styles.inputContainer}>
                      <MoneyIcon size={20} color={COLORS.text} />
                      <TextInput 
                        placeholder={t('packageForm.price')} 
                        value={price} 
                        onChangeText={setPrice} 
                        style={styles.input} 
                        keyboardType="numeric" 
                        returnKeyType="done" 
                        onSubmitEditing={handleReturnKey}
                        editable={false} />
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>{t('packageForm.location')}</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <LocationIcon size={20} color={COLORS.text} /> 
                  </TouchableOpacity>
                  <TextInput 
                    placeholder={t('packageForm.location')} 
                    value={location} 
                    onChangeText={setLocation} 
                    style={styles.input} 
                    editable={false}
                    onPress={() => setModalVisible(true)}
                  />

                  <Modal visible={modalVisible} animationType="slide">
                    <View style={{ flex: 1 }}>
                      {/* Map View */}
                      {mode === 'map' && (
                        <>
                          <MapView
                            key="pickup-map"
                            style={{ flex: 1 }}
                            region={region || {
                              latitude: 0,
                              longitude: 0,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }}
                            onPress={handleMapPress}
                            onLayout={() => {
                              if (marker) {
                                setRegion({
                                  latitude: marker.latitude,
                                  longitude: marker.longitude,
                                  latitudeDelta: 0.01,
                                  longitudeDelta: 0.01,
                                });
                              }
                            }}
                          >
                            {marker && (
                              <Marker 
                                coordinate={marker}
                              />
                            )}
                          </MapView>
                          <Text style={styles.mapHint}>{t('packageForm.mapHint')}</Text>
                        </>
                      )}

                      {/* Manual Entry */}
                      {mode === 'manual' && (
                        <View style={styles.manualContainer}>
                          <TextInput
                            placeholder={t('packageForm.location')}
                            value={location}
                            onChangeText={setLocation}
                            style={styles.manualInput}
                            multiline
                            autoCapitalize="words"
                            autoComplete="off"
                            clearButtonMode="always"
                            textContentType="fullStreetAddress"
                            selectionColor={COLORS.primary}
                            returnKeyType="done"
                            blurOnSubmit={true}
                            onSubmitEditing={handleReturnKey}
                          />
                        </View>
                      )}
                      {/* Mode switch buttons */}
                      <View style={styles.toggleContainer}>
                        <TouchableOpacity
                          style={[styles.toggleButton, mode === 'map' && styles.activeToggle]}
                          onPress={() => setMode('map')}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.pickFromMap')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.toggleButton, mode === 'manual' && styles.activeToggle]}
                          onPress={() => setMode('manual')}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.enterManually')}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.footer}>
                        <TouchableOpacity style={[styles.toggleButton, {backgroundColor: COLORS.primary, width: 220, alignSelf: 'center'}]} 
                          onPress={() => setModalVisible(false)}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.useThisAddress')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>

                <Text style={styles.label}>{t('packageForm.moreDetails')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput 
                    placeholder={t('packageForm.moreDetails')} 
                    value={details} 
                    onChangeText={setDetails} 
                    style={styles.input} 
                    clearButtonMode="always"
                    selectionColor={COLORS.primary}
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey}
                  />
                </View>

                <Text style={styles.label}>{t('packageForm.pickupDateAndTime')}</Text>
                <View style={styles.rowContainer}>
                  <View style={styles.rowItem}>
                    <Pressable onPress={() => setShowDateModal(true)} style={styles.inputContainer}>
                      <CalendarIcon size={20} color={COLORS.text} /> 
                      <Text style={styles.input}>{formatDate(date) || 'Select Date'}</Text>
                    </Pressable>
                  </View>
                  <View style={styles.rowItem}>
                    <Pressable onPress={() => setShowTimeModal(true)} style={styles.inputContainer}>
                      <TimeIcon size={20} color={COLORS.text} />
                      <Text style={styles.input}>{formatTime(time) || 'Select Time'}</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.infoContainer}>
                  <InfoCircleIcon size={14} color={COLORS.text} />
                  <Text style={styles.infoText}>{t('packageForm.timeZoneInfo')}</Text>
                </View>

                {/* Date Modal */}
                <Modal visible={showDateModal} transparent animationType="slide">
                  <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                        onChange={handleDateChange}
                        style={styles.picker}
                      />
                      <TouchableOpacity onPress={() => setShowDateModal(false)} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {/* Time Modal */}
                <Modal visible={showTimeModal} transparent animationType="slide">
                  <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                      <DateTimePicker
                        value={time}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                        style={styles.picker}
                      />
                      <TouchableOpacity onPress={() => setShowTimeModal(false)} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                {submitButton}

              </View>
              <View style={styles.tabContent}>

                <View style={styles.senderProfileContainer}> 
                  <View style={styles.senderProfileImageContainer}>
                    <Image source={require('@/assets/img/profile-blank.png')} style={styles.senderProfileImage} />
                  </View>
                  <View style={styles.senderProfileTextContainer}> 
                    <Text style={styles.title}>{nameDropOff || t('packageForm.receiver')}</Text>
                    <Text style={styles.subtitle}>{t('packageForm.receiver')}</Text>
                  </View>
                  <Text style={styles.dropOffText}>{t('packageForm.dropoff')}</Text>
                </View>

                <Text style={styles.label}>{t('packageForm.name')}</Text>
                <View style={styles.inputContainer}>
                  <UserRoundedIcon size={20} color={COLORS.text} />
                  <TextInput 
                    placeholder={t('packageForm.name')} 
                    value={nameDropOff} 
                    onChangeText={setNameDropOff} 
                    style={styles.input} 
                    textContentType="name" 
                    autoCapitalize="words" 
                    clearButtonMode="always"
                    selectionColor={COLORS.primary}
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey} 
                    />
                </View>

                <Text style={styles.label}>{t('packageForm.number')}</Text>
                <View style={styles.inputContainer}>
                  <CountryPicker
                    countryCode={countryCodeDropOff as Country["cca2"]}
                    withFilter
                    withFlag
                    withCallingCode
                    withAlphaFilter
                    withCallingCodeButton
                    withModal
                    onSelect={onSelectDropOff}
                  />
                  <SelectDownArrowIcon size={16} color={COLORS.text} /> 
                  <TextInput
                    style={styles.input}
                    placeholder={t('packageForm.number')}
                    keyboardType="phone-pad"
                    value={phoneDropOff}
                    onChangeText={setPhoneDropOff}
                    textContentType="telephoneNumber"
                    selectionColor={COLORS.primary}
                    clearButtonMode="always"
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey}
                  />
                </View>

                <Text style={styles.label}>{t('packageForm.location')}</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity onPress={() => setModalDropOffVisible(true)}>
                    <LocationIcon size={20} color={COLORS.text} /> 
                  </TouchableOpacity>
                  <TextInput 
                    placeholder={t('packageForm.location')} 
                    value={locationDropOff} 
                    onChangeText={setLocationDropOff} 
                    style={styles.input} 
                    editable={false}
                    onPress={() => setModalDropOffVisible(true)}
                  />

                  <Modal visible={modalDropOffVisible} animationType="slide">
                    <View style={{ flex: 1 }}>
                      {/* Map View */}
                      {mode === 'map' && (
                        <>
                          {regionDropOff && (
                            <>
                              <MapView
                                key="dropoff-map"
                                style={{ flex: 1 }}
                                region={regionDropOff}
                                onPress={handleMapPressDropOff}
                                onLayout={() => {
                                  if (markerDropOff) {
                                    setRegionDropOff({
                                      latitude: markerDropOff.latitude,
                                      longitude: markerDropOff.longitude,
                                      latitudeDelta: 0.01,
                                      longitudeDelta: 0.01,
                                    });
                                  }
                                }}
                              >
                                {markerDropOff && <Marker coordinate={markerDropOff} />}
                              </MapView>
                              <Text style={styles.mapHint}>{t('packageForm.mapHint')}</Text>
                            </>
                          )}
                        </>
                      )}

                      {/* Manual Entry */}
                      {mode === 'manual' && (
                        <View style={styles.manualContainer}>
                          <TextInput
                            placeholder={t('packageForm.location')}
                            value={locationDropOff}
                            onChangeText={setLocationDropOff}
                            style={styles.manualInput}
                            multiline
                            autoCapitalize="words"
                            autoComplete="off"
                            clearButtonMode="always"
                            textContentType="fullStreetAddress"
                            selectionColor={COLORS.primary}
                            returnKeyType="done"
                            blurOnSubmit={true}
                            onSubmitEditing={handleReturnKey}
                          />
                        </View>
                      )}
                      {/* Mode switch buttons */}
                      <View style={styles.toggleContainer}>
                        <TouchableOpacity
                          style={[styles.toggleButton, mode === 'map' && styles.activeToggle]}
                          onPress={() => setMode('map')}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.pickFromMap')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.toggleButton, mode === 'manual' && styles.activeToggle]}
                          onPress={() => setMode('manual')}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.enterManually')}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.footer}>
                        <TouchableOpacity style={[styles.toggleButton, {backgroundColor: COLORS.primary, width: 220, alignSelf: 'center'}]} 
                          onPress={() => setModalDropOffVisible(false)}
                        >
                          <Text style={styles.toggleText}>{t('packageForm.useThisAddress')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>

                <Text style={styles.label}>{t('packageForm.moreDetails')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput 
                    placeholder={t('packageForm.moreDetails')} 
                    value={detailsDropOff} 
                    onChangeText={setDetailsDropOff} 
                    style={styles.input} 
                    clearButtonMode="always"
                    selectionColor={COLORS.primary}
                    returnKeyType="done"
                    onSubmitEditing={handleReturnKey}
                  />
                </View>

                {submitButton}

              </View>
            </Animated.View>
          </View>

        </View>
      </Animated.ScrollView>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderRadius: 24,
    //height: HEADER_HEIGHT,
  },
  headerTopContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  logo: {
    width: 38,
    height: 41,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
  },
  bellIcon: {
    marginLeft: 12,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'nunito-medium',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  senderProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  senderProfileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  senderProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  senderProfileTextContainer: {
    marginLeft: 14,
  },
  form: {
    flex: 1,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  title: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    letterSpacing: 0.2,
    marginBottom: 0,
  },
  dropOffText: {
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    letterSpacing: 0.2,
    marginLeft: 'auto',
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
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
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
    alignSelf: 'center',
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
    backgroundColor: COLORS.backgroundWrapper,
  },
  manualInput: {
    height: 120,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },
  footer: {
    padding: 10,
    marginBottom: 10,
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'nunito-medium',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
    marginTop: 24,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 12,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: '#000',
  },
  tabText: {
    color: COLORS.background,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  sliderContainer: {
    width: '100%',
  },
  animatedView: {
    flexDirection: 'row',
    width: screenWidth * 2,
    gap: 32,
    overflow: 'hidden',
  },
  tabContent: {
    width: screenWidth - 32,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'nunito-medium',
  },
});

