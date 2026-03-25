import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#2D6A4F', secondary: '#52B788', background: '#F8FAF9',
  white: '#FFFFFF', text: '#1B1B1B', textLight: '#6B7280', border: '#E5E7EB',
};

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data.status === 'success') setListing(res.data.listing);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleSwipe = async (direction: 'yes' | 'no') => {
    setSwiping(true);
    try {
      const res = await api.post(`/listings/${id}/swipe`, { direction });
      if (direction === 'yes' && res.data.matched) {
        const other = res.data.match?.other_user;
        const name = other ? `${other.first_name} ${other.last_name}` : 'Someone';
        Alert.alert('🎉 It\'s a Match!', `You and ${name} liked each other! Head to Chat to start talking.`,
          [{ text: 'Go to Chat', onPress: () => router.push('/conversations') }, { text: 'Stay here' }]
        );
      } else if (direction === 'yes') {
        Alert.alert('Liked!', 'We\'ll notify you if they like you back.');
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not submit swipe.');
    } finally { setSwiping(false); }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  );
  if (!listing) return (
    <View style={styles.center}><Text>Listing not found.</Text></View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{listing.title}</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/report', params: { type: 'listing', id: listing.id } })}>
          <Ionicons name="flag-outline" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {listing.images?.[0] ? (
          <Image source={{ uri: listing.images[0] }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="image-outline" size={72} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={[styles.typeBadge, listing.type === 'sell' ? styles.sellBadge : styles.tradeBadge]}>
              <Text style={styles.typeBadgeText}>{listing.type.toUpperCase()}</Text>
            </View>
          </View>

          {listing.price && (
            <Text style={styles.price}>{listing.currency} {listing.price}</Text>
          )}

          <View style={styles.metaRow}>
            {listing.condition && (
              <View style={styles.metaChip}><Text style={styles.metaChipText}>{listing.condition.replace('_', ' ')}</Text></View>
            )}
            {listing.category && (
              <View style={styles.metaChip}><Text style={styles.metaChipText}>{listing.category}</Text></View>
            )}
          </View>

          {listing.description ? (
            <Text style={styles.description}>{listing.description}</Text>
          ) : null}

          {listing.user && (
            <View style={styles.ownerRow}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.textLight} />
              <Text style={styles.ownerText}>
                {listing.user.first_name} {listing.user.last_name}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.nopeBtn]}
          onPress={() => handleSwipe('no')}
          disabled={swiping}>
          <Ionicons name="close" size={28} color="#EF4444" />
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => handleSwipe('yes')}
          disabled={swiping}>
          {swiping ? <ActivityIndicator color="#4ADE80" /> : (
            <>
              <Ionicons name="heart" size={28} color="#4ADE80" />
              <Text style={[styles.actionBtnText, { color: '#4ADE80' }]}>Like</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:    { flex: 1, fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.text, marginHorizontal: 10 },
  heroImage:      { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.72 },
  heroPlaceholder:{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.72, backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  body:           { padding: 20 },
  titleRow:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:          { flex: 1, fontSize: 22, fontFamily: 'NunitoBold', color: COLORS.text },
  typeBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  tradeBadge:     { backgroundColor: '#D1FAE5' },
  sellBadge:      { backgroundColor: '#FEF3C7' },
  typeBadgeText:  { fontSize: 11, fontFamily: 'NunitoBold', color: COLORS.text },
  price:          { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 6 },
  metaRow:        { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  metaChip:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6' },
  metaChipText:   { fontSize: 12, color: COLORS.textLight, textTransform: 'capitalize' },
  description:    { fontSize: 15, color: COLORS.text, lineHeight: 22, marginTop: 16 },
  ownerRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  ownerText:      { fontSize: 14, color: COLORS.textLight },
  actionBar:      { flexDirection: 'row', gap: 16, paddingHorizontal: 24, paddingTop: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  nopeBtn:        { borderColor: '#EF4444' },
  likeBtn:        { borderColor: '#4ADE80', backgroundColor: '#F0FFF4' },
  actionBtnText:  { fontSize: 15, fontFamily: 'NunitoBold' },
});
