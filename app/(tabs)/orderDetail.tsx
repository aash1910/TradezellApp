import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
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
import { MoneyIcon } from '@/components/icons/MoneyIcon';
import MapView from 'react-native-maps';
import { Marker, MapMarker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import mapStyle from '@/components/mapStyle.json';
import api from '@/services/api';
import { Package } from '@/services/packageList.service';
import { useTranslation } from 'react-i18next';
import { paymentService } from '@/services/payment.service';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';
import RNModal from 'react-native-modal';
import { STRIPE_CONFIG } from '@/config/stripe';
import { getCurrencyConfig } from '@/constants/Currency';
import { packageService } from '@/services/package.service';
import { uploadService } from '@/services/upload.service';
import ImageViewing from 'react-native-image-viewing';
import { getCityAndCountry } from '@/utils/addressUtils';
import { MapIcon } from '@/components/icons/MapIcon';
import { MapButtonIcon } from '@/components/icons/MapButtonIcon';
import * as Clipboard from 'expo-clipboard';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 120;

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#919191',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
  success: '#34C759',
  error: '#FF3B30',
};

const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.publishableKey;

interface Coordinates {
  latitude: number;
  longitude: number;
}

const calculateMapDeltas = (pickup: Coordinates, dropoff: Coordinates) => {
  // Calculate the distance between points
  const latDiff = Math.abs(pickup.latitude - dropoff.latitude);
  const lngDiff = Math.abs(pickup.longitude - dropoff.longitude);
  
  console.log('Coordinate differences:', { latDiff, lngDiff });
  
  // Add more padding (50%) to ensure markers are comfortably visible
  let latDelta = latDiff * 1.5;
  let lngDelta = lngDiff * 1.5;
  
  // Ensure minimum zoom level for close distances
  const minDelta = 0.01;
  
  // For very large distances (country-to-country), use more intelligent scaling
  if (latDiff > 10 || lngDiff > 10) {
    // For continental distances, use a more aggressive scaling
    latDelta = latDiff * 1.2;
    lngDelta = lngDiff * 1.2;
  } else if (latDiff > 5 || lngDiff > 5) {
    // For country-to-country distances, use moderate scaling
    latDelta = latDiff * 1.3;
    lngDelta = lngDiff * 1.3;
  } else if (latDiff > 1 || lngDiff > 1) {
    // For city-to-city distances, use standard scaling
    latDelta = latDiff * 1.5;
    lngDelta = lngDiff * 1.5;
  }
  
  const result = {
    latitudeDelta: Math.max(latDelta, minDelta),
    longitudeDelta: Math.max(lngDelta, minDelta)
  };
  
  console.log('Calculated deltas:', result);
  return result;
};

const calculateMidpoint = (pickup: Coordinates, dropoff: Coordinates) => {
  // Calculate the true midpoint
  const trueMidpoint = {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2
  };
  
  // Calculate the distance between points to determine padding amount
  const latDiff = Math.abs(pickup.latitude - dropoff.latitude);
  
  // Add padding only to the top by shifting the center upward (northward)
  // The padding amount is proportional to the distance between points
  // For small distances: 12% of the distance as padding
  // For larger distances: 15% of the distance as padding
  let topPadding = 0;
  if (latDiff > 1) {
    topPadding = latDiff * 0.15; // 15% padding for city-to-city distances
  } else if (latDiff > 0.1) {
    topPadding = latDiff * 0.12; // 12% padding for neighborhood distances
  } else {
    topPadding = latDiff * 0.10; // 10% padding for very close distances
  }
  
  // Shift the center upward to create top padding
  // This moves the view northward, showing more area above the markers
  return {
    latitude: trueMidpoint.latitude + topPadding,
    longitude: trueMidpoint.longitude
  };
};

function PaymentCardModal({
  visible,
  onClose,
  orderData,
  onPaymentSuccess,
  currencyConfig
}: {
  visible: boolean;
  onClose: () => void;
  orderData: Package;
  onPaymentSuccess: (orderData: any) => void;
  currencyConfig: ReturnType<typeof getCurrencyConfig>;
}) {
  const insets = useSafeAreaInsets();
  const { confirmPayment } = useStripe();
  const { t } = useTranslation();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'polling'>('idle');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible && orderData) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Listen to keyboard events to manually move modal on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const keyboardWillShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      const intent = await paymentService.createPaymentIntent(
        null,
        parseFloat(orderData.price),
        {
          pickup_name: orderData.pickup.name,
          pickup_mobile: orderData.pickup.mobile,
          pickup_address: orderData.pickup.address,
          pickup_details: orderData.pickup.details || '',
          weight: typeof orderData.weight === 'string' ? parseFloat(orderData.weight) : orderData.weight,
          price: parseFloat(orderData.price),
          pickup_date: orderData.pickup.date,
          pickup_time: orderData.pickup.time,
          drop_name: orderData.drop.name,
          drop_mobile: orderData.drop.mobile,
          drop_address: orderData.drop.address,
          drop_details: orderData.drop.details || '',
          pickup_lat: orderData.pickup.coordinates.lat ? parseFloat(orderData.pickup.coordinates.lat) : undefined,
          pickup_lng: orderData.pickup.coordinates.lng ? parseFloat(orderData.pickup.coordinates.lng) : undefined,
          drop_lat: orderData.drop.coordinates.lat ? parseFloat(orderData.drop.coordinates.lat) : undefined,
          drop_lng: orderData.drop.coordinates.lng ? parseFloat(orderData.drop.coordinates.lng) : undefined,
        }
      );
      setPaymentIntent(intent);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Polling helper for package creation
  const pollCreatePackage = async (paymentIntentId: string, packageData: any, maxAttempts = 10, delayMs = 3000) => {
    setPaymentStatus('polling');
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await paymentService.createPackageAfterPayment(paymentIntentId, packageData);
        if (response.status === 'success') {
          return response;
        }
        if (response.status === 'pending') {
          // Wait and retry
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }
        // If error, break and show error
        throw new Error(response.message || 'Failed to create package');
      } catch (err) {
        if (attempt === maxAttempts) throw err;
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    throw new Error('Package creation timed out. Please try again.');
  };

  const handlePayment = async () => {
    if (!paymentIntent || !cardComplete) {
      Alert.alert('Error', t('paymentPreview.completeCardDetails') || 'Please complete your card details');
      return;
    }
    try {
      setPaymentStatus('processing');
      const { error, paymentIntent: confirmedPaymentIntent } = await confirmPayment(
        paymentIntent.client_secret,
        { paymentMethodType: 'Card' }
      );
      if (error) {
        setPaymentStatus('error');
        Alert.alert('Payment Failed', error.message);
      } else if (
        confirmedPaymentIntent &&
        typeof confirmedPaymentIntent.status === 'string' &&
        confirmedPaymentIntent.status.toLowerCase() === 'succeeded'
      ) {
        setPaymentStatus('polling');
        // Poll for package creation after payment
        const packageData = {
          pickup_name: orderData.pickup.name,
          pickup_mobile: orderData.pickup.mobile,
          pickup_address: orderData.pickup.address,
          pickup_address2: orderData.pickup.address2,
          pickup_address3: orderData.pickup.address3,
          pickup_details: orderData.pickup.details || '',
          weight: typeof orderData.weight === 'string' ? parseFloat(orderData.weight) : orderData.weight,
          price: parseFloat(orderData.price),
          pickup_date: orderData.pickup.date,
          pickup_time: orderData.pickup.time,
          pickup_image: orderData.pickup.image,
          drop_name: orderData.drop.name,
          drop_mobile: orderData.drop.mobile,
          drop_address: orderData.drop.address,
          drop_address2: orderData.drop.address2,
          drop_address3: orderData.drop.address3,
          drop_details: orderData.drop.details || '',
          pickup_lat: orderData.pickup.coordinates.lat ? parseFloat(orderData.pickup.coordinates.lat) : undefined,
          pickup_lng: orderData.pickup.coordinates.lng ? parseFloat(orderData.pickup.coordinates.lng) : undefined,
          pickup_lat2: orderData.pickup.coordinates.lat2 ? parseFloat(orderData.pickup.coordinates.lat2) : undefined,
          pickup_lng2: orderData.pickup.coordinates.lng2 ? parseFloat(orderData.pickup.coordinates.lng2) : undefined,
          pickup_lat3: orderData.pickup.coordinates.lat3 ? parseFloat(orderData.pickup.coordinates.lat3) : undefined,
          pickup_lng3: orderData.pickup.coordinates.lng3 ? parseFloat(orderData.pickup.coordinates.lng3) : undefined,
          drop_lat: orderData.drop.coordinates.lat ? parseFloat(orderData.drop.coordinates.lat) : undefined,
          drop_lng: orderData.drop.coordinates.lng ? parseFloat(orderData.drop.coordinates.lng) : undefined,
          drop_lat2: orderData.drop.coordinates.lat2 ? parseFloat(orderData.drop.coordinates.lat2) : undefined,
          drop_lng2: orderData.drop.coordinates.lng2 ? parseFloat(orderData.drop.coordinates.lng2) : undefined,
          drop_lat3: orderData.drop.coordinates.lat3 ? parseFloat(orderData.drop.coordinates.lat3) : undefined,
          drop_lng3: orderData.drop.coordinates.lng3 ? parseFloat(orderData.drop.coordinates.lng3) : undefined,
        };
        const response = await pollCreatePackage(paymentIntent.id, packageData);
        if (response.status === 'success') {
          setPaymentStatus('success');
          onPaymentSuccess(response.data);
        } else {
          setPaymentStatus('error');
          Alert.alert(t('common.error'), response.message || t('paymentPreview.packageCreationFailed'));
        }
      } else {
        setPaymentStatus('error');
        Alert.alert('Payment Failed', t('paymentPreview.paymentFailed'));
      }
    } catch (error: any) {
      setPaymentStatus('error');
      Alert.alert('Payment Error', error.message);
    }
  };

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ 
        justifyContent: 'flex-end', 
        margin: 0,
        ...(Platform.OS === 'android' && keyboardHeight > 0 && {
          marginBottom: keyboardHeight + insets.bottom 
        })
      }}
      backdropOpacity={0.5}
      propagateSwipe
    >
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Math.max(insets.bottom, 20), minHeight: 400 }}
        >
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{t('paymentPreview.title')}</Text>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>{t('paymentPreview.packageSummary')}</Text>
            <Text>{orderData.pickup.name} → {orderData.drop.name}</Text>
            <Text>{getCityAndCountry(orderData.pickup.address)} → {getCityAndCountry(orderData.drop.address)}</Text>
            <Text>{t('paymentPreview.weight')}: {typeof orderData.weight === 'string' ? orderData.weight : `${orderData.weight}kg`}</Text>
            <Text>{t('paymentPreview.price')}: {currencyConfig.symbol}{parseFloat(orderData.price).toFixed(2)}</Text>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{t('paymentPreview.cardDetails') || 'Card Details'}</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{ backgroundColor: '#ffffff', textColor: '#212121', borderRadius: 8, borderWidth: 1, borderColor: '#eeeeee' }}
              style={{ height: 50, marginBottom: 8 }}
              onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
            />
          </View>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, opacity: (!cardComplete || paymentStatus === 'processing' || paymentStatus === 'polling') ? 0.7 : 1 }}
            onPress={handlePayment}
            disabled={!cardComplete || paymentStatus === 'processing' || paymentStatus === 'polling'}
          >
            {paymentStatus === 'processing' ? (
              <ActivityIndicator color={COLORS.buttonText} />
            ) : paymentStatus === 'polling' ? (
              <>
                <ActivityIndicator color={COLORS.buttonText} />
                <Text style={{ color: COLORS.buttonText, fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
                  {t('paymentPreview.processing') || 'Processing...'}
                </Text>
              </>
            ) : (
              <Text style={{ color: COLORS.buttonText, fontSize: 16, fontWeight: 'bold' }}>
                {t('paymentPreview.payNow')} {currencyConfig.symbol}{parseFloat(orderData.price).toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
              🔒 {t('paymentPreview.securityNotice') || 'Your payment information is secure and encrypted by Stripe'}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </StripeProvider>
    </RNModal>
  );
}

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [orderData, setOrderData] = useState<Package | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [mapDeltas, setMapDeltas] = useState({ latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [showMarkerInfo, setShowMarkerInfo] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<'pickup' | 'dropoff' | null>(null);
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
  const { t } = useTranslation();
  const currencyConfig = getCurrencyConfig();

  // Helper function to open navigation in Google Maps
  const openGoogleMapsNavigation = (
    pickupAddress: string, 
    dropoffAddress: string,
    pickupCoords?: {lat: number, lng: number},
    dropoffCoords?: {lat: number, lng: number}
  ) => {
    console.log('openGoogleMapsNavigation called with:', { 
      pickupAddress, 
      dropoffAddress, 
      pickupCoords, 
      dropoffCoords 
    });
    
    // Use coordinates if available, otherwise fall back to addresses
    const pickupLocation = pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : encodeURIComponent(pickupAddress);
    const dropoffLocation = dropoffCoords ? `${dropoffCoords.lat},${dropoffCoords.lng}` : encodeURIComponent(dropoffAddress);
    
    // Web URL that always works - use coordinates if available for better accuracy
    const webUrl = pickupCoords && dropoffCoords 
      ? `https://www.google.com/maps/dir/?api=1&origin=${pickupLocation}&destination=${dropoffLocation}`
      : `https://www.google.com/maps/dir/${pickupLocation}/${dropoffLocation}`;
    console.log('Web URL:', webUrl);
    
    if (Platform.OS === 'ios') {
      console.log('Platform: iOS');
      // Try iOS Google Maps app first
      const iosAppUrl = pickupCoords && dropoffCoords
        ? `comgooglemaps://?saddr=${pickupLocation}&daddr=${dropoffLocation}&directionsmode=driving`
        : `comgooglemaps://?saddr=${pickupLocation}&daddr=${dropoffLocation}&directionsmode=driving`;
      console.log('iOS Google Maps URL:', iosAppUrl);
      
      Linking.canOpenURL(iosAppUrl).then(supported => {
        console.log('iOS Google Maps canOpenURL result:', supported);
        if (supported) {
          console.log('Opening iOS Google Maps app');
          Linking.openURL(iosAppUrl);
        } else {
          console.log('Google Maps app not available, opening web version');
          Linking.openURL(webUrl);
        }
      }).catch((error) => {
        console.log('Error with Google Maps app:', error);
        console.log('Opening web version as fallback');
        Linking.openURL(webUrl);
      });
    } else {
      console.log('Platform: Android');
      // Try Android Google Maps app first
      const androidAppUrl = `google.navigation:q=${dropoffLocation}`;
      console.log('Android Google Maps URL:', androidAppUrl);
      
      Linking.canOpenURL(androidAppUrl).then(supported => {
        console.log('Android Google Maps canOpenURL result:', supported);
        if (supported) {
          console.log('Opening Android Google Maps app');
          Linking.openURL(androidAppUrl);
        } else {
          console.log('Google Maps app not available, opening web version');
          Linking.openURL(webUrl);
        }
      }).catch((error) => {
        console.log('Error with Google Maps app:', error);
        console.log('Opening web version as fallback');
        Linking.openURL(webUrl);
      });
    }
  };

  
  
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerUri, setImageViewerUri] = useState<string | null>(null);
  const [showDirectionLine, setShowDirectionLine] = useState(false);
  
  const pickupMarkerRef = useRef<MapMarker>(null);
  const dropoffMarkerRef = useRef<MapMarker>(null);
  const [isUploadingPickupImage, setIsUploadingPickupImage] = useState(false);

  // Method to upload pickup image after package creation
  const uploadPickupImage = async (pkgId: number, baseOrderData: any) => {
    const uploadedPhoto = params.uploadedPhoto as string | undefined;
    if (uploadedPhoto && pkgId) {
      try {
        setIsUploadingPickupImage(true);
        // Compress the image before upload
        const compressedUri = await uploadService.compressImage(uploadedPhoto);
        const response = await packageService.uploadPickupImage(pkgId, compressedUri);
        const newPickupImage = response?.data?.pickup_image;
        if (newPickupImage && baseOrderData) {
          setOrderData({
            ...baseOrderData,
            pickup: {
              ...baseOrderData.pickup,
              image: newPickupImage,
            },
          });
        }
        //Alert.alert('Success', 'Pickup image uploaded successfully');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to upload pickup image');
      } finally {
        setIsUploadingPickupImage(false);
      }
    }
  };

  const handlePaymentSuccess = (updatedOrderData: any) => {
    setShowPaymentModal(false);
    if (updatedOrderData) {
      setOrderData(updatedOrderData);
      // Upload pickup image if needed
      if (updatedOrderData.id) {
        uploadPickupImage(updatedOrderData.id, updatedOrderData);
      }
    }
    Alert.alert(
      t('common.success'),
      t('paymentPreview.paymentSuccess') + '\n' + t('packageForm.validation.jobPostedSuccess'),
      [{ text: 'OK' }]
    );
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
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

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

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
    try {
      console.log("=== DEBUG: Starting params.orderData effect ===");
      console.log("Raw params:", params);
      
      if (!params.orderData) {
        console.log("DEBUG: No order data in params");
        return;
      }

      console.log("DEBUG: params.orderData type:", typeof params.orderData);
      console.log("DEBUG: params.orderData value:", params.orderData);

      // If it's a string, try to parse it as JSON
      if (typeof params.orderData === 'string') {
        try {
          console.log("DEBUG: Attempting to parse string data");
          const parsedData = JSON.parse(params.orderData);
          console.log("DEBUG: Successfully parsed JSON:", parsedData);
          if (isValidOrderData(parsedData)) {
            console.log("DEBUG: Data passed validation, setting orderData");
            setOrderData(parsedData);
          } else {
            console.log("DEBUG: Data failed validation");
          }
        } catch (e) {
          console.error("DEBUG: Failed to parse order data string:", e);
        }
      }
      // If it's already an object, validate and use it
      else if (typeof params.orderData === 'object' && params.orderData !== null) {
        console.log("DEBUG: Validating object data");
        if (isValidOrderData(params.orderData)) {
          console.log("DEBUG: Object data passed validation, setting orderData");
          setOrderData(params.orderData);
        } else {
          console.log("DEBUG: Object data failed validation");
        }
      }
    } catch (error) {
      console.error("DEBUG: Error in params.orderData effect:", error);
    }
  }, [params.orderData]);

  // Add debugging to validation function
  const isValidOrderData = (data: any): data is Package => {
    console.log("=== DEBUG: Validating Order Data ===");
    const checks = {
      hasId: 'id' in data,
      hasSender: 'sender' in data,
      hasPickup: 'pickup' in data,
      hasDrop: 'drop' in data,
      hasWeight: 'weight' in data,
      hasPrice: 'price' in data,
      pickupIsObject: data.pickup && typeof data.pickup === 'object',
      dropIsObject: data.drop && typeof data.drop === 'object',
      hasPickupCoords: data.pickup && 'coordinates' in data.pickup,
      hasDropCoords: data.drop && 'coordinates' in data.drop
    };
    
    console.log("DEBUG: Validation checks:", checks);
    
    const isValid = (
      checks.hasId &&
      checks.hasSender &&
      checks.hasPickup &&
      checks.hasDrop &&
      checks.hasWeight &&
      checks.hasPrice &&
      checks.pickupIsObject &&
      checks.dropIsObject &&
      checks.hasPickupCoords &&
      checks.hasDropCoords
    );
    
    console.log("DEBUG: Final validation result:", isValid);
    return isValid;
  };

  // Reset states when order changes
  useEffect(() => {
    setPickupCoords(null);
    setDropoffCoords(null);
    setMapCenter(null);
    setIsMapReady(false);
    setShowDirectionLine(false);
    setSelectedMarker(null);
  }, [params.orderData]);

  // Auto-show payment modal for unpaid orders
  useEffect(() => {
    if (orderData && orderData.payment_status === 'pending') {
      setShowPaymentModal(true);
    }
  }, [orderData]);

  // Set markers when order data changes
  useEffect(() => {
    if (!orderData) return;

    const setMarkerInMap = async () => {
      console.log("=== DEBUG: Starting setMarkerInMap ===");
      console.log("DEBUG: Current orderData:", orderData);
      
      try {
        let pickupSet = false;
        let dropoffSet = false;
        
        // Pick-up coordinates
        if (orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng) {
          console.log("DEBUG: Setting pickup coords from coordinates");
          const pickupLat = parseFloat(orderData.pickup.coordinates.lat);
          const pickupLng = parseFloat(orderData.pickup.coordinates.lng);
          
          if (!isNaN(pickupLat) && !isNaN(pickupLng)) {
            setPickupCoords({
              latitude: pickupLat,
              longitude: pickupLng,
            });
            pickupSet = true;
          } else {
            console.error("DEBUG: Invalid pickup coordinates - NaN values");
          }
        }
        
        if (!pickupSet && orderData?.pickup?.address) {
          console.log("DEBUG: Attempting to geocode pickup address:", orderData.pickup.address);
          try {
            const pickup = await Location.geocodeAsync(orderData.pickup.address);
            if (pickup.length > 0) {
              console.log("DEBUG: Successfully geocoded pickup address");
              setPickupCoords({
                latitude: pickup[0].latitude,
                longitude: pickup[0].longitude,
              });
              pickupSet = true;
            }
          } catch (error) {
            console.error("DEBUG: Geocoding error for pickup:", error);
          }
        }
        
        // Drop-off coordinates
        if (orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng) {
          console.log("DEBUG: Setting dropoff coords from coordinates");
          const dropLat = parseFloat(orderData.drop.coordinates.lat);
          const dropLng = parseFloat(orderData.drop.coordinates.lng);
          
          if (!isNaN(dropLat) && !isNaN(dropLng)) {
            setDropoffCoords({
              latitude: dropLat,
              longitude: dropLng,
            });
            dropoffSet = true;
          } else {
            console.error("DEBUG: Invalid dropoff coordinates - NaN values");
          }
        }
        
        if (!dropoffSet && orderData?.drop?.address) {
          console.log("DEBUG: Attempting to geocode dropoff address:", orderData.drop.address);
          try {
            const dropoff = await Location.geocodeAsync(orderData.drop.address);
            if (dropoff.length > 0) {
              console.log("DEBUG: Successfully geocoded dropoff address");
              setDropoffCoords({
                latitude: dropoff[0].latitude,
                longitude: dropoff[0].longitude,
              });
              dropoffSet = true;
            }
          } catch (error) {
            console.error("DEBUG: Geocoding error for dropoff:", error);
          }
        }

        // If neither coordinate was set, log an error
        if (!pickupSet && !dropoffSet) {
          console.error("DEBUG: Failed to set both pickup and dropoff coordinates");
        }
      } catch (error) {
        console.error("DEBUG: Error in setMarkerInMap:", error);
      }
    };

    setMarkerInMap();
  }, [orderData]);

  // Update map center when coordinates change
  useEffect(() => {
    if (pickupCoords && dropoffCoords && !mapCenter) {
      console.log('Updating map center and deltas');
      const deltas = calculateMapDeltas(pickupCoords, dropoffCoords);
      const midpoint = calculateMidpoint(pickupCoords, dropoffCoords);
      setMapDeltas(deltas);
      setMapCenter(midpoint);
      // hide info window by default
      //pickupMarkerRef.current?.hideCallout();
      //dropoffMarkerRef.current?.hideCallout();
    }
  }, [pickupCoords, dropoffCoords, mapCenter]);

  // Add the copy function inside the component
  const copyAddressToClipboard = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert(
        'Copied!',
        'Address copied to clipboard',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address', [{ text: 'OK', style: 'default' }]);
    }
  };

  /**
   * Renders an address row with navigation and copy functionality
   * @param locationType - Either 'pickup' or 'drop'
   * @param addressNumber - 1, 2, or 3 for multiple addresses
   * @param labelKey - Translation key for the label
   */
  const renderAddressRow = (
    locationType: 'pickup' | 'drop',
    addressNumber: 1 | 2 | 3,
    labelKey: string
  ) => {
    // Determine address field suffix
    const suffix = addressNumber === 1 ? '' : String(addressNumber);
    const addressField = `address${suffix}` as 'address' | 'address2' | 'address3';
    const latField = addressNumber === 1 ? 'lat' : `lat${addressNumber}` as 'lat' | 'lat2' | 'lat3';
    const lngField = addressNumber === 1 ? 'lng' : `lng${addressNumber}` as 'lng' | 'lng2' | 'lng3';

    // Get the address value
    const address = locationType === 'pickup' 
      ? orderData?.pickup[addressField]
      : orderData?.drop[addressField];

    // Skip rendering if no address
    if (!address && addressNumber !== 1) return null;

    // Determine origin and destination for navigation
    const getNavigationParams = () => {
      if (locationType === 'pickup') {
        // For pickup addresses: Navigate FROM this pickup location TO first dropoff
        return {
          originAddress: orderData?.pickup[addressField],
          destAddress: orderData?.drop.address,
          originCoords: orderData?.pickup?.coordinates?.[latField] && orderData?.pickup?.coordinates?.[lngField]
            ? { lat: parseFloat(orderData.pickup.coordinates[latField] as string), lng: parseFloat(orderData.pickup.coordinates[lngField] as string) }
            : undefined,
          destCoords: orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng
            ? { lat: parseFloat(orderData.drop.coordinates.lat), lng: parseFloat(orderData.drop.coordinates.lng) }
            : undefined,
        };
      } else {
        // For dropoff addresses: Navigate FROM first pickup TO this dropoff location
        return {
          originAddress: orderData?.pickup.address,
          destAddress: orderData?.drop[addressField],
          originCoords: orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng
            ? { lat: parseFloat(orderData.pickup.coordinates.lat), lng: parseFloat(orderData.pickup.coordinates.lng) }
            : undefined,
          destCoords: orderData?.drop?.coordinates?.[latField] && orderData?.drop?.coordinates?.[lngField]
            ? { lat: parseFloat(orderData.drop.coordinates[latField] as string), lng: parseFloat(orderData.drop.coordinates[lngField] as string) }
            : undefined,
        };
      }
    };

    const { originAddress, destAddress, originCoords, destCoords } = getNavigationParams();
    const label = addressNumber === 1 ? t(labelKey) : `${t(labelKey)} ${addressNumber}`;

    const content = (
      <View style={styles.pickupDetailsRow}>
        <Text style={styles.pickupDetailsLabel}>{label}</Text>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8 }}>
          <TouchableOpacity 
            style={{ flexShrink: 1 }} 
            onPress={() => {
              if (originAddress && destAddress) {
                openGoogleMapsNavigation(
                  originAddress,
                  destAddress,
                  originCoords,
                  destCoords
                );
              }
            }}
          >
            <Text style={{ color: COLORS.primary, textAlign: 'right' }}>
              {address ? <Text>{address}</Text> : 'N/A'}
            </Text>
          </TouchableOpacity>
          {address && (
            <TouchableOpacity
              style={{ justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                copyAddressToClipboard(address || '');
              }}
            >
              <CopyIcon size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );

    // For address2 and address3, wrap in conditional rendering
    return addressNumber === 1 ? content : address ? content : null;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 80) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.replace('/(tabs)/manage')}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('orderDetail.title')}</Text>
          {orderData?.pickup.address && orderData?.drop.address ? (
            <TouchableOpacity style={styles.mapIcon} onPress={() => openGoogleMapsNavigation(
              orderData.pickup.address, 
              orderData.drop.address,
              orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng 
                ? { lat: parseFloat(orderData.pickup.coordinates.lat), lng: parseFloat(orderData.pickup.coordinates.lng) }
                : undefined,
              orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng 
                ? { lat: parseFloat(orderData.drop.coordinates.lat), lng: parseFloat(orderData.drop.coordinates.lng) }
                : undefined
            )}>
              <MapButtonIcon size={44} color={COLORS.background} />
            </TouchableOpacity>
          ) : (
            <View style={styles.mapIcon}>
              <MapButtonIcon size={44} color={COLORS.background} />
            </View>
          )}
        </Animated.View>

        <View style={styles.mapContainer}>
          <MapView
            key={`${orderData?.id}-${isMapReady}`}
            style={{ flex: 1 }}
            region={mapCenter ? {
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: mapDeltas.latitudeDelta,
              longitudeDelta: mapDeltas.longitudeDelta,
            } : {
              latitude: 52.5321,
              longitude: 13.4246,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            customMapStyle={mapStyle}
            onLayout={() => setIsMapReady(true)}
            onPress={() => {
              if (Platform.OS === 'android') {
                setSelectedMarker(null);
              }
            }}
          >
            {isMapReady && pickupCoords && (
              <Marker
                ref={pickupMarkerRef}
                coordinate={pickupCoords}
                onPress={() => {
                  setShowDirectionLine(true);
                  if (Platform.OS === 'android') {
                    setSelectedMarker('pickup');
                  }
                }}
              >
                <Image source={require('@/assets/icons/pickup-marker.png')} style={{ width: 36, height: 36 }} />
                {Platform.OS === 'ios' && (
                  <Callout
                    onPress={() => {
                      // Open Google Maps navigation when callout is tapped
                      if (orderData?.pickup.address && orderData?.drop.address) {
                        openGoogleMapsNavigation(
                          orderData.pickup.address, 
                          orderData.drop.address,
                          orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng 
                            ? { lat: parseFloat(orderData.pickup.coordinates.lat), lng: parseFloat(orderData.pickup.coordinates.lng) }
                            : undefined,
                          orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng 
                            ? { lat: parseFloat(orderData.drop.coordinates.lat), lng: parseFloat(orderData.drop.coordinates.lng) }
                            : undefined
                        );
                      }
                    }}
                  >
                    <View style={{ padding: 5, minWidth: 200 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        {t('packageForm.pickupDetails')}
                      </Text>
                      <Text style={{ color: COLORS.primary }}>
                        {orderData?.pickup.address || 'N/A'}
                      </Text>
                    </View>
                  </Callout>
                )}
              </Marker>
            )}
            {isMapReady && dropoffCoords && (
              <Marker
                ref={dropoffMarkerRef}
                coordinate={dropoffCoords}
                onPress={() => {
                  setShowDirectionLine(true);
                  if (Platform.OS === 'android') {
                    setSelectedMarker('dropoff');
                  }
                }}
              >
                <Image source={require('@/assets/icons/dropoff-marker.png')} style={{ width: 36, height: 36 }} />
                {Platform.OS === 'ios' && (
                  <Callout
                    onPress={() => {
                      // Open Google Maps navigation when callout is tapped
                      if (orderData?.pickup.address && orderData?.drop.address) {
                        openGoogleMapsNavigation(
                          orderData.pickup.address, 
                          orderData.drop.address,
                          orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng 
                            ? { lat: parseFloat(orderData.pickup.coordinates.lat), lng: parseFloat(orderData.pickup.coordinates.lng) }
                            : undefined,
                          orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng 
                            ? { lat: parseFloat(orderData.drop.coordinates.lat), lng: parseFloat(orderData.drop.coordinates.lng) }
                            : undefined
                        );
                      }
                    }}
                  >
                    <View style={{ padding: 5, minWidth: 200 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        {t('packageForm.dropoffDetails')}
                      </Text>
                      <Text style={{ color: COLORS.primary }}>
                        {orderData?.drop.address || 'N/A'}
                      </Text>
                    </View>
                  </Callout>
                )}
              </Marker>
            )}
            
            {/* Direction Line between Pickup and Dropoff */}
            {isMapReady && showDirectionLine && pickupCoords && dropoffCoords && (
              <Polyline
                coordinates={[pickupCoords, dropoffCoords]}
                strokeColor="#55B086"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
                zIndex={1}
              />
            )}
          </MapView>

          {/* Custom Callout Overlay - Android only */}
          {Platform.OS === 'android' && selectedMarker && (
            <View style={styles.customCalloutContainer}>
              <TouchableOpacity
                style={styles.customCallout}
                onPress={() => {
                  // Open Google Maps navigation when callout is tapped
                  if (orderData?.pickup.address && orderData?.drop.address) {
                    openGoogleMapsNavigation(
                      orderData.pickup.address, 
                      orderData.drop.address,
                      orderData?.pickup?.coordinates?.lat && orderData?.pickup?.coordinates?.lng 
                        ? { lat: parseFloat(orderData.pickup.coordinates.lat), lng: parseFloat(orderData.pickup.coordinates.lng) }
                        : undefined,
                      orderData?.drop?.coordinates?.lat && orderData?.drop?.coordinates?.lng 
                        ? { lat: parseFloat(orderData.drop.coordinates.lat), lng: parseFloat(orderData.drop.coordinates.lng) }
                        : undefined
                    );
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.customCalloutHeader}>
                  <Text style={styles.customCalloutTitle}>
                    {selectedMarker === 'pickup' ? t('packageForm.pickupDetails') : t('packageForm.dropoffDetails')}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setSelectedMarker(null)}
                    style={styles.customCalloutClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.customCalloutCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.customCalloutAddress}>
                  {selectedMarker === 'pickup' 
                    ? (orderData?.pickup.address || 'N/A')
                    : (orderData?.drop.address || 'N/A')
                  }
                </Text>
                <Text style={styles.customCalloutTap}>
                  Tap to navigate
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <View style={styles.orderSummaryRow}>
              <View style={styles.orderSummaryUserRow}>
                {orderData?.sender.image ? ( 
                  <Image source={{ uri: `${baseURLWithoutApi}/${orderData.sender.image}` }} style={styles.userAvatar} />
                ) : ( 
                  <View style={styles.userAvatar} />
                )}
                <View style={styles.orderSummaryUserText}> 
                  <Text style={styles.orderSummaryUserName}>{orderData?.pickup.name || 'N/A'}</Text>
                  <Text style={styles.orderSummaryUserRole}>{t('packageForm.sender')}</Text>
                </View>
              </View>
              {orderData?.order?.dropper && (
              <View style={styles.orderSummaryUserRow}>
                {orderData?.order?.dropper?.image ? ( 
                  <Image source={{ uri: `${baseURLWithoutApi}/${orderData.order.dropper.image}` }} style={styles.userAvatar} />
                ) : ( 
                  <View style={styles.userAvatar} />
                )}
                <View style={styles.orderSummaryUserText}> 
                  <Text style={styles.orderSummaryUserName}>{orderData?.order?.dropper?.name || 'N/A'}</Text>
                  <Text style={styles.orderSummaryUserRole}>{t('packageForm.receiver')}</Text>
                </View>
              </View>
              )}

              <View style={styles.orderSummaryPriceBox}>
                <Text style={styles.orderSummaryPrice}>{currencyConfig.symbol}{parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Pick-up Details Card */}
          <View style={styles.pickupDetailsCard}>
            <Text style={styles.pickupDetailsTitle}>{t('orderDetail.pickupDetails.title')}</Text>
            <View style={styles.pickupDetailsDivider} />
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.pickupDetails.name')}</Text>
              <Text style={styles.pickupDetailsValue}>{orderData?.pickup.name || 'N/A'}</Text>
            </View>
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.pickupDetails.number')}</Text>
              <Text style={styles.pickupDetailsValue}>{orderData?.pickup.mobile || 'N/A'}</Text>
            </View>
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.pickupDetails.weight')}</Text>
              <Text style={styles.pickupDetailsValue}>
                {orderData?.weight 
                  ? (typeof orderData.weight === 'string' 
                    ? ((orderData.weight as string).toLowerCase().includes('kg') ? orderData.weight : `${orderData.weight}Kg`)
                    : `${orderData.weight}Kg`)
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.pickupDetails.price')}</Text>
              <Text style={styles.pickupDetailsValue}>{currencyConfig.symbol}{parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
            </View>
            
            {renderAddressRow('pickup', 1, 'orderDetail.pickupDetails.location')}

            {orderData?.pickup?.image ? (
              <View style={styles.pickupDetailsRow}>
                <Text style={styles.pickupDetailsLabel}>Image</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setImageViewerUri(`${baseURLWithoutApi}/${orderData.pickup.image}`);
                      setIsImageViewerVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: `${baseURLWithoutApi}/${orderData.pickup.image}` }}
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : params.uploadedPhoto ? (
              <View style={styles.pickupDetailsRow}>
                <Text style={styles.pickupDetailsLabel}>Image</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setImageViewerUri(params.uploadedPhoto as string);
                      setIsImageViewerVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: params.uploadedPhoto as string }}
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {renderAddressRow('pickup', 2, 'orderDetail.pickupDetails.location')}
            {renderAddressRow('pickup', 3, 'orderDetail.pickupDetails.location')}

            {/* Note Section */}
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>{t('orderDetail.pickupDetails.note')}</Text>
              <Text style={styles.noteText}>
                {orderData?.pickup.details || 'No details provided'}
              </Text>
            </View>
          </View>

          {/* Drop-off Details Card */}
          <View style={styles.pickupDetailsCard}>
            <Text style={styles.pickupDetailsTitle}>{t('orderDetail.dropoffDetails.title')}</Text>
            <View style={styles.pickupDetailsDivider} />
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.dropoffDetails.name')}</Text>
              <Text style={styles.pickupDetailsValue}>{orderData?.drop.name || 'N/A'}</Text>
            </View>
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.dropoffDetails.number')}</Text>
              <Text style={styles.pickupDetailsValue}>{orderData?.drop.mobile || 'N/A'}</Text>
            </View>

            {renderAddressRow('drop', 1, 'orderDetail.dropoffDetails.location')}
            {renderAddressRow('drop', 2, 'orderDetail.dropoffDetails.location')}
            {renderAddressRow('drop', 3, 'orderDetail.dropoffDetails.location')}


            {/* Note Section */}
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>{t('orderDetail.dropoffDetails.note')}</Text>
              <Text style={styles.noteText}>
                {orderData?.drop.details || 'No details provided'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Payment Modal */}
      {orderData && orderData.payment_status === 'pending' && (
        <PaymentCardModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
          currencyConfig={currencyConfig}
        />
      )}

      {/* Pay Now Button for unpaid orders */}
      {orderData && orderData.payment_status === 'pending' && (
        <View style={[styles.paymentButtonContainer, { bottom: Platform.OS === 'ios' ? 80 : Math.max(insets.bottom, 64) }]}> 
          <TouchableOpacity 
            style={[styles.paymentButton, isProcessing && styles.disabledButton]}
            onPress={handlePayNow}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color={COLORS.buttonText} />
                <Text style={[styles.paymentButtonText, { marginLeft: 8 }]}> 
                  {t('paymentPreview.processing')}
                </Text>
              </>
            ) : (
              <>
                <MoneyIcon size={20} color={COLORS.buttonText} />
                <Text style={[styles.paymentButtonText, { marginLeft: 8 }]}>
                  {t('paymentPreview.payNow')} {currencyConfig.symbol}{parseFloat(orderData.price).toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {imageViewerUri ? (
        <ImageViewing
          images={[{ uri: imageViewerUri }]}
          imageIndex={0}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
          presentationStyle="overFullScreen"
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />
      ) : null}
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
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    zIndex: 1,
  },
  leftArrow: {
    width: 44,
    height: 44,
  },
  mapIcon: {
    width: 44,
    height: 44,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 44,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 6,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },

  title: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'nunito-medium',
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  orderSummaryCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
    marginBottom: 24,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderSummaryUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSummaryUserText: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    marginRight: 14,
  },
  orderSummaryUserName: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  orderSummaryUserRole: {
    fontFamily: 'nunito-regular',
    fontSize: 12,
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  orderSummaryPriceBox: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orderSummaryPrice: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  pickupDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 24,
  },
  pickupDetailsTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: 0.2,
    marginBottom: 8,
    marginLeft: 8,
  },
  pickupDetailsDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 16,
  },
  pickupDetailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pickupDetailsLabel: {
    fontFamily: 'nunito-regular',
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
    color: COLORS.subtitle,
    width: 90,
  },
  pickupDetailsValue: {
    color: COLORS.text,
    fontFamily: 'nunito-bold',
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
    flex: 1,
    textAlign: 'right',
  },
  noteBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    position: 'relative',
    backgroundColor: COLORS.background,
    marginTop: 24,
  },
  noteLabel: {
    position: 'absolute',
    top: -12,
    left: 12,
    backgroundColor: COLORS.background,
    color: COLORS.primary,
    fontFamily: 'nunito-bold',
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    color: COLORS.text,
    fontFamily: 'nunito-medium',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  mapContainer: {
    height: 220,
    overflow: 'hidden',
    marginTop: -20,
    position: 'relative',
  },
  customCalloutContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  customCallout: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  customCalloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customCalloutTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    letterSpacing: 0.2,
    flex: 1,
  },
  customCalloutClose: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  customCalloutCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  customCalloutAddress: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.primary,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  customCalloutTap: {
    fontSize: 12,
    fontFamily: 'nunito-regular',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },

  paymentButtonContainer: {
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  paymentButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
  },
  releaseButton: {
    backgroundColor: COLORS.success,
  },
  releasedButton: {
    backgroundColor: COLORS.textSecondary,
  },
  releasedText: {
    color: COLORS.background,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
