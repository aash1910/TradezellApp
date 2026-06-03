import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { listingService, type LikedListing, type Listing } from '@/services/listing.service';
import { resolveListingImageUri } from '@/utils/images';

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  danger: '#EF4444',
  pending: '#F59E0B',
  pendingBg: '#FEF3C7',
};

interface Match {
  id: number;
  status: string;
  created_at: string;
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    image: string | null;
  } | null;
  context_listing?: Listing | null;
}

type SectionItem =
  | { kind: 'match'; data: Match }
  | { kind: 'liked'; data: LikedListing };

interface Section {
  key: string;
  title: string;
  subtitle: string;
  data: SectionItem[];
}

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>([]);
  const [liked, setLiked] = useState<LikedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState<number | null>(null);
  const [removingLike, setRemovingLike] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [matchesRes, likedItems] = await Promise.all([
        api.get('/matches'),
        listingService.getLikedListings(),
      ]);
      if (matchesRes.data.status === 'success') {
        setMatches(matchesRes.data.matches ?? []);
      }
      setLiked(likedItems);
    } catch (e) {
      console.error('Likes fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const handleUnmatch = (match: Match) => {
    const name = match.other_user
      ? `${match.other_user.first_name} ${match.other_user.last_name}`
      : 'this person';

    Alert.alert(
      'Unmatch',
      `End your match with ${name}? You can still see their listings in Discover unless you Pass. Chat history remains.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            setUnmatching(match.id);
            try {
              await api.delete(`/matches/${match.id}`);
              setMatches(prev => prev.filter(m => m.id !== match.id));
            } catch {
              Alert.alert('Error', 'Failed to unmatch. Please try again.');
            } finally {
              setUnmatching(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveLike = (item: LikedListing) => {
    Alert.alert(
      'Remove like',
      `Remove "${item.listing.title}" from your likes? It may show up in Discover again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingLike(item.listing.id);
            try {
              await listingService.unlikeListing(item.listing.id);
              setLiked(prev => prev.filter(l => l.listing.id !== item.listing.id));
            } catch {
              Alert.alert('Error', 'Failed to remove like. Please try again.');
            } finally {
              setRemovingLike(null);
            }
          },
        },
      ]
    );
  };

  const sections: Section[] = [];
  if (matches.length > 0) {
    sections.push({
      key: 'matches',
      title: 'Matches',
      subtitle: 'You both liked each other\'s listings — chat to connect',
      data: matches.map(m => ({ kind: 'match' as const, data: m })),
    });
  }
  if (liked.length > 0) {
    sections.push({
      key: 'liked',
      title: 'Liked',
      subtitle: 'You liked their item — waiting for them to like one of yours',
      data: liked.map(l => ({ kind: 'liked' as const, data: l })),
    });
  }

  const renderMatch = (item: Match) => {
    const other = item.other_user;
    const listing = item.context_listing;
    const name = other ? `${other.first_name} ${other.last_name}` : 'Unknown';
    const imageUri = listing?.images?.[0]
      ? resolveListingImageUri(listing.images[0])
      : null;

    const openListing = () => {
      if (listing?.id) {
        router.push({ pathname: '/listingDetail', params: { id: listing.id } });
      }
    };

    const openChat = () => {
      if (other) {
        router.push({
          pathname: '/(tabs)/message',
          params: {
            userId: String(other.id),
            userName: name,
            userImage: other.image || '',
            userMobile: '',
          },
        });
      }
    };

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.rowMain}
          activeOpacity={0.7}
          onPress={listing ? openListing : openChat}>
          {listing ? (
            imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.listingThumb} />
            ) : (
              <View style={[styles.listingThumb, styles.avatarPlaceholder]}>
                <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
              </View>
            )
          ) : other?.image ? (
            <Image source={{ uri: other.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={COLORS.textLight} />
            </View>
          )}

          <View style={styles.rowInfo}>
            {listing ? (
              <>
                <Text style={styles.rowTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{name}</Text>
                <Text style={styles.rowHint}>Tap for listing details</Text>
              </>
            ) : (
              <>
                <Text style={styles.rowTitle}>{name}</Text>
                <Text style={styles.rowSub}>Tap to start chatting</Text>
              </>
            )}
          </View>

          {listing && (
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} style={styles.rowChevron} />
          )}
        </TouchableOpacity>

        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={openChat}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleUnmatch(item)}
            disabled={unmatching === item.id}>
            {unmatching === item.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Ionicons name="close-circle-outline" size={22} color={COLORS.danger} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLiked = (item: LikedListing) => {
    const listing = item.listing;
    const owner = listing.user;
    const ownerName = owner
      ? `${owner.first_name} ${owner.last_name}`
      : 'Unknown';
    const imageUri = listing.images?.[0]
      ? resolveListingImageUri(listing.images[0])
      : null;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/listingDetail', params: { id: listing.id } })}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.listingThumb} />
        ) : (
          <View style={[styles.listingThumb, styles.avatarPlaceholder]}>
            <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>{listing.title}</Text>
          <Text style={styles.rowSub} numberOfLines={1}>{ownerName}</Text>
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={12} color={COLORS.pending} />
            <Text style={styles.pendingText}>Waiting for match</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleRemoveLike(item)}
          disabled={removingLike === listing.id}>
          {removingLike === listing.id ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Ionicons name="heart-dislike-outline" size={22} color={COLORS.danger} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: SectionItem }) =>
    item.kind === 'match' ? renderMatch(item.data) : renderLiked(item.data);

  const isEmpty = !loading && matches.length === 0 && liked.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Likes</Text>
        <Text style={styles.headerCount}>
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
          {liked.length > 0 ? ` · ${liked.length} liked` : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={72} color={COLORS.secondary} />
          <Text style={styles.emptyTitle}>No likes yet</Text>
          <Text style={styles.emptySubtitle}>
            Swipe right on Discover to save items here. When the owner likes one of your listings back, you'll match and can chat.
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push('/')}>
            <Text style={styles.discoverBtnText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          ListHeaderComponent={
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>Pass vs Like vs Match</Text>
                <Text style={styles.infoBody}>
                  <Text style={styles.infoBold}>Like</Text> — saves here until they like one of your listings back, then it becomes a Match.{'\n'}
                  <Text style={styles.infoBold}>Pass</Text> — not interested; hides from Discover and removes from Liked and Matches with that seller.{'\n'}
                  <Text style={styles.infoBold}>Unmatch</Text> — ends a Match only (chat stops); use Pass if you don&apos;t want to see their listings again.
                </Text>
              </View>
            </View>
          }
          sections={sections}
          keyExtractor={(item, index) =>
            item.kind === 'match'
              ? `match-${item.data.id}`
              : `liked-${item.data.listing.id}-${index}`
          }
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle:     { fontSize: 24, fontFamily: 'NunitoBold', color: COLORS.text },
  headerCount:     { fontSize: 13, color: COLORS.textLight },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8F3DC',
  },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 14, fontFamily: 'NunitoBold', color: COLORS.text, marginBottom: 6 },
  infoBody: { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },
  infoBold: { fontFamily: 'NunitoBold', color: COLORS.text },
  loader:          { marginTop: 60 },
  list:            { paddingHorizontal: 16, paddingBottom: 120 },
  sectionHeader:   { paddingTop: 8, paddingBottom: 10 },
  sectionTitle:    { fontSize: 17, fontFamily: 'NunitoBold', color: COLORS.text },
  sectionSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  sectionGap:      { height: 16 },
  row:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  rowMain:         { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rowChevron:      { marginRight: 4 },
  rowHint:         { fontSize: 11, color: COLORS.secondary, marginTop: 4 },
  avatar:          { width: 56, height: 56, borderRadius: 28 },
  listingThumb:    { width: 56, height: 56, borderRadius: 12 },
  avatarPlaceholder: { backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  rowInfo:         { flex: 1, marginLeft: 12 },
  rowTitle:        { fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.text },
  rowSub:          { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  rowActions:      { flexDirection: 'row', gap: 4 },
  iconBtn:         { padding: 8 },
  pendingBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start', backgroundColor: COLORS.pendingBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  pendingText:     { fontSize: 11, fontFamily: 'NunitoBold', color: COLORS.pending },
  separator:       { height: 10 },
  emptyState:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle:      { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 16 },
  emptySubtitle:   { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  discoverBtn:     { marginTop: 24, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  discoverBtnText: { color: COLORS.white, fontFamily: 'NunitoBold' },
});
