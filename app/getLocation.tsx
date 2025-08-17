import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, TextInput, Alert, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { SelectArrowIcon } from '@/components/icons/SelectArrowIcon';
import { COUNTRIES } from '@/components/countries';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEADER_HEIGHT = 80;
const { width, height } = Dimensions.get('window');
const TAB_WIDTH = (width - 32 - 8) / 2;

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

export default function GetLocationScreen() {
  const { t } = useTranslation();
  const { currentLocation, currentRegion, currentMarker, type, locationIndex } = useLocalSearchParams();
  
  // Log the received parameters
  console.log('=== USE LOCAL SEARCH PARAMS ===');
  console.log('currentLocation:', currentLocation);
  console.log('currentRegion:', currentRegion);
  console.log('currentMarker:', currentMarker);
  console.log('type:', type);
  console.log('locationIndex:', locationIndex);
  console.log('===============================');
  
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');


  const [location, setLocation] = useState(currentLocation || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(currentMarker ? JSON.parse(currentMarker as string) : null);
  const [region, setRegion] = useState<Region | null>(currentRegion ? JSON.parse(currentRegion as string) : null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('map');
  const [isLoading, setIsLoading] = useState(false);
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
  const translateX = useSharedValue(0); 

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

  const handlePress = (mode: string) => {
    setMode(mode);
    translateX.value = withTiming(mode === 'map' ? 0 : TAB_WIDTH, { duration: 200 });
  };

  const animatedTabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    StatusBar.setBarStyle('light-content'); 
  }, []);

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

        const newRegion: Region = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
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

  const handlePickerChange = (value: string) => {
    setCountry(value);
  };

  const getPickerItems = () => {
    const items = COUNTRIES;
    return [
      { label: t('packageForm.country'), value: '' },
      ...items.map(item => ({ label: item, value: item }))
    ];
  };

  const handleUpdate = async () => {
    console.log('handleUpdate');
    if(mode == 'map') {
      console.log(location, region, marker);
      // show a alert if no marker
      if(!marker) {
        Alert.alert(t('packageForm.mapHint'));
        return;
      }
      // Store the selected location data in AsyncStorage
      await AsyncStorage.setItem('selectedLocationData', JSON.stringify({
        selectedLocation: location,
        selectedRegion: region,
        selectedMarker: marker,
        locationType: type,
        locationIndex: locationIndex
      }));
      
      // Navigate back to index.tsx
      router.back();
      
    } else {
      console.log(addressLine1, addressLine2, city, state, postalCode, country);
      // check required fields
      if (!country.trim()) {
        Alert.alert(t('packageForm.fillRequiredFields'));
        return;
      }
      
      // For manual entry, construct a full address
      const fullAddress = [addressLine1, addressLine2, city, state, postalCode, country]
        .filter(Boolean)
        .join(', ');
      
      // Store the manual address data in AsyncStorage
      await AsyncStorage.setItem('selectedLocationData', JSON.stringify({
        selectedLocation: fullAddress,
        selectedRegion: null,
        selectedMarker: null,
        locationType: type,
        locationIndex: locationIndex
      }));
      
      // Navigate back to index.tsx
      router.back();
    }
  };

  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(getPickerItems());

  const handleCountrySearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredCountries(getPickerItems());
    } else {
      const filtered = getPickerItems().filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  };

  const openCountryModal = () => {
    setIsCountryModalVisible(true);
    setSearchQuery('');
    setFilteredCountries(getPickerItems());
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
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.dismiss()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            {t('packageForm.location')} {locationIndex && locationIndex !== '1' ? `#${locationIndex}` : ''}
          </Text>
        </Animated.View>

        <View style={styles.tabContainer}>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <Animated.View style={[styles.animatedIndicator, animatedTabStyle]} />
              <TouchableOpacity
                onPress={() => handlePress('map')}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'map' && styles.activeTabText,
                  ]}
                >
                  {t('packageForm.pickFromMap')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePress('manual')}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'manual' && styles.activeTabText,
                  ]}
                >
                  {t('packageForm.enterManually')}
                </Text>
              </TouchableOpacity>
          </View>
          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {/* Map View */}
            {mode === 'map' && (
              <>
                {region && (
                  <>
                  <MapView
                    style={{ flex: 1, marginTop: -92 }}
                    initialRegion={region || {
                      latitude: 0,
                      longitude: 0,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress}
                  >
                    {marker && <Marker coordinate={marker} />}
                  </MapView>
                  <Text style={styles.mapHint}>{t('packageForm.mapHint')}</Text>
                  </>
                )}
              </>
            )}
            {/* Manual Entry */}
            {mode === 'manual' && (
            <View style={styles.form}>
              <Text style={styles.label}>{t('packageForm.address')} Line 1</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder={t('packageForm.address')}
                  style={styles.input} 
                  value={addressLine1} 
                  onChangeText={setAddressLine1} 
                  returnKeyType="done" 
                  onSubmitEditing={handleReturnKey}
                  textContentType="fullStreetAddress" 
                  autoCapitalize="words"
                  selectionColor={COLORS.primary}
                  clearButtonMode="always"
                />
              </View>

              <Text style={styles.label}>{t('packageForm.address')} Line 2 (optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder={t('packageForm.address')} 
                  style={styles.input} 
                  value={addressLine2} 
                  onChangeText={setAddressLine2} 
                  returnKeyType="done" 
                  onSubmitEditing={handleReturnKey}
                  textContentType="fullStreetAddress"
                  autoCapitalize="words"
                  selectionColor={COLORS.primary}
                  clearButtonMode="always"
                />
              </View>

              <Text style={styles.label}>{t('packageForm.city')}</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder={t('packageForm.city')}
                  style={styles.input} 
                  value={city} 
                  onChangeText={setCity} 
                  returnKeyType="done" 
                  onSubmitEditing={handleReturnKey}
                  textContentType="addressCity"
                  autoCapitalize="words"
                  selectionColor={COLORS.primary}
                  clearButtonMode="always"
                />
              </View>

              <Text style={styles.label}>{t('packageForm.country')} <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={openCountryModal}
              >
                <Text style={[styles.input, !country && { color: '#999' }]}>
                  {country || t('packageForm.selectCountry')}
                </Text>
                <SelectArrowIcon size={20} color={COLORS.text} />
              </TouchableOpacity>

              <Text style={styles.label}>{t('packageForm.state')}</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder={t('packageForm.state')}
                  style={styles.input} 
                  value={state} 
                  onChangeText={setState} 
                  returnKeyType="done" 
                  onSubmitEditing={handleReturnKey}
                  textContentType="addressState"
                  autoCapitalize="words"
                  selectionColor={COLORS.primary}
                  clearButtonMode="always"
                />
              </View>

              <Text style={styles.label}>{t('packageForm.postalCode')}</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder={t('packageForm.postalCode')}
                  style={styles.input} 
                  value={postalCode} 
                  onChangeText={setPostalCode} 
                  returnKeyType="done" 
                  onSubmitEditing={handleReturnKey}
                  textContentType="postalCode"
                  autoCapitalize="words"
                  selectionColor={COLORS.primary}
                  clearButtonMode="always"
                />
              </View>

              {/* Replace the existing Picker Modal with this searchable dropdown */}
                              <Modal
                  visible={isCountryModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setIsCountryModalVisible(false)}
                >
                  <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('packageForm.selectCountry')}</Text>
                        <TouchableOpacity onPress={() => setIsCountryModalVisible(false)}>
                          <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TextInput
                        style={styles.searchInput}
                        placeholder={t('packageForm.searchCountries')}
                        value={searchQuery}
                        onChangeText={handleCountrySearch}
                        autoFocus={false}
                      />
                      
                      <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.countryItem}
                            onPress={() => {
                              handlePickerChange(item.value);
                              setIsCountryModalVisible(false);
                            }}
                          >
                            <Text style={styles.countryItemText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                        style={styles.countryList}
                        keyboardShouldPersistTaps="handled"
                      />
                    </View>
                  </KeyboardAvoidingView>
                </Modal>
            </View>
            )}
          </View>
        </View>
        {isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? t('packageForm.updating') : t('packageForm.useThisAddress')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
      {!isKeyboardVisible && (
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? t('packageForm.updating') : t('packageForm.useThisAddress')}
          </Text>
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
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    zIndex: 2,
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
    paddingTop: 0,
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

  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '50%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },


  modalTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
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
  countryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  countryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  countryItemText: {
    fontSize: 16,
    fontFamily: 'nunito-medium',
    color: COLORS.text,
  },
  disabledButton: {
    opacity: 0.7,
  },
  required: {
    color: 'red',
  },
  tabContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: COLORS.backgroundWrapper,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    padding: 4,
    marginHorizontal: 16,
    zIndex: 1,
  },
  animatedIndicator: {
    position: 'absolute',
    height: '100%',
    width: TAB_WIDTH,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    zIndex: 0,
    top: 4,
    left: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
    paddingVertical: 12,
  },
  tabText: {
    color: COLORS.text,
    fontFamily: 'nunito-bold',
    fontSize: 14, 
    letterSpacing: -0.2,
    lineHeight: 16,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.background,
  },
  contentContainer: {
    marginTop: 0,
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },

});
