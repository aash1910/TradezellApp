import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, Alert } from 'react-native';
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
import MapView from 'react-native-maps';
import { Marker, MapMarker } from 'react-native-maps';
import * as Location from 'expo-location';
import mapStyle from '@/components/mapStyle.json';
import api from '@/services/api';
import { Package } from '@/services/packageList.service';
import { useTranslation } from 'react-i18next';

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
};

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
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');
  const { t } = useTranslation();
  
  const pickupMarkerRef = useRef<MapMarker>(null);
  const dropoffMarkerRef = useRef<MapMarker>(null);

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
                <Text style={styles.orderSummaryPrice}>${parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
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
              <Text style={styles.pickupDetailsValue}>${parseFloat(orderData?.price || '0.00').toFixed(2)}</Text>
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

          <View style={styles.paymentButtonContainer}>
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
    marginTop: 20,
    paddingHorizontal: 16,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
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
});
