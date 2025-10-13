import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Keyboard, TextInput, Alert, FlatList } from 'react-native';
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
import { useTranslation } from 'react-i18next';

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

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (locationData: {
    selectedLocation: string;
    selectedRegion: Region | null;
    selectedMarker: { latitude: number; longitude: number } | null;
  }) => void;
  currentLocation?: string;
  currentRegion?: Region | null;
  currentMarker?: { latitude: number; longitude: number } | null;
  type?: string;
  locationIndex?: string;
}

export default function LocationModal({
  visible,
  onClose,
  onLocationSelected,
  currentLocation = '',
  currentRegion = null,
  currentMarker = null,
  type = 'pickup',
  locationIndex = '1',
}: LocationModalProps) {
  const { t } = useTranslation();
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
  const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(currentMarker);
  const [region, setRegion] = useState<Region | null>(currentRegion);
  const [mode, setMode] = useState('map');
  const [isLoading, setIsLoading] = useState(false);
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
    if (visible) {
      // Reset state when modal opens
      setLocation(currentLocation || '');
      setMarker(currentMarker);
      setRegion(currentRegion);
      setMode('map');
      translateX.value = 0; // Reset animation to first tab
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('');
    }
  }, [visible, currentLocation, currentRegion, currentMarker]);

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
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
    if(mode == 'map') {
      if(!marker) {
        Alert.alert(t('packageForm.mapHint'));
        return;
      }
      
      onLocationSelected({
        selectedLocation: location,
        selectedRegion: region,
        selectedMarker: marker,
      });
      
      onClose();
      
    } else {
      if (!country.trim()) {
        Alert.alert(t('packageForm.fillRequiredFields'));
        return;
      }
      
      const fullAddress = [addressLine1, addressLine2, city, state, postalCode, country]
        .filter(Boolean)
        .join(', ');
      
      onLocationSelected({
        selectedLocation: fullAddress,
        selectedRegion: null,
        selectedMarker: null,
      });
      
      onClose();
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
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
            <TouchableOpacity style={styles.leftArrow} onPress={onClose}>
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

                {/* Country Modal */}
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
    </Modal>
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
    paddingTop: 24,
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
    top: 24,
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
  mapHint: {
    textAlign: 'center',
    padding: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    color: '#444',
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
});

