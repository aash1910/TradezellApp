import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar,
  RefreshControl, ScrollView, Modal, Pressable,
} from 'react-native';
import { showAlert } from '@/utils/alertCompat';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import api from '@/services/api';
import { resolveListingImageUri } from '@/utils/images';

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
};

interface Listing {
  id: number; type: string; title: string; status: string;
  price: number | null; currency: string; images: string[]; condition: string; category: string;
}

const STATUS_OPTIONS = ['active', 'paused', 'sold', 'traded'] as const;

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
  const [statusPicker, setStatusPicker] = useState<{ id: number; status: string } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[COLORS.primary]}
      tintColor={COLORS.primary}
    />
  );

  const openStatusPicker = (id: number, status: string) => {
    setStatusPicker({ id, status });
  };

  const closeStatusPicker = () => {
    if (!updatingStatus) {
      setStatusPicker(null);
    }
  };

  const applyStatusChange = async (nextStatus: string) => {
    if (!statusPicker || nextStatus === statusPicker.status) {
      closeStatusPicker();
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.patch(`/listings/${statusPicker.id}/status`, { status: nextStatus });
      setListings(prev =>
        prev.map(l => (l.id === statusPicker.id ? { ...l, status: nextStatus } : l))
      );
      setStatusPicker(null);
    } catch {
      showAlert('Error', 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = (id: number) => {
    showAlert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/listings/${id}`);
            setListings(prev => prev.filter(l => l.id !== id));
          } catch { showAlert('Error', 'Failed to delete listing.'); }
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
            onPress={() => openStatusPicker(item.id, item.status)}>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
          <LeftArrowIcon size={44} />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.pageTitle}>My Listings</Text>
          {!loading && listings.length > 0 && (
            <Text style={styles.pageSubtitle}>
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.rightAction}
          onPress={() => router.push('/addListing')}
          accessibilityLabel="Add listing">
          <Ionicons name="add-circle-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
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

      <Modal
        visible={statusPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={closeStatusPicker}>
        <Pressable style={styles.statusModalOverlay} onPress={closeStatusPicker}>
          <Pressable
            style={[styles.statusModalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={styles.statusModalTitle}>Update Status</Text>
            <Text style={styles.statusModalSubtitle}>Choose a new status for this listing</Text>

            {STATUS_OPTIONS.map((option) => {
              const style = STATUS_STYLES[option];
              const isCurrent = statusPicker?.status === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.statusOption, isCurrent && styles.statusOptionCurrent]}
                  disabled={updatingStatus || isCurrent}
                  onPress={() => applyStatusChange(option)}>
                  <View style={[styles.statusOptionDot, { backgroundColor: style.color }]} />
                  <Text style={[styles.statusOptionText, isCurrent && styles.statusOptionTextCurrent]}>
                    {style.label}
                  </Text>
                  {isCurrent ? (
                    <Text style={styles.statusOptionBadge}>Current</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}

            {updatingStatus ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.statusUpdating} />
            ) : null}

            <TouchableOpacity
              style={styles.statusCancelBtn}
              onPress={closeStatusPicker}
              disabled={updatingStatus}>
              <Text style={styles.statusCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  leftArrow: {
    width: 44,
    height: 44,
    position: 'absolute',
    left: 16,
    top: 52,
  },
  rightAction: {
    width: 44,
    height: 44,
    position: 'absolute',
    right: 16,
    top: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 24,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 12,
    fontFamily: 'nunito-medium',
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.backgroundWrapper,
    paddingTop: 24,
  },
  loader: {
    marginTop: 60,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
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
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusModalCard: {
    width: '100%',
    maxWidth: 392,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusModalTitle: {
    fontSize: 18,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
    textAlign: 'center',
  },
  statusModalSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  statusOptionCurrent: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  statusOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NunitoBold',
    color: COLORS.text,
  },
  statusOptionTextCurrent: {
    color: COLORS.textLight,
  },
  statusOptionBadge: {
    fontSize: 11,
    fontFamily: 'NunitoBold',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusUpdating: {
    marginTop: 4,
    marginBottom: 4,
  },
  statusCancelBtn: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statusCancelText: {
    fontSize: 15,
    fontFamily: 'NunitoBold',
    color: COLORS.textLight,
  },
});
