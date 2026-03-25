import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

const COLORS = {
  primary: '#2D6A4F', secondary: '#52B788', background: '#F8FAF9',
  white: '#FFFFFF', text: '#1B1B1B', textLight: '#6B7280',
  border: '#E5E7EB', danger: '#EF4444',
};

interface Listing {
  id: number; type: string; title: string; status: string;
  price: number | null; currency: string; images: string[]; condition: string; category: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#4ADE80', paused: '#FBBF24', sold: '#60A5FA', traded: '#A78BFA',
};

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const res = await api.get('/listings/my');
          if (res.data.status === 'success') setListings(res.data.listings ?? []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      })();
    }, [])
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

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="image-outline" size={28} color={COLORS.textLight} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '25' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
              {item.status}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
        </View>
        {item.price && (
          <Text style={styles.price}>{item.currency} {item.price}</Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/addListing', params: { editId: item.id } })}>
          <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatusChange(item.id, item.status)} style={styles.actionSpacer}>
          <Ionicons name="toggle-outline" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity onPress={() => router.push('/addListing')}>
          <Ionicons name="add-circle-outline" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : listings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="albums-outline" size={64} color={COLORS.secondary} />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/addListing')}>
            <Text style={styles.addBtnText}>Add Your First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  thumb: { width: 80, height: 80 },
  thumbPlaceholder: { backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 10 },
  title: { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.text },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#F3F4F6' },
  badgeText: { fontSize: 11, color: COLORS.textLight, textTransform: 'capitalize' },
  price: { fontSize: 13, color: COLORS.primary, fontFamily: 'NunitoBold', marginTop: 4 },
  cardActions: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 },
  actionSpacer: { marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 12 },
  addBtn: { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  addBtnText: { color: COLORS.white, fontFamily: 'NunitoBold' },
});
