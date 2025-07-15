import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
import { Marker, MapMarker } from 'react-native-maps';
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
  const latDelta = latDiff * 1.5;
  const lngDelta = lngDiff * 1.5;
  
  // Ensure minimum zoom level
  const minDelta = 0.1;
  const maxDelta = 10;
  
  const result = {
    latitudeDelta: Math.min(Math.max(latDelta, minDelta), maxDelta),
    longitudeDelta: Math.min(Math.max(lngDelta, minDelta), maxDelta)
  };
  
  console.log('Calculated deltas:', result);
  return result;
};

const calculateMidpoint = (pickup: Coordinates, dropoff: Coordinates) => {
  return {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2
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
  const { confirmPayment } = useStripe();
  const { t } = useTranslation();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'polling'>('idle');

  useEffect(() => {
    if (visible && orderData) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
        };
        const response = await pollCreatePackage(paymentIntent.id, packageData);
        if (response.status === 'success') {
          setPaymentStatus('success');
          Alert.alert(
            t('common.success'),
            t('paymentPreview.paymentSuccess'),
            [
              {
                text: 'OK',
                onPress: () => {
                  onPaymentSuccess(response.data);
                }
              }
            ]
          );
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
      style={{ justifyContent: 'flex-end', margin: 0 }}
      backdropOpacity={0.5}
      propagateSwipe
    >
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400 }}
        >
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{t('paymentPreview.title')}</Text>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>{t('paymentPreview.packageSummary')}</Text>
            <Text>{orderData.pickup.name} → {orderData.drop.name}</Text>
            <Text>{orderData.pickup.address} → {orderData.drop.address}</Text>
            <Text>{t('paymentPreview.weight')}: {typeof orderData.weight === 'string' ? orderData.weight : `${orderData.weight}kg`}</Text>
            <Text>{t('paymentPreview.price')}: {currencyConfig.code} {parseFloat(orderData.price).toFixed(2)}</Text>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{t('paymentPreview.cardDetails') || 'Card Details'}</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{ backgroundColor: '#fff', textColor: '#212121', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}
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
                {t('paymentPreview.payNow')} {currencyConfig.code} {parseFloat(orderData.price).toFixed(2)}
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
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
  const { t } = useTranslation();
  const currencyConfig = getCurrencyConfig();
  
  const pickupMarkerRef = useRef<MapMarker>(null);
  const dropoffMarkerRef = useRef<MapMarker>(null);

  const handlePaymentSuccess = (updatedOrderData: any) => {
    setShowPaymentModal(false);
    // Update the order data with the new data from payment
    if (updatedOrderData) {
      setOrderData(updatedOrderData);
    }
    // Alert.alert(
    //   t('common.success'),
    //   t('paymentPreview.paymentSuccess'),
    //   [{ text: 'OK' }]
    // );
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
    StatusBar.setBarStyle('dark-content');
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
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.replace('/(tabs)/manage')}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('orderDetail.title')}</Text>
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
          >
            {isMapReady && pickupCoords && (
              <Marker
                ref={pickupMarkerRef}
                coordinate={pickupCoords}
                title={t('packageForm.pickupDetails')}
                description={orderData?.pickup.address || 'N/A'}
              >
                <Image source={require('@/assets/icons/pickup-marker.png')} style={{ width: 36, height: 36 }} />
              </Marker>
            )}
            {isMapReady && dropoffCoords && (
              <Marker
                ref={dropoffMarkerRef}
                coordinate={dropoffCoords}
                title={t('packageForm.dropoffDetails')}
                description={orderData?.drop.address || 'N/A'}
              >
                <Image source={require('@/assets/icons/dropoff-marker.png')} style={{ width: 36, height: 36 }} />
              </Marker>
            )}
          </MapView>
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
                <Text style={styles.orderSummaryPrice}>{currencyConfig.code} {parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
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
              <Text style={styles.pickupDetailsValue}> {currencyConfig.code} {parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
            </View>
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.pickupDetails.location')}</Text>
              <Text style={styles.pickupDetailsValue}>
                {orderData?.pickup.address || 'N/A'}
              </Text>
            </View>
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
            <View style={styles.pickupDetailsRow}>
              <Text style={styles.pickupDetailsLabel}>{t('orderDetail.dropoffDetails.location')}</Text>
              <Text style={styles.pickupDetailsValue}>
                {orderData?.drop.address || 'N/A'}
              </Text>
            </View>
            {/* Note Section */}
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>{t('orderDetail.dropoffDetails.note')}</Text>
              <Text style={styles.noteText}>
                {orderData?.drop.details || 'No details provided'}
              </Text>
            </View>
          </View>

          {/* <View style={styles.paymentButtonContainer}>
            {orderData?.order?.status === 'completed' ? (
              <TouchableOpacity 
                style={[styles.paymentButton, styles.releaseButton]} 
                onPress={async () => {
                  try {
                    const response = await api.post(`/payments/release/${orderData.id}`);
                    if (response.data.status === 'success') {
                      Alert.alert(
                        'Payment Released',
                        'Payment has been successfully released to the dropper.',
                        [{ text: 'OK' }]
                      );
                      // Refresh order data or navigate back
                      router.back();
                    }
                  } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || 'Failed to release payment');
                  }
                }}
              >
                <Text style={styles.paymentButtonText}>Release Payment to Dropper</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.paymentButton} 
                onPress={() => {
                  if (orderData) {
                    router.push({
                      pathname: '/payment-modal',
                      params: { orderData: JSON.stringify(orderData) }
                    });
                  }
                }}
              >
                <Text style={styles.paymentButtonText}>Payment</Text>
              </TouchableOpacity>
            )}
          </View> */}

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
        <View style={[styles.paymentButtonContainer, { bottom: 80 }]}> 
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
                  {t('paymentPreview.payNow')} {currencyConfig.code} {parseFloat(orderData.price).toFixed(2)}
                </Text>
              </>
            )}
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
    paddingBottom: 80,
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
    zIndex: 1,
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
