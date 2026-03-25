import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.38;

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  like: '#4ADE80',
  nope: '#F87171',
  cardBg: '#FFFFFF',
  shadow: '#00000018',
};

interface Listing {
  id: number;
  type: string;
  title: string;
  description: string;
  condition: string;
  category: string;
  price: number | null;
  currency: string;
  images: string[];
  status: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    image: string | null;
  };
}

function SwipeCard({
  listing,
  onSwipe,
  isTop,
  index,
}: {
  listing: Listing;
  onSwipe: (direction: 'yes' | 'no') => void;
  isTop: boolean;
  index: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const firstImage = listing.images?.[0] ?? null;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isTop) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotation.value = (e.translationX / SCREEN_WIDTH) * 20;
    })
    .onEnd((e) => {
      if (!isTop) return;
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? 'yes' : 'no';
        const exitX = dir === 'yes' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        translateX.value = withTiming(exitX, { duration: 280 });
        opacity.value = withTiming(0, { duration: 280 }, () => {
          runOnJS(onSwipe)(dir);
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
    zIndex: 10 - index,
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const scale = 1 - index * 0.04;
  const yOffset = index * 10;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          !isTop && {
            transform: [{ scale }, { translateY: yOffset }],
            zIndex: 10 - index,
          },
        ]}>
        {/* Like / Nope overlays */}
        {isTop && (
          <>
            <Animated.View style={[styles.overlayLabel, styles.likeLabel, likeOpacity]}>
              <Text style={styles.likeText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.overlayLabel, styles.nopeLabel, nopeOpacity]}>
              <Text style={styles.nopeText}>NOPE</Text>
            </Animated.View>
          </>
        )}

        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={60} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
            <View style={[styles.typeBadge, listing.type === 'sell' ? styles.sellBadge : styles.tradeBadge]}>
              <Text style={styles.typeBadgeText}>{listing.type.toUpperCase()}</Text>
            </View>
          </View>
          {listing.condition && (
            <Text style={styles.cardCondition}>{listing.condition}</Text>
          )}
          {listing.price && (
            <Text style={styles.cardPrice}>{listing.currency} {listing.price}</Text>
          )}
          <Text style={styles.cardUser}>
            {listing.user?.first_name} {listing.user?.last_name}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchModal, setMatchModal] = useState<{ name: string } | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      let params: Record<string, string | number> = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          params.lat = loc.coords.latitude;
          params.lng = loc.coords.longitude;
        }
      } catch (_) {}

      const settingsStr = await AsyncStorage.getItem('user_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.max_distance) params.radius_km = settings.max_distance;
      }

      const response = await api.get('/listings/feed', { params });
      if (response.data.status === 'success') {
        setListings(response.data.listings.data ?? response.data.listings);
      }
    } catch (e) {
      console.error('Feed fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [fetchFeed])
  );

  const handleSwipe = async (direction: 'yes' | 'no') => {
    if (!listings.length) return;
    const listing = listings[0];
    const remaining = listings.slice(1);
    setListings(remaining);

    if (direction === 'yes') {
      try {
        setSwiping(true);
        const res = await api.post(`/listings/${listing.id}/swipe`, { direction: 'yes' });
        if (res.data.matched) {
          const otherName = res.data.match?.other_user
            ? `${res.data.match.other_user.first_name} ${res.data.match.other_user.last_name}`
            : 'Someone';
          setMatchModal({ name: otherName });
        }
      } catch (e) {
        console.error('Swipe error:', e);
      } finally {
        setSwiping(false);
      }
    } else {
      try {
        await api.post(`/listings/${listing.id}/swipe`, { direction: 'no' });
      } catch (_) {}
    }
  };

  const handleButtonSwipe = (direction: 'yes' | 'no') => {
    if (!listings.length) return;
    handleSwipe(direction);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tradezell</Text>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/filterScreen')}>
            <Ionicons name="options-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Card stack */}
        <View style={styles.deckArea}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : listings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={72} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>No more items nearby</Text>
              <Text style={styles.emptySubtitle}>Check back later or expand your search radius in Settings.</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchFeed}>
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show top 3 cards in a stack
            listings.slice(0, 3).map((listing, index) => (
              <SwipeCard
                key={listing.id}
                listing={listing}
                onSwipe={handleSwipe}
                isTop={index === 0}
                index={index}
              />
            ))
          )}
        </View>

        {/* Action buttons */}
        {!loading && listings.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.nopeBtn]}
              onPress={() => handleButtonSwipe('no')}>
              <Ionicons name="close" size={32} color={COLORS.nope} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.infoBtn]}
              onPress={() => router.push({ pathname: '/listingDetail', params: { id: listings[0].id } })}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.likeBtn]}
              onPress={() => handleButtonSwipe('yes')}>
              <Ionicons name="heart" size={32} color={COLORS.like} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add listing FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => router.push('/addListing')}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Match celebration modal */}
      {matchModal && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>You and {matchModal.name} liked each other.</Text>
            <TouchableOpacity
              style={styles.matchChatBtn}
              onPress={() => {
                setMatchModal(null);
                router.push('/conversations');
              }}>
              <Text style={styles.matchChatBtnText}>Start Chatting</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchModal(null)}>
              <Text style={styles.matchKeepText}>Keep swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: COLORS.background },
  container:  { flex: 1, backgroundColor: COLORS.background },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle:{ fontSize: 24, fontFamily: 'NunitoBold', color: COLORS.primary },
  headerIcon: { padding: 4 },
  deckArea:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loader:     { marginTop: 60 },
  card:       {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.56,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImage:        { width: '100%', height: '70%' },
  cardImagePlaceholder: { width: '100%', height: '70%', backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  cardInfo:         { padding: 14 },
  cardTitleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:        { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, flex: 1 },
  typeBadge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  tradeBadge:       { backgroundColor: '#D1FAE5' },
  sellBadge:        { backgroundColor: '#FEF3C7' },
  typeBadgeText:    { fontSize: 10, fontFamily: 'NunitoBold', color: COLORS.text },
  cardCondition:    { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  cardPrice:        { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 2 },
  cardUser:         { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  overlayLabel:     { position: 'absolute', top: 28, zIndex: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 3 },
  likeLabel:        { left: 20, borderColor: COLORS.like, transform: [{ rotate: '-20deg' }] },
  nopeLabel:        { right: 20, borderColor: COLORS.nope, transform: [{ rotate: '20deg' }] },
  likeText:         { fontSize: 28, fontFamily: 'NunitoBold', color: COLORS.like },
  nopeText:         { fontSize: 28, fontFamily: 'NunitoBold', color: COLORS.nope },
  actions:          { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 16 },
  actionBtn:        { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  nopeBtn:          { borderWidth: 1.5, borderColor: COLORS.nope + '50' },
  likeBtn:          { borderWidth: 1.5, borderColor: COLORS.like + '50' },
  infoBtn:          { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E7EB' },
  emptyState:       { alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle:       { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 16 },
  emptySubtitle:    { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
  refreshBtn:       { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshBtnText:   { color: COLORS.white, fontFamily: 'NunitoBold' },
  fab:              { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  matchOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000070', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  matchCard:        { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, alignItems: 'center', width: SCREEN_WIDTH - 48 },
  matchEmoji:       { fontSize: 52 },
  matchTitle:       { fontSize: 28, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 8 },
  matchSubtitle:    { fontSize: 15, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
  matchChatBtn:     { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center' },
  matchChatBtnText: { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 16 },
  matchKeepText:    { marginTop: 14, color: COLORS.textLight, fontSize: 14 },
});
