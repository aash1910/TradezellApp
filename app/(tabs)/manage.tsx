import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Pressable, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Modal from 'react-native-modal';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BellIcon } from '@/components/icons/BellIcon';
import { SocialShareIcon } from '@/components/icons/SocialShareIcon';
import { MoreVerticalIcon } from '@/components/icons/MoreVerticalIcon';
import { RoundedCheckIcon } from '@/components/icons/RoundedCheckIcon';
import { RoundedCrossIcon } from '@/components/icons/RoundedCrossIcon';
import { RoundedEditIcon } from '@/components/icons/RoundedEditIcon';
import { DistanceIcon } from '@/components/icons/DistanceIcon';
import { MapIcon } from '@/components/icons/MapIcon';
import { VerticalDashedLineIcon } from '@/components/icons/VerticalDashedLineIcon';
import { CalendarIcon } from '@/components/icons/CalendarDateIcon';
import { MessageIcon } from '@/components/icons/MessageIcon';
import { ProfileIcon } from '@/components/icons/ProfileIcon';
import { SimpleCheckIcon } from '@/components/icons/SimpleCheckIcon';
import { SuccessBadgeIcon } from '@/components/icons/SuccessBadgeIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { packageListService } from '@/services/packageList.service';
import { packageService } from '@/services/package.service';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { getUnreadCount } from '@/services/notification.service';
import type { Package } from '@/services/packageList.service';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import { getCurrencyConfig } from '@/constants/Currency';
import * as Location from 'expo-location';
import { getCityAndCountry } from '@/utils/addressUtils';
import Constants from 'expo-constants';

const HEADER_HEIGHT = 80;

const screenWidth = Dimensions.get('window').width;
const TAB_WIDTH = (screenWidth - 32 - 8) / 4;

const COLORS = {
  primary: '#55B086',
  danger: '#FF693B', 
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  buttonBackground: '#EEEEEE',
  text: '#212121',
  textSecondary: '#424242',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
};

export default function ManageScreen() {
  const { t } = useTranslation();
  const { refresh } = useLocalSearchParams();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [modalFilterVisible, setModalFilterVisible] = useState(false);
  const [modalDeliveryCompletedVisible, setModalDeliveryCompletedVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCancelDeliveryVisible, setModalCancelDeliveryVisible] = useState(false);
  const [modalViewReviewVisible, setModalViewReviewVisible] = useState(false);
  const [modalViewRiderReviewVisible, setModalViewRiderReviewVisible] = useState(false);
  const [shouldOpenSecond, setShouldOpenSecond] = useState(false);
  const [shouldOpenThird, setShouldOpenThird] = useState(false);
  const [shouldOpenReviewModal, setShouldOpenReviewModal] = useState(false);
  const [shouldOpenRiderReviewModal, setShouldOpenRiderReviewModal] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<{rating: number, review_text: string} | null>(null);
  const [riderReviewData, setRiderReviewData] = useState<{rating: number, review_text: string, reviewer: {name: string, image: string}} | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const translateX = useSharedValue(0);

  const [filterBy, setFilterBy] = useState('orderDate');

  const [isCanceling, setIsCanceling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const unreadCountIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TABS = [
    { id: 'ongoing', label: t('managePage.tabs.ongoing') },
    { id: 'accepted', label: t('managePage.tabs.accepted') },
    { id: 'completed', label: t('managePage.tabs.completed') },
    { id: 'canceled', label: t('managePage.tabs.canceled') }
  ];

  const handlePress = (index: number) => {
    setActiveTab(index);
    translateX.value = withTiming(index * TAB_WIDTH, { duration: 200 });
  };

  const animatedTabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
    fetchPackages();
  }, [refresh]);

  // Function to fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Fetch unread count when component mounts
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      
      const environment = Constants.expoConfig?.extra?.environment;
      
      // Only start polling if not in development mode
      if (environment !== 'development') {
        // Start polling every 5 seconds
        if (unreadCountIntervalRef.current) {
          clearInterval(unreadCountIntervalRef.current);
        }
        unreadCountIntervalRef.current = setInterval(() => {
          fetchUnreadCount();
        }, 5000);
      }
      
      // Cleanup polling when screen loses focus
      return () => {
        if (unreadCountIntervalRef.current) {
          clearInterval(unreadCountIntervalRef.current);
          unreadCountIntervalRef.current = null;
        }
      };
    }, [fetchUnreadCount])
  );

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageListService.getMyPackages();
      setPackages(response);
      console.log('packages', response);
    } catch (err) {
      setError('Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async (orderId: number) => {
    try {
      setLoadingReview(true);
      const response = await api.get(`/reviews/order/${orderId}`);
      if (response.data.status === 'success' && response.data.data) {
        setReviewData({
          rating: response.data.data.rating,
          review_text: response.data.data.review_text
        });
        setModalViewReviewVisible(true);
      } else {
        Alert.alert(t('common.error'), t('review.error.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching review:', err);
      Alert.alert(t('common.error'), t('review.error.fetchFailed'));
    } finally {
      setLoadingReview(false);
    }
  };

  const fetchRiderReview = async (orderId: number) => {
    try {
      setLoadingReview(true);
      const response = await api.get(`/reviews/order/${orderId}/received`);
      
      if (response.data.status === 'success' && response.data.has_review && response.data.data) {
        setRiderReviewData({
          rating: response.data.data.rating,
          review_text: response.data.data.review_text,
          reviewer: {
            name: response.data.data.reviewer?.name || 'Rider',
            image: response.data.data.reviewer?.image || ''
          }
        });
        setModalViewRiderReviewVisible(true);
      } else if (response.data.status === 'success' && !response.data.has_review) {
        // Rider hasn't reviewed yet - this is expected
        Alert.alert(t('review.noRiderReview'), t('review.error.noReviewAvailable'));
      } else {
        Alert.alert(t('common.error'), t('review.error.fetchFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching rider review:', err);
      Alert.alert(t('common.error'), t('review.error.fetchFailed'));
    } finally {
      setLoadingReview(false);
    }
  };

  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await packageListService.getMyPackages();
      setPackages(response);
    } catch (err) {
      setError('Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getFilteredPackages = (): Package[] => {
    if (!packages) return [];
    
    switch (activeTab) {
      case 0: // On going
        return packages.filter(pkg => pkg.order.status === 'ongoing');
      case 1: // Accepted
        return packages.filter(pkg => pkg.order.status === 'active');
      case 2: // Completed
        return packages.filter(pkg => pkg.order.status === 'completed');
      case 3: // Canceled
        return packages.filter(pkg => pkg.order.status === 'canceled');
      default:
        return [];
    }
  };

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

  // Request location permission and get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    };

    getLocation();
  }, []);

  // Haversine formula utility
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  }

  function formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m from you`;
    } else {
      return `${(meters / 1000).toFixed(1)} km from you`;
    }
  }

  const currencyConfig = getCurrencyConfig();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.header]}>
        <Text style={styles.pageTitle}>{t('managePage.title')}</Text>
        <TouchableOpacity style={styles.leftArrow} onPress={() => router.push('/(tabs)/notification')}>
          <BellIcon size={44} />
          {unreadNotificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.leftArrow} onPress={() => setModalFilterVisible(true)}>
          <SocialShareIcon size={44} />
        </TouchableOpacity>
        <Modal
          isVisible={modalFilterVisible}  
          onSwipeComplete={() => setModalFilterVisible(false)}
          swipeDirection="down"
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalToggleButton}></View>
              {/* <TouchableOpacity style={styles.modalOption} onPress={() => setFilterBy('deliveryDate')}>
                <ProfileIcon size={20} color={filterBy === 'deliveryDate' ? COLORS.primary : COLORS.text} />
                <Text style={[styles.modalOptionText, {color: filterBy === 'deliveryDate' ? COLORS.primary : COLORS.text}]}>Delivery date</Text>
                <SimpleCheckIcon size={20} color={filterBy === 'deliveryDate' ? COLORS.primary : COLORS.text} />
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.modalOption} onPress={() => setFilterBy('orderDate')}>
                <CalendarIcon size={20} color={filterBy === 'orderDate' ? COLORS.primary : COLORS.text} />
                <Text style={[styles.modalOptionText, {color: filterBy === 'orderDate' ? COLORS.primary : COLORS.text}]}>Order date</Text>
                <SimpleCheckIcon size={20} color={filterBy === 'orderDate' ? COLORS.primary : COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={COLORS.primary}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
        >
        <View style={styles.tabContainer}>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <Animated.View style={[styles.animatedIndicator, animatedTabStyle]} />
            {TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handlePress(index)}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {loading && !isRefreshing ? (
              <View style={styles.emptyContainer}>
                <Text>Loading...</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text>{error}</Text>
              </View>
            ) : (
              <>
                {getFilteredPackages().length > 0 ? (
                  getFilteredPackages().map((pkg, index) => {
                    // Calculate distances if userLocation and pickup/drop lat/lon exist
                    let pickupDistanceText = '';
                    let dropDistanceText = '';
                    if (
                      userLocation &&
                      pkg.pickup?.coordinates?.lat && pkg.pickup?.coordinates?.lng
                    ) {
                      const pickupDistance = getDistanceFromLatLonInMeters(
                        userLocation.latitude,
                        userLocation.longitude,
                        Number(pkg.pickup.coordinates.lat),
                        Number(pkg.pickup.coordinates.lng)
                      );
                      pickupDistanceText = formatDistance(pickupDistance);
                    }
                    if (
                      userLocation &&
                      pkg.drop?.coordinates?.lat && pkg.drop?.coordinates?.lng
                    ) {
                      const dropDistance = getDistanceFromLatLonInMeters(
                        userLocation.latitude,
                        userLocation.longitude,
                        Number(pkg.drop.coordinates.lat),
                        Number(pkg.drop.coordinates.lng)
                      );
                      dropDistanceText = formatDistance(dropDistance);
                    }
                    return (
                      <View style={styles.card} key={pkg.id}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>{t('managePage.deliveryOverview')}</Text>
                          {(pkg.order.status === 'ongoing' || pkg.order.status === 'active' || pkg.order.status === 'completed') && (
                          <TouchableOpacity onPress={() => {
                            setSelectedPackage(pkg);
                            setModalVisible(true);
                          }}>
                            <MoreVerticalIcon size={20} />
                          </TouchableOpacity>
                          )}
                        </View>
                        <TouchableOpacity style={styles.cardContainer} onPress={() => router.push({
                          pathname: '/orderDetail',
                          params: { orderData: JSON.stringify(pkg) }
                        })}>
                          <View style={styles.mapPinContainer}>
                            <MapIcon size={24} color={COLORS.primary} />
                            <VerticalDashedLineIcon />
                            <MapIcon size={24} color={COLORS.danger} />
                          </View>
                          <View style={styles.itemRowContainer}>
                            <View style={styles.itemRow}>                          
                              <View style={styles.info}>
                                <View style={styles.infoRow}>
                                  <Image 
                                    source={pkg.sender.image ? { uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${pkg.sender.image}` } : require('@/assets/img/profile-blank.png')} 
                                    style={styles.avatar} 
                                  />
                                  <Text style={styles.name}>{pkg.pickup.name}</Text>
                                </View>
                                <Text style={styles.location}>{getCityAndCountry(pkg.pickup.address)}</Text>
                                {pickupDistanceText && (
                                  <View style={styles.infoRow}>
                                    <DistanceIcon size={14} />
                                    <Text style={styles.distance}>{pickupDistanceText}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.itemRow}>                          
                              <View style={styles.info}>
                                <View style={styles.infoRow}>
                                  <Image 
                                    source={require('@/assets/img/profile-blank.png')} 
                                    style={styles.avatar} 
                                  />
                                  <Text style={styles.name}>{pkg.drop.name}</Text>
                                </View>
                                <Text style={styles.location}>{getCityAndCountry(pkg.drop.address)}</Text>
                                {dropDistanceText && (
                                  <View style={styles.infoRow}>
                                    <DistanceIcon size={14} />
                                    <Text style={styles.distance}>{dropDistanceText}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                        
                        <View style={styles.footer}>
                          <Text style={styles.price}>{currencyConfig.code} {pkg.price}</Text>
                          <View style={styles.statusContainer}>
                            {pkg.order.delivery_status === 1 && (
                              <Text style={styles.deliveryStatus}>Delivered</Text>
                            )}
                            <Text style={[
                              styles.status,
                              {
                                backgroundColor: 
                                  pkg.order.status === 'ongoing' ? COLORS.buttonBackground :
                                  pkg.order.status === 'active' ? 'rgba(40, 152, 255, 0.15)' :
                                  pkg.order.status === 'completed' ? 'rgba(85, 176, 134, 0.15)' :
                                  'rgba(246, 63, 63, 0.15)',
                                color:
                                  pkg.order.status === 'ongoing' ? COLORS.text :
                                  pkg.order.status === 'active' ? '#2898FF' :
                                  pkg.order.status === 'completed' ? '#55B086' :
                                  '#F63F3F'
                              }
                            ]}>
                              {pkg.order.status === 'ongoing' ? t('managePage.orderStatus.inProgress') :
                               pkg.order.status === 'active' ? t('managePage.orderStatus.accepted') :
                               pkg.order.status === 'completed' ? t('managePage.orderStatus.completed') :
                               t('managePage.orderStatus.canceled')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Image source={require('@/assets/images/empty_board.png')} style={styles.emptyImage} />
                    <Text style={styles.messageHeader}>
                      {activeTab === 0 ? t('managePage.emptyStates.ongoing.title') :
                       activeTab === 1 ? t('managePage.emptyStates.accepted.title') :
                       activeTab === 2 ? t('managePage.emptyStates.completed.title') :
                       t('managePage.emptyStates.canceled.title')}
                    </Text>
                    <Text style={styles.message}>
                      {activeTab === 0 ? t('managePage.emptyStates.ongoing.message') :
                       activeTab === 1 ? t('managePage.emptyStates.accepted.message') :
                       activeTab === 2 ? t('managePage.emptyStates.completed.message') :
                       t('managePage.emptyStates.canceled.message')}
                    </Text>
                  </View>
                )}
              </>
            )}

            <Modal
              onSwipeComplete={() => setModalVisible(false)}
              onModalHide={() => {
                if (shouldOpenSecond) {
                  setModalDeliveryCompletedVisible(true);
                  setShouldOpenSecond(false); // reset flag
                }
                if (shouldOpenThird) {
                  setModalCancelDeliveryVisible(true);
                  setShouldOpenThird(false); // reset flag
                }
                if (shouldOpenReviewModal) {
                  if (selectedPackage?.order?.id) {
                    fetchReview(selectedPackage.order.id);
                  }
                  setShouldOpenReviewModal(false); // reset flag
                }
                if (shouldOpenRiderReviewModal) {
                  if (selectedPackage?.order?.id) {
                    fetchRiderReview(selectedPackage.order.id);
                  }
                  setShouldOpenRiderReviewModal(false); // reset flag
                }
              }}
              swipeDirection="down"
              isVisible={modalVisible}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalToggleButton}></View>
                  {selectedPackage?.order.status === 'active' && (
                    <>
                   <TouchableOpacity 
                    style={[
                      styles.modalOption, 
                      isCompleting && { opacity: 0.7 }
                    ]} 
                    disabled={isCompleting}
                    onPress={async () => {
                      try {
                        setIsCompleting(true);
                        if (selectedPackage?.order?.id) {
                          // Update order status to completed
                          await orderService.updateOrderStatus(selectedPackage.order.id, { 
                            status: 'completed'
                          });
                          
                          // Release payment from escrow to dropper
                          if (selectedPackage?.id) {
                            try {
                              await paymentService.releasePaymentFromEscrow(selectedPackage.id);
                              console.log('Payment released successfully');
                            } catch (paymentError) {
                              console.error('Failed to release payment:', paymentError);
                              // Don't show error to user as order is already completed
                              // Payment release can be retried later if needed
                            }
                          }
                          
                          await fetchPackages();
                          setModalVisible(false);
                          setShouldOpenSecond(true);
                          handlePress(2);
                        } else {
                          console.error('No order ID found');
                          Alert.alert('Error', 'Could not complete delivery. Please try again.');
                          setModalVisible(false);
                        }
                      } catch (error) {
                        console.error('Failed to complete delivery:', error);
                        Alert.alert('Error', 'Failed to complete delivery. Please try again.');
                      } finally {
                        setIsCompleting(false);
                      }
                    }}>
                    <RoundedCheckIcon size={20} />
                    {isCompleting ? (
                      <ActivityIndicator color={COLORS.text} style={styles.modalOptionText} />
                    ) : (
                      <Text style={styles.modalOptionText}>{t('managePage.actions.acceptDelivery')}</Text>
                    )}
                   </TouchableOpacity>
                   <TouchableOpacity style={[styles.modalOption, {borderBottomWidth: 0}]} onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: '/(tabs)/message',
                      params: { userId: selectedPackage?.order.dropper?.id, userName: selectedPackage?.order.dropper?.name, userImage: selectedPackage?.order.dropper?.image, userMobile: selectedPackage?.order.dropper?.mobile, refresh: Date.now() }
                    });
                  }}>
                    <MessageIcon size={24} color={COLORS.text} />
                    <Text style={styles.modalOptionText}>{t('managePage.actions.sendMessage')}</Text>
                  </TouchableOpacity>
                  </>
                  )}
                  {selectedPackage?.order.status === 'ongoing' && (
                  <>
                  <TouchableOpacity style={styles.modalOption} onPress={() => {
                    setModalVisible(false);
                    setShouldOpenThird(true);
                    }}>
                    <RoundedCrossIcon size={20} />
                    <Text style={styles.modalOptionText}>{t('managePage.actions.cancelDelivery')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalOption, {borderBottomWidth: 0}]} onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: '/(tabs)/packageEdit',
                      params: { packageData: JSON.stringify(selectedPackage) }
                    });
                  }}>
                    <RoundedEditIcon size={20} />
                    <Text style={styles.modalOptionText}>{t('managePage.actions.editDelivery')}</Text>
                  </TouchableOpacity>
                  </>
                  )}
                  {selectedPackage?.order.status === 'completed' && (
                    <>
                    {!selectedPackage?.order.review_submitted ? (
                      <TouchableOpacity style={styles.modalOption} onPress={() => {
                        setModalVisible(false);
                        router.push({
                          pathname: '/review',
                          params: { orderData: JSON.stringify(selectedPackage) }
                        });
                      }}>
                        <RoundedEditIcon size={20} />
                        <Text style={styles.modalOptionText}>{t('managePage.actions.leaveReview')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.modalOption} 
                        onPress={() => {
                          setModalVisible(false);
                          setShouldOpenReviewModal(true);
                        }}
                      >
                        <RoundedEditIcon size={20} />
                        <Text style={styles.modalOptionText}>{t('managePage.actions.viewReview')}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.modalOption} 
                      onPress={() => {
                        setModalVisible(false);
                        setShouldOpenRiderReviewModal(true);
                      }}
                    >
                      <RoundedEditIcon size={20} />
                      <Text style={styles.modalOptionText}>{t('managePage.actions.viewRiderReview')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalOption, {borderBottomWidth: 0}]} onPress={() => {
                      setModalVisible(false);
                      router.push({
                        pathname: '/(tabs)/message',
                        params: { userId: selectedPackage?.order.dropper?.id, userName: selectedPackage?.order.dropper?.name, userImage: selectedPackage?.order.dropper?.image, userMobile: selectedPackage?.order.dropper?.mobile, refresh: Date.now() }
                      });
                    }}>
                      <MessageIcon size={24} color={COLORS.text} />
                      <Text style={styles.modalOptionText}>{t('managePage.actions.sendMessage')}</Text>
                    </TouchableOpacity>
                    </>
                  )}
                </View> 
              </View>
            </Modal>

            <Modal
              onSwipeComplete={() => setModalDeliveryCompletedVisible(false)}
              swipeDirection="down"
              isVisible={modalDeliveryCompletedVisible}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalDeliveryContainer}>
                <View style={styles.modalDeliveryContent}>
                  <View style={styles.iconContainer}>
                    <SuccessBadgeIcon />
                  </View>
                  <Text style={styles.modalDeliveryContentHeader}>{t('managePage.deliveryCompleted.title')}</Text>
                  <Text style={styles.modalDeliveryContentText}>{t('managePage.deliveryCompleted.message')}</Text>
                  <TouchableOpacity style={[styles.loginButton, { marginBottom: 14}]} onPress={() => {
                    setModalDeliveryCompletedVisible(false);
                    router.push({
                      pathname: '/review',
                      params: { orderData: JSON.stringify(selectedPackage) }
                    });
                    }}>
                    <Text style={styles.loginText}>{t('managePage.deliveryCompleted.leaveReview')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.loginButton, {backgroundColor: '#E6E6E6'}]} onPress={() => setModalDeliveryCompletedVisible(false)}>
                    <Text style={[styles.loginText, {color: COLORS.text}]}>{t('managePage.deliveryCompleted.maybeLater')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              onSwipeComplete={() => setModalCancelDeliveryVisible(false)}
              swipeDirection="down"
              isVisible={modalCancelDeliveryVisible}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalContainer}>
                <View style={[styles.modalContent, {paddingBottom: 24}]}>
                  <View style={[styles.modalToggleButton, {marginBottom: 24}]}></View>
                  <Text style={styles.modalTitle}>{t('managePage.cancelConfirmation.title')}</Text>
                  {/* Order Summary Card */}
                  <View style={styles.orderSummaryCard}>
                    <View style={styles.orderSummaryRow}>
                      <View style={styles.orderSummaryUserRow}>
                        {selectedPackage?.sender.image ? (
                        <Image 
                          source={selectedPackage?.sender.image ? { uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${selectedPackage.sender.image}` } : require('@/assets/img/profile-blank.png')} 
                          style={styles.userAvatar} 
                        />
                        ) : (
                          <View style={styles.userAvatar} />
                        )}
                        <View style={styles.orderSummaryUserColumn}>
                          <Text style={styles.orderSummaryUserName}>{selectedPackage?.pickup.name}</Text>
                          <View style={styles.orderSummaryPriceBox}>
                            <Text style={styles.orderSummaryPrice}>{currencyConfig.code} {selectedPackage?.price}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.pickupDetailsRow}>
                    <Text style={styles.pickupDetailsLabel}>{t('managePage.cancelConfirmation.from')}</Text>
                    <Text style={styles.pickupDetailsValue}>{selectedPackage?.pickup.address}</Text>
                  </View>
                  <View style={styles.pickupDetailsRow}>
                    <Text style={styles.pickupDetailsLabel}>{t('managePage.cancelConfirmation.to')}</Text>
                    <Text style={styles.pickupDetailsValue}>{selectedPackage?.drop.address}</Text>
                  </View>
                  <View style={styles.pickupDetailsRow}>
                    <Text style={styles.pickupDetailsLabel}>{t('managePage.cancelConfirmation.date')}</Text>
                    <Text style={styles.pickupDetailsValue}>{selectedPackage?.pickup.date} {selectedPackage?.pickup.time}</Text>
                  </View>

                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#E6E6E6'}]} onPress={() => setModalCancelDeliveryVisible(false)}>
                      <Text style={[styles.modalButtonText, {color: COLORS.text}]}>{t('managePage.cancelConfirmation.back')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.modalButton, 
                        { marginBottom: 14, backgroundColor: COLORS.danger},
                        isCanceling && { opacity: 0.7 }
                      ]} 
                      disabled={isCanceling}
                      onPress={async () => {
                        try {
                          setIsCanceling(true);
                          if (selectedPackage?.id) {
                              await packageService.cancelPackage(selectedPackage.id);
 
                              // here sender will get refund 
                              try {
                                await paymentService.requestRefund(selectedPackage.id, 'Package cancelled by sender');
                                console.log('Refund processed successfully');
                              } catch (refundError) {
                                console.error('Failed to process refund:', refundError);
                                // Don't show error to user as package is already cancelled
                                // Refund can be retried later if needed
                              }
 
                              await fetchPackages();
                            setModalCancelDeliveryVisible(false);
                            handlePress(3);
                          } else {
                            console.error('No package selected');
                            Alert.alert('Error', 'No package selected');
                            setModalCancelDeliveryVisible(false);
                          }
                        } catch (error) {
                          console.error('Failed to cancel delivery:', error);
                        } finally {
                          setIsCanceling(false);
                        }
                      }}>
                      {isCanceling ? (
                        <ActivityIndicator color={COLORS.buttonText} />
                      ) : (
                        <Text style={styles.modalButtonText}>{t('managePage.cancelConfirmation.confirmCancel')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </Modal>

            <Modal
              onSwipeComplete={() => setModalViewReviewVisible(false)}
              swipeDirection="down"
              isVisible={modalViewReviewVisible}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalToggleButton}></View>
                  <Text style={styles.modalTitle}>{t('review.viewTitle')}</Text>
                  
                  {/* Rider Profile */}
                  <View style={styles.senderProfileContainer}>
                    <View style={styles.senderProfileImageContainer}>
                      <Image 
                        source={riderReviewData?.reviewer?.image ? { uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${riderReviewData.reviewer.image}` } : require('@/assets/img/profile-blank.png')} 
                        style={styles.senderProfileImage} 
                      />
                    </View>
                    <View style={styles.senderProfileTextContainer}>
                      <Text style={styles.riderName}>{riderReviewData?.reviewer?.name}</Text>
                      <Text style={styles.riderLabel}>{t('review.rider')}</Text>
                    </View>
                  </View>

                  {/* Rating Display */}
                  <View style={styles.reviewRatingContainer}>
                    <Text style={styles.reviewLabel}>{t('review.yourRating')}</Text>
                    <View style={styles.reviewStarContainer}>
                      {Array(5).fill(0).map((_, index) => (
                        <StarIcon 
                          key={index}
                          width={40} 
                          height={40} 
                          color={index < (reviewData?.rating || 0) ? COLORS.primary : "#E6E6E6"} 
                        />
                      ))}
                    </View>
                  </View>

                  {/* Review Text */}
                  <View style={styles.reviewTextDisplayContainer}>
                    <Text style={styles.reviewLabel}>{t('review.yourReview')}</Text>
                    <Text style={styles.reviewTextDisplay}>{reviewData?.review_text}</Text>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity 
                    style={[styles.loginButton, { marginTop: 24 }]} 
                    onPress={() => setModalViewReviewVisible(false)}
                  >
                    <Text style={styles.loginText}>{t('review.close')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              onSwipeComplete={() => setModalViewRiderReviewVisible(false)}
              swipeDirection="down"
              isVisible={modalViewRiderReviewVisible}
              style={{ justifyContent: 'flex-end', margin: 0 }}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalToggleButton}></View>
                  <Text style={styles.modalTitle}>{t('review.viewRiderReviewTitle')}</Text>
                  
                  {/* Rider Profile */}
                  <View style={styles.senderProfileContainer}>
                    <View style={styles.senderProfileImageContainer}>
                      <Image 
                        source={riderReviewData?.reviewer?.image ? { uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${riderReviewData.reviewer.image}` } : require('@/assets/img/profile-blank.png')} 
                        style={styles.senderProfileImage} 
                      />
                    </View>
                    <View style={styles.senderProfileTextContainer}>
                      <Text style={styles.riderName}>{riderReviewData?.reviewer?.name}</Text>
                      <Text style={styles.riderLabel}>{t('review.rider')}</Text>
                    </View>
                  </View>

                  {/* Rating Display */}
                  <View style={styles.reviewRatingContainer}>
                    <Text style={styles.reviewLabel}>{t('review.riderRating')}</Text>
                    <View style={styles.reviewStarContainer}>
                      {Array(5).fill(0).map((_, index) => (
                        <StarIcon 
                          key={index}
                          width={40} 
                          height={40} 
                          color={index < (riderReviewData?.rating || 0) ? COLORS.primary : "#E6E6E6"} 
                        />
                      ))}
                    </View>
                  </View>

                  {/* Review Text */}
                  <View style={styles.reviewTextDisplayContainer}>
                    <Text style={styles.reviewLabel}>{t('review.riderReview')}</Text>
                    <Text style={styles.reviewTextDisplay}>{riderReviewData?.review_text}</Text>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity 
                    style={[styles.loginButton, { marginTop: 24 }]} 
                    onPress={() => setModalViewRiderReviewVisible(false)}
                  >
                    <Text style={styles.loginText}>{t('review.close')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 16,
  },
  leftArrow: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#55B086',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'nunito-bold',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 25,
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 0,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    padding: 4,
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
    marginTop: 24,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  emptyImage: {
    width: 189,
    height: 184,
  },
  messageHeader: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    lineHeight: 25,
    color: COLORS.text,
    marginTop: 32,
  },
  message: {
    fontFamily: 'nunito-regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: COLORS.text,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 22,
    color: COLORS.text,
  },
  sectionTag: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    position: 'relative',
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  info: {
    flex: 1,
    backgroundColor: 'rgba(238, 238, 238, 0.50)',
    padding: 10,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  name: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 22,
    color: COLORS.text,
  },
  location: {
    fontFamily: 'nunito-medium',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 16,
    color: COLORS.text,
    paddingVertical: 8,
  },
  distance: {
    fontFamily: 'nunito-semibold',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 22,
    color: COLORS.primary,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 25,
    color: COLORS.text,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.buttonBackground,
  },
  status: {
    fontFamily: 'nunito-semibold',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 25,
    color: COLORS.text,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.buttonBackground,
  },
  deliveryStatus: {
    fontFamily: 'nunito-semibold',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 25,
    color: '#55B086',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(85, 176, 134, 0.15)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 33,
    borderTopRightRadius: 33,
    paddingHorizontal: 30,
    paddingTop: 8,
    paddingBottom: 46,
  },
  modalToggleButton: {
    width: 50,
    height: 5,
    backgroundColor: '#E3E6EC',
    borderRadius: 16,
    marginBottom: 36,
    alignSelf: 'center',
  },
  modalOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center'
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-semibold',
    color: COLORS.text,
    letterSpacing: 0.2,
    lineHeight: 54,
    flex: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  mapPinContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dotLine: {
    height: 96,
    width: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#919191',
  },
  itemRowContainer: {
    flex: 1,
  },
  modalDeliveryContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalDeliveryContent: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 24,
    margin: 16,
    flexDirection: 'column',
    alignContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  modalDeliveryContentHeader: {
    textAlign: 'center',
    fontFamily: 'nunito-extrabold',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25,
    color: COLORS.primary,
    marginBottom: 18,
    marginTop: 28,
  },
  modalDeliveryContentText: {
    textAlign: 'center',
    fontFamily: 'nunito-regular',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 18,
    color: COLORS.text,
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: 'nunito-extrabold',
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 0.2,
    marginBottom: 32,
    textAlign: 'center',
  },
  modalButtonContainer: {
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalButtonText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
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
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    marginRight: 14,
  },
  orderSummaryUserColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  orderSummaryUserName: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
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
    marginBottom: 18,
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
  senderProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 238, 238, 0.50)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
  },
  senderProfileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
  },
  senderProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  senderProfileTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: 4,
  },
  riderLabel: {
    fontSize: 12,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    letterSpacing: 0.2,
  },
  reviewRatingContainer: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 14,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: 12,
  },
  reviewStarContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reviewTextDisplayContainer: {
    marginBottom: 8,
  },
  reviewTextDisplay: {
    backgroundColor: 'rgba(238, 238, 238, 0.50)',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'nunito-regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    letterSpacing: 0.2,
    minHeight: 100,
  },
});
