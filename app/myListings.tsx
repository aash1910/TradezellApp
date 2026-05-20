import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
  RefreshControl, ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { resolveListingImageUri } from '@/utils/images';

const COLORS = {
  primary: '#2D6A4F', secondary: '#52B788', background: '#F8FAF9',
  white: '#FFFFFF', text: '#1B1B1B', textLight: '#6B7280',
  border: '#E5E7EB', danger: '#EF4444',
};

interface Listing {
  id: number; type: string; title: string; status: string;
  price: number | null; currency: string; images: string[]; condition: string; category: string;
}

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: '#15803D', bg: '#DCFCE7', label: 'Active' },
  paused: { color: '#B45309', bg: '#FEF3C7', label: 'Paused' },
  sold: { color: '#1D4ED8', bg: '#DBEAFE', label: 'Sold' },
  traded: { color: '#7C3AED', bg: '#EDE9FE', label: 'Traded' },
};

function formatPrice(currency: string, price: number | null) {
  if (price == null) return null;
  return `${currency} ${Number(price).toLocaleString()}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) {
      setRefreshing(true);
    } else if (listings.length === 0) {
      setLoading(true);
    }

    try {
      const res = await api.get('/listings/my');
      if (res.data.status === 'success') setListings(res.data.listings ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      if (pullToRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [listings.length]);

  const onRefresh = useCallback(() => {
    fetchListings(true);
  }, [fetchListings]);

  useFocusEffect(
    useCallback(() => {
      fetchListings(false);
    }, [fetchListings])
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[COLORS.primary]}
      tintColor={COLORS.primary}
    />
  );

  const handleStatusChange = async (id: number, status: string) => {
    const options = ['active', 'paused', 'sold', 'traded'].filter(s => s !== status);
    Alert.alert('Update Status', 'Change listing status to:', [
      ...options.map(s => ({
        text: s.charAt(0).toUpperCase() + s.slice(1),
        onPress: async () => {
          try {
            await api.patch(`/listings/${id}/status`, { status: s });
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: s } : l));
          } catch { Alert.alert('Error', 'Failed to update status.'); }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/listings/${id}`);
            setListings(prev => prev.filter(l => l.id !== id));
          } catch { Alert.alert('Error', 'Failed to delete listing.'); }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.active;
    const priceLabel = formatPrice(item.currency, item.price);
    const imageCount = item.images?.length ?? 0;
    const isSell = item.type === 'sell';

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/addListing', params: { editId: String(item.id) } })}
          style={styles.cardMain}>
          <View style={styles.thumbWrap}>
            {item.images?.[0] ? (
              <Image
                source={{ uri: resolveListingImageUri(item.images[0]) }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
              </View>
            )}
            {imageCount > 1 && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images" size={10} color={COLORS.white} />
                <Text style={styles.imageCountText}>{imageCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
              </View>
            </View>

            <View style={styles.typeRow}>
              <View style={[styles.typeBadge, isSell ? styles.sellBadge : styles.tradeBadge]}>
                <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
              </View>
            </View>

            {(item.category || item.condition) ? (
              <View style={styles.detailRow}>
                {item.category ? (
                  <View style={[styles.detailChip, styles.categoryChip]}>
                    <Ionicons name="pricetag-outline" size={12} color={COLORS.primary} />
                    <Text style={[styles.detailChipText, styles.categoryChipText]} numberOfLines={1}>
                      {capitalize(item.category)}
                    </Text>
                  </View>
                ) : null}
                {item.condition ? (
                  <View style={[styles.detailChip, styles.conditionChip]}>
                    <Ionicons name="shield-checkmark-outline" size={12} color="#047857" />
                    <Text style={[styles.detailChipText, styles.conditionChipText]} numberOfLines={1}>
                      {capitalize(item.condition)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {priceLabel ? (
              <Text style={styles.price}>{priceLabel}</Text>
            ) : (
              <Text style={styles.noPrice}>No price set</Text>
            )}
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.border} style={styles.chevron} />
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/addListing', params: { editId: String(item.id) } })}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => handleStatusChange(item.id, item.status)}>
            <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.secondary} />
            <Text style={[styles.actionLabel, { color: COLORS.secondary }]}>Status</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={[styles.actionLabel, { color: COLORS.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Listings</Text>
          {!loading && listings.length > 0 && (
            <Text style={styles.headerCount}>
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/addListing')}>
          <Ionicons name="add-circle-outline" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : listings.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}>
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/addListing')}>
              <Text style={styles.addBtnText}>Add Your First Listing</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text },
  headerCount: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbWrap: { position: 'relative' },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#E8F4F0',
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imageCountBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageCountText: { fontSize: 10, color: COLORS.white, fontFamily: 'NunitoBold' },
  cardBody: { flex: 1, marginLeft: 12, minHeight: 96, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    lineHeight: 21,
  },
  chevron: { marginLeft: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: 'NunitoBold' },
  typeRow: { flexDirection: 'row', marginTop: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sellBadge: { backgroundColor: '#FEF3C7' },
  tradeBadge: { backgroundColor: '#D1FAE5' },
  typeBadgeText: { fontSize: 10, fontFamily: 'NunitoBold', color: COLORS.text },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    maxWidth: '100%',
  },
  categoryChip: {
    backgroundColor: '#E8F4F0',
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  conditionChip: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  detailChipText: { fontSize: 11, fontFamily: 'NunitoBold', flexShrink: 1 },
  categoryChipText: { color: COLORS.primary },
  conditionChipText: { color: '#047857' },
  price: { fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.primary, marginTop: 6 },
  noPrice: { fontSize: 13, color: COLORS.textLight, marginTop: 6, fontStyle: 'italic' },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FAFBFA',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionDivider: { width: 1, backgroundColor: COLORS.border },
  actionLabel: { fontSize: 13, fontFamily: 'NunitoBold' },
  emptyScroll: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 400 },
  emptyTitle: { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 12 },
  addBtn: { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  addBtnText: { color: COLORS.white, fontFamily: 'NunitoBold' },
});
