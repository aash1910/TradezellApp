import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api, { API_ORIGIN } from '@/services/api';
import { resolveListingImageUri } from '@/utils/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = SCREEN_WIDTH * 0.88;
const THUMB_SIZE = 72;
const H_PAD = 20;

const COLORS = {
  primary: '#2D6A4F',
  primaryLight: '#D8F3DC',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  border: '#E8ECE9',
  like: '#22C55E',
  likeBg: '#ECFDF5',
  nope: '#EF4444',
  nopeBg: '#FEF2F2',
  sell: '#D97706',
  sellBg: '#FEF3C7',
  trade: '#059669',
  tradeBg: '#D1FAE5',
  cardShadow: '#0F172A14',
};

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveUserImageUri(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${API_ORIGIN.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
}

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setLoading(true);
    (async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data.status === 'success') setListing(res.data.listing);
        else setListing(null);
      } catch (e) {
        console.error(e);
        setListing(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const imageUris = useMemo(
    () => (listing?.images ?? []).map((img: string) => resolveListingImageUri(img)),
    [listing?.images]
  );

  const onGalleryScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  }, []);

  const scrollToImage = useCallback((index: number) => {
    setActiveImageIndex(index);
    galleryRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const renderGalleryImage = useCallback(
    ({ item }: { item: string }) => (
      <Image source={{ uri: item }} style={styles.gallerySlide} resizeMode="cover" />
    ),
    []
  );

  const handlePassPress = () => {
    const seller = listing.user
      ? `${listing.user.first_name} ${listing.user.last_name}`.trim()
      : 'the seller';
    Alert.alert(
      'Pass on this listing?',
      `You're not interested in "${listing.title}".\n\n• Hidden from Discover\n• Removed from Liked (if you saved it)\n• Match with ${seller} ended (if you were matched)`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pass', style: 'destructive', onPress: () => handleSwipe('no') },
      ]
    );
  };

  const handleSwipe = async (direction: 'yes' | 'no') => {
    setSwiping(true);
    try {
      const res = await api.post(`/listings/${id}/swipe`, { direction });
      if (direction === 'yes' && res.data.matched) {
        const other = res.data.match?.other_user;
        const name = other ? `${other.first_name} ${other.last_name}` : 'Someone';
        Alert.alert(
          "It's a Match!",
          `You and ${name} liked each other! Head to Chat to start talking.`,
          [
            { text: 'Go to Chat', onPress: () => router.push('/conversations') },
            { text: 'Stay here' },
          ]
        );
      } else if (direction === 'yes') {
        Alert.alert(
          'Liked!',
          'Saved to your Likes tab. We\'ll notify you if they like one of your listings back.'
        );
      } else if (direction === 'no') {
        const parts = ['Hidden from Discover.'];
        if (res.data.removed_like) parts.push('Removed from your Liked list.');
        if (res.data.unmatched) parts.push('Match ended.');
        Alert.alert('Passed', parts.join(' '));
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not submit swipe.');
    } finally {
      setSwiping(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading listing…</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyIconWrap}>
          <Ionicons name="search-outline" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Listing not found</Text>
        <Text style={styles.emptySub}>It may have been removed or is no longer available.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSell = listing.type === 'sell' || listing.type === 'both';
  const isTrade = listing.type === 'trade' || listing.type === 'both';
  const ownerName = listing.user
    ? `${listing.user.first_name} ${listing.user.last_name}`.trim()
    : 'Seller';
  const ownerImage = resolveUserImageUri(listing.user?.image);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        bounces>
        {/* Gallery */}
        <View style={styles.gallerySection}>
          {imageUris.length > 0 ? (
            <View style={styles.galleryWrap}>
              <FlatList
                ref={galleryRef}
                data={imageUris}
                keyExtractor={(_, index) => `gallery-${index}`}
                renderItem={renderGalleryImage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={imageUris.length > 1}
                onMomentumScrollEnd={onGalleryScrollEnd}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  galleryRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: true,
                  });
                }}
              />
              <View style={styles.galleryGradient} pointerEvents="none" />
              {imageUris.length > 1 && (
                <>
                  <View style={styles.imageCounter}>
                    <Ionicons name="images-outline" size={14} color={COLORS.white} />
                    <Text style={styles.imageCounterText}>
                      {activeImageIndex + 1}/{imageUris.length}
                    </Text>
                  </View>
                  <View style={styles.dotsRow}>
                    {imageUris.map((_: string, i: number) => (
                      <View
                        key={i}
                        style={[styles.dot, i === activeImageIndex && styles.dotActive]}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={64} color={COLORS.secondary} />
              <Text style={styles.placeholderText}>No photos</Text>
            </View>
          )}

          {/* Floating header */}
          <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.floatingBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() =>
                router.push({ pathname: '/report', params: { type: 'listing', id: listing.id } })
              }
              activeOpacity={0.85}>
              <Ionicons name="flag-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content sheet */}
        <View style={styles.contentSheet}>
          <View style={styles.badgeRow}>
            {isSell && (
              <View style={[styles.typePill, styles.sellPill]}>
                <Ionicons name="pricetag" size={13} color={COLORS.sell} />
                <Text style={[styles.typePillText, { color: COLORS.sell }]}>For Sale</Text>
              </View>
            )}
            {isTrade && (
              <View style={[styles.typePill, styles.tradePill]}>
                <Ionicons name="swap-horizontal" size={13} color={COLORS.trade} />
                <Text style={[styles.typePillText, { color: COLORS.trade }]}>Trade</Text>
              </View>
            )}
            {listing.status === 'active' && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Active</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.priceCard}>
            {listing.price ? (
              <>
                <Text style={styles.priceLabel}>Asking price</Text>
                <Text style={styles.price}>
                  <Text style={styles.priceCurrency}>{listing.currency || 'USD'} </Text>
                  {Number(listing.price).toLocaleString()}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.priceLabel}>Listing type</Text>
                <Text style={styles.priceTradeOnly}>Open to trade</Text>
              </>
            )}
          </View>

          {(listing.condition || listing.category) && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Details</Text>
              <View style={styles.detailGrid}>
                {listing.condition && (
                  <View style={styles.detailItem}>
                    <View style={[styles.detailIcon, { backgroundColor: COLORS.primaryLight }]}>
                      <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Condition</Text>
                      <Text style={styles.detailValue}>{formatLabel(listing.condition)}</Text>
                    </View>
                  </View>
                )}
                {listing.category && (
                  <View style={styles.detailItem}>
                    <View style={[styles.detailIcon, { backgroundColor: '#E0E7FF' }]}>
                      <Ionicons name="grid-outline" size={18} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{listing.category}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {imageUris.length > 1 && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>All photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbStrip}>
                {imageUris.map((uri: string, index: number) => (
                  <TouchableOpacity
                    key={uri + index}
                    activeOpacity={0.85}
                    onPress={() => scrollToImage(index)}
                    style={[styles.thumb, index === activeImageIndex && styles.thumbActive]}>
                    <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                    {index === activeImageIndex && (
                      <View style={styles.thumbOverlay}>
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {listing.description ? (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>About this item</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          ) : null}

          {listing.user && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Listed by</Text>
              <View style={styles.sellerRow}>
                {ownerImage ? (
                  <Image source={{ uri: ownerImage }} style={styles.sellerAvatar} />
                ) : (
                  <View style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}>
                    <Ionicons name="person" size={28} color={COLORS.secondary} />
                  </View>
                )}
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{ownerName}</Text>
                  <Text style={styles.sellerSub}>Tradezell member</Text>
                </View>
                <View style={styles.sellerBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action dock */}
      <View style={[styles.actionDock, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.actionDockInner}>
          <TouchableOpacity
            style={[styles.actionCircle, styles.nopeCircle]}
            onPress={handlePassPress}
            disabled={swiping}
            activeOpacity={0.85}>
            <Ionicons name="close" size={32} color={COLORS.nope} />
          </TouchableOpacity>

          <View style={styles.actionHint}>
            <Text style={styles.actionHintTitle}>Interested?</Text>
            <Text style={styles.actionHintSub}>Pass or save to your Likes</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionCircle, styles.likeCircle]}
            onPress={() => handleSwipe('yes')}
            disabled={swiping}
            activeOpacity={0.85}>
            {swiping ? (
              <ActivityIndicator color={COLORS.like} />
            ) : (
              <Ionicons name="heart" size={32} color={COLORS.like} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, paddingHorizontal: 32 },
  loadingText: { marginTop: 14, fontSize: 15, color: COLORS.textLight },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 15 },

  gallerySection: { position: 'relative', backgroundColor: '#0f172a' },
  galleryWrap: { width: SCREEN_WIDTH, height: GALLERY_HEIGHT, overflow: 'hidden' },
  gallerySlide: { width: SCREEN_WIDTH, height: GALLERY_HEIGHT },
  galleryGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  heroPlaceholder: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    backgroundColor: '#E8F4F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: { fontSize: 14, color: COLORS.textLight },

  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    zIndex: 10,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  imageCounter: {
    position: 'absolute',
    bottom: 72,
    right: H_PAD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 5,
  },
  imageCounterText: { color: COLORS.white, fontSize: 12, fontFamily: 'NunitoBold' },
  dotsRow: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 22, backgroundColor: COLORS.white },

  contentSheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.background,
    paddingTop: 24,
    paddingHorizontal: H_PAD,
    minHeight: 200,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sellPill: { backgroundColor: COLORS.sellBg },
  tradePill: { backgroundColor: COLORS.tradeBg },
  typePillText: { fontSize: 12, fontFamily: 'NunitoBold' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.like },
  liveText: { fontSize: 12, fontFamily: 'NunitoBold', color: COLORS.textLight },

  title: {
    fontSize: 26,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },

  priceCard: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  priceLabel: { fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8 },
  price: { fontSize: 28, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 4 },
  priceCurrency: { fontSize: 18, color: COLORS.secondary },
  priceTradeOnly: { fontSize: 22, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 4 },

  card: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 13,
    fontFamily: 'NunitoBold',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  detailGrid: { gap: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: { fontSize: 12, color: COLORS.textLight },
  detailValue: { fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 2 },

  thumbStrip: { gap: 10, paddingRight: 8 },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: COLORS.primary },
  thumbImage: { width: '100%', height: '100%' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,106,79,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  description: { fontSize: 16, color: COLORS.text, lineHeight: 24 },

  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 52, height: 52, borderRadius: 26 },
  sellerAvatarPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: { flex: 1, marginLeft: 14 },
  sellerName: { fontSize: 17, fontFamily: 'NunitoBold', color: COLORS.text },
  sellerSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  sellerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  actionDockInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nopeCircle: { backgroundColor: COLORS.nopeBg, borderWidth: 1.5, borderColor: '#FECACA' },
  likeCircle: { backgroundColor: COLORS.likeBg, borderWidth: 1.5, borderColor: '#BBF7D0' },
  actionHint: { alignItems: 'center', flex: 1, paddingHorizontal: 8 },
  actionHintTitle: { fontSize: 14, fontFamily: 'NunitoBold', color: COLORS.text },
  actionHintSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },
});
