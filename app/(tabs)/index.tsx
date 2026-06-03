import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
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
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { resolveListingImageUri } from '@/utils/images';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 28;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.38;

const COLORS = {
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  accent: '#52B788',
  background: '#F0F4F2',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textOnImage: '#FFFFFF',
  like: '#22C55E',
  likeBg: '#DCFCE7',
  nope: '#EF4444',
  nopeBg: '#FEE2E2',
  border: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.72)',
  shadow: '#0F172A',
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

  const firstImage = listing.images?.[0] ? resolveListingImageUri(listing.images[0]) : null;
  const userImage = listing.user?.image ? resolveListingImageUri(listing.user.image) : null;
  const sellerName = [listing.user?.first_name, listing.user?.last_name].filter(Boolean).join(' ');
  const isSell = listing.type === 'sell';

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isTop) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotation.value = (e.translationX / SCREEN_WIDTH) * 14;
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

  const scale = 1 - index * 0.045;
  const yOffset = index * 12;

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
        {isTop && (
          <>
            <Animated.View style={[styles.stamp, styles.stampLike, likeOpacity]}>
              <Ionicons name="heart" size={22} color={COLORS.like} />
              <Text style={styles.stampLikeText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.stampNope, nopeOpacity]}>
              <Ionicons name="close" size={22} color={COLORS.nope} />
              <Text style={styles.stampNopeText}>PASS</Text>
            </Animated.View>
          </>
        )}

        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <View style={styles.placeholderIconWrap}>
              <Ionicons name="images-outline" size={40} color={COLORS.accent} />
            </View>
            <Text style={styles.placeholderText}>No photo</Text>
          </View>
        )}

        <View style={styles.imageFadeTop} pointerEvents="none" />

        <View style={styles.cardTopRow} pointerEvents="none">
          {listing.category ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {listing.category}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <View style={[styles.typePill, isSell ? styles.typePillSell : styles.typePillTrade]}>
            <Ionicons
              name={isSell ? 'pricetag' : 'swap-horizontal'}
              size={12}
              color={isSell ? '#B45309' : COLORS.primaryLight}
            />
            <Text style={[styles.typePillText, isSell ? styles.typePillTextSell : styles.typePillTextTrade]}>
              {listing.type}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottom} pointerEvents="none">
          <Text style={styles.cardTitle} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={styles.cardMetaRow}>
            {listing.condition ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{listing.condition}</Text>
              </View>
            ) : null}
            {listing.price != null && (
              <Text style={styles.cardPrice}>
                {listing.currency} {listing.price}
              </Text>
            )}
          </View>
          {sellerName ? (
            <View style={styles.sellerRow}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.sellerAvatar} />
              ) : (
                <View style={styles.sellerAvatarPlaceholder}>
                  <Ionicons name="person" size={14} color={COLORS.textOnImage} />
                </View>
              )}
              <Text style={styles.sellerName} numberOfLines={1}>
                {sellerName}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const ACTIONS_BOTTOM_GAP = 12;

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomChrome = tabBarHeight + ACTIONS_BOTTOM_GAP;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchModal, setMatchModal] = useState<{ name: string } | null>(null);
  const [likedToast, setLikedToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLikedToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setLikedToast(message);
    toastTimerRef.current = setTimeout(() => setLikedToast(null), 3200);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      try {
        setSwiping(true);
        const res = await api.post(`/listings/${listing.id}/swipe`, { direction: 'yes' });
        if (res.data.matched) {
          const otherName = res.data.match?.other_user
            ? `${res.data.match.other_user.first_name} ${res.data.match.other_user.last_name}`
            : 'Someone';
          setMatchModal({ name: otherName });
        } else {
          showLikedToast('Saved to Likes — we\'ll match you if they like your listings back');
        }
      } catch (e) {
        console.error('Swipe error:', e);
        setListings(prev => [listing, ...prev]);
        Alert.alert('Error', 'Could not save your like. Please try again.');
      } finally {
        setSwiping(false);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        await api.post(`/listings/${listing.id}/swipe`, { direction: 'no' });
      } catch (_) {}
    }
  };

  const handleButtonSwipe = (direction: 'yes' | 'no') => {
    if (!listings.length || swiping) return;
    if (direction === 'no') {
      const current = listings[0];
      const seller = current.user
        ? `${current.user.first_name} ${current.user.last_name}`.trim()
        : 'the seller';
      Alert.alert(
        'Pass on this listing?',
        `You're not interested in "${current.title}".\n\n• Hidden from Discover\n• Removed from Liked (if saved)\n• Match with ${seller} ended (if matched)`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Pass', style: 'destructive', onPress: () => handleSwipe('no') },
        ]
      );
      return;
    }
    handleSwipe('yes');
  };

  const remainingCount = listings.length;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>

        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Swipe to find trades near you</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.9}
              onPress={() => router.push('/addListing')}>
              <Ionicons name="add" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/filterScreen')}>
              <Ionicons name="options-outline" size={20} color={COLORS.primaryLight} />
            </TouchableOpacity>
          </View>
        </View>

        {!loading && listings.length > 0 && (
          <View style={styles.deckMeta}>
            <View style={styles.deckMetaPill}>
              <Ionicons name="layers-outline" size={14} color={COLORS.primaryLight} />
              <Text style={styles.deckMetaText}>
                {remainingCount} {remainingCount === 1 ? 'item' : 'items'} in deck
              </Text>
            </View>
          </View>
        )}

        <View style={styles.deckArea}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={COLORS.primaryLight} />
              <Text style={styles.loadingText}>Finding listings nearby…</Text>
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconRing}>
                <Ionicons name="compass-outline" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>You're all caught up</Text>
              <Text style={styles.emptySubtitle}>
                No listings nearby right now. Expand your radius in filters or check back soon.
              </Text>
              <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.9} onPress={fetchFeed}>
                <Ionicons name="refresh" size={18} color={COLORS.surface} />
                <Text style={styles.refreshBtnText}>Refresh feed</Text>
              </TouchableOpacity>
            </View>
          ) : (
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

        {!loading && listings.length > 0 && (
          <View style={[styles.actions, { paddingBottom: bottomChrome }]}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.nopeBtn]}
              activeOpacity={0.85}
              disabled={swiping}
              onPress={() => handleButtonSwipe('no')}>
              <Ionicons name="close" size={28} color={COLORS.nope} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.infoBtn]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/listingDetail', params: { id: listings[0].id } })}>
              <Ionicons name="information-circle" size={26} color={COLORS.primaryLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.likeBtn]}
              activeOpacity={0.85}
              disabled={swiping}
              onPress={() => handleButtonSwipe('yes')}>
              {swiping ? (
                <ActivityIndicator size="small" color={COLORS.like} />
              ) : (
                <Ionicons name="heart" size={28} color={COLORS.like} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {likedToast && (
        <TouchableOpacity
          style={[styles.likedToast, { bottom: bottomChrome + 80 }]}
          activeOpacity={0.92}
          onPress={() => {
            setLikedToast(null);
            router.push('/likes');
          }}>
          <View style={styles.toastIconWrap}>
            <Ionicons name="heart" size={18} color={COLORS.like} />
          </View>
          <Text style={styles.likedToastText}>{likedToast}</Text>
          <Text style={styles.likedToastLink}>View</Text>
        </TouchableOpacity>
      )}

      {matchModal && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <View style={styles.matchIconCircle}>
              <Ionicons name="heart" size={36} color={COLORS.surface} />
            </View>
            <Text style={styles.matchTitle}>It's a match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchModal.name} both liked each other's listings.
            </Text>
            <TouchableOpacity
              style={styles.matchChatBtn}
              activeOpacity={0.9}
              onPress={() => {
                setMatchModal(null);
                router.push('/conversations');
              }}>
              <Ionicons name="chatbubbles" size={20} color={COLORS.surface} />
              <Text style={styles.matchChatBtnText}>Message now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchModal(null)} hitSlop={12}>
              <Text style={styles.matchKeepText}>Keep discovering</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  headerTextBlock: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: 'Nunito',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  deckMeta: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  deckMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deckMetaText: {
    fontSize: 12,
    fontFamily: 'NunitoBold',
    color: COLORS.textMuted,
  },

  deckArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  loadingWrap: { alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14, color: COLORS.textMuted, fontFamily: 'Nunito' },

  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5EF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeholderIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 14, color: COLORS.textMuted, fontFamily: 'Nunito' },

  imageFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryPill: {
    maxWidth: '58%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typePillTrade: { backgroundColor: 'rgba(220, 252, 231, 0.95)' },
  typePillSell: { backgroundColor: 'rgba(254, 243, 199, 0.95)' },
  typePillText: { fontSize: 11, fontFamily: 'NunitoBold', textTransform: 'capitalize' },
  typePillTextTrade: { color: COLORS.primaryLight },
  typePillTextSell: { color: '#B45309' },

  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 48,
    backgroundColor: COLORS.overlay,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'NunitoBold',
    color: COLORS.textOnImage,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Nunito',
    textTransform: 'capitalize',
  },
  cardPrice: {
    fontSize: 17,
    fontFamily: 'NunitoBold',
    color: COLORS.accent,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  sellerAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  sellerAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Nunito',
    flex: 1,
  },

  stamp: {
    position: 'absolute',
    top: 48,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  stampLike: { left: 20, borderColor: COLORS.like, transform: [{ rotate: '-12deg' }] },
  stampNope: { right: 20, borderColor: COLORS.nope, transform: [{ rotate: '12deg' }] },
  stampLikeText: { fontSize: 22, fontFamily: 'NunitoBold', color: COLORS.like, letterSpacing: 1 },
  stampNopeText: { fontSize: 22, fontFamily: 'NunitoBold', color: COLORS.nope, letterSpacing: 1 },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  nopeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.nopeBg,
    borderWidth: 0,
  },
  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.likeBg,
  },
  infoBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyState: { alignItems: 'center', paddingHorizontal: 36 },
  emptyIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    marginTop: 20,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    fontFamily: 'Nunito',
  },
  refreshBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshBtnText: { color: COLORS.surface, fontFamily: 'NunitoBold', fontSize: 15 },

  likedToast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 50,
  },
  toastIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.likeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedToastText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18, fontFamily: 'Nunito' },
  likedToastLink: { fontSize: 13, fontFamily: 'NunitoBold', color: COLORS.primaryLight },

  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    paddingHorizontal: 24,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  matchIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  matchTitle: {
    fontSize: 26,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    marginTop: 12,
    letterSpacing: -0.3,
  },
  matchSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontFamily: 'Nunito',
  },
  matchChatBtn: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
  },
  matchChatBtnText: { color: COLORS.surface, fontFamily: 'NunitoBold', fontSize: 16 },
  matchKeepText: { marginTop: 16, color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito' },
});
