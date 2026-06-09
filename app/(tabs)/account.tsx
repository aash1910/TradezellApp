import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Modal,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showAlert } from '@/utils/alertCompat';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import ProfileLocationMap from '@/components/ProfileLocationMap';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { authService } from '@/services/auth.service';
import { openSupportChat } from '@/utils/openSupportChat';

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textSecondary: '#424242',
  subtitle: '#6B7280',
  divider: '#E5E7EB',
  danger: '#EF4444',
};

const ROLES = [
  { key: 'trader', label: 'Trader', icon: 'swap-horizontal-outline' as const },
  { key: 'seller', label: 'Seller', icon: 'pricetag-outline' as const },
  { key: 'buyer',  label: 'Buyer',  icon: 'bag-handle-outline' as const },
];

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_MAP_REGION: Region = {
  latitude: 23.8103,
  longitude: 90.4125,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Discovery settings (from PiqRider pattern)
  const [distance, setDistance] = useState(250);
  const [globalSearch, setGlobalSearch] = useState(true);
  const [enableDiscovery, setEnableDiscovery] = useState(true);
  const [discoveryLocationAddress, setDiscoveryLocationAddress] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  // Account role
  const [accountRole, setAccountRole] = useState('trader');

  const locationSnapshotRef = useRef({
    discoveryLocationAddress: '',
    newPlaceName: '',
    marker: null as { latitude: number; longitude: number } | null,
    region: null as Region | null,
  });
  const locationModalSessionRef = useRef(0);

  const openLocationModal = () => {
    locationSnapshotRef.current = {
      discoveryLocationAddress,
      newPlaceName,
      marker,
      region,
    };
    locationModalSessionRef.current += 1;
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    const snap = locationSnapshotRef.current;
    setDiscoveryLocationAddress(snap.discoveryLocationAddress);
    setNewPlaceName(snap.newPlaceName);
    setMarker(snap.marker);
    setRegion(snap.region);
    locationModalSessionRef.current += 1;
    setShowLocationModal(false);
  };

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      let u = null;
      try {
        u = await authService.getUser();
      } catch {
        u = await authService.getCurrentUser();
      }
      setUser(u);
      if (u?.settings) {
        const s = typeof u.settings === 'string' ? JSON.parse(u.settings) : u.settings;
        setDistance(s.max_distance ?? 250);
        setGlobalSearch(s.global_search ?? true);
        setEnableDiscovery(s.enable_discovery ?? true);
        setAccountRole(s.account_role ?? 'trader');
        if (s.discovery_location) {
          setNewPlaceName(s.discovery_location.name ?? '');
          setDiscoveryLocationAddress(s.discovery_location.address ?? '');
          const lat = s.discovery_location.latitude;
          const lng = s.discovery_location.longitude;
          if (lat != null && lng != null) {
            setMarker({ latitude: lat, longitude: lng });
            setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
          }
        }
      }
    } catch (e) {
      console.error('Load user error:', e);
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadUser(); }, [loadUser]));

  useEffect(() => {
    (async () => {
      if (region !== null) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRegion(DEFAULT_MAP_REGION);
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        const loc = lastKnown ?? await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (_) {
        setRegion(DEFAULT_MAP_REGION);
      }
    })();
  }, [region]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    try {
      const current = user?.settings
        ? (typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings)
        : {};
      const merged = { ...current, ...patch };
      const updatedUser = await authService.updateUserSettings(merged);
      if (updatedUser) setUser(updatedUser);
      await AsyncStorage.setItem('user_settings', JSON.stringify(merged));
    } catch (e) {
      console.error('Settings save error:', e);
      showAlert('Error', 'Failed to save settings.');
    }
  };

  const reverseGeocode = async (coords: { latitude: number; longitude: number }) => {
    if (Platform.OS !== 'web') {
      const geo = await Location.reverseGeocodeAsync(coords);
      return geo[0] ?? null;
    }

    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1` +
      `&lat=${coords.latitude}&lon=${coords.longitude}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    const address = data?.address ?? {};

    return {
      name: data?.name ?? '',
      street: address.road ?? address.pedestrian ?? address.footway ?? '',
      city: address.city ?? address.town ?? address.village ?? address.suburb ?? '',
      region: address.state ?? address.county ?? '',
      postalCode: address.postcode ?? '',
      country: address.country ?? '',
    };
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    const session = locationModalSessionRef.current;

    try {
      const place = await reverseGeocode(coords);
      if (session !== locationModalSessionRef.current) return;

      if (place) {
        const parts = [place.name, place.street, place.city, place.region, place.postalCode, place.country].filter(Boolean);
        setDiscoveryLocationAddress([...new Set(parts)].join(', '));
        setNewPlaceName(place.region ?? place.city ?? place.name ?? '');
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        setDiscoveryLocationAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (_) {
      if (session !== locationModalSessionRef.current) return;
      setDiscoveryLocationAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  };

  const handleSaveLocation = async () => {
    if (!marker) return;

    const locationData = {
      name: newPlaceName,
      address: discoveryLocationAddress,
      latitude: marker.latitude,
      longitude: marker.longitude,
    };
    setShowLocationModal(false);
    await saveSettings({ discovery_location: locationData });
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {}
    await AsyncStorage.multiRemove(['auth_token', 'user_settings']);
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    try {
      await api.delete('/account/delete');
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (e) {
      showAlert('Error', 'Failed to delete account. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const apiBase = (api.defaults.baseURL ?? '').replace('/api', '');
  const avatarUri = user?.image
    ? `${apiBase}/${user.image}${user.updated_at ? `?v=${encodeURIComponent(user.updated_at)}` : ''}`
    : null;
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your profile';
  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/updateProfile')}
          activeOpacity={0.85}>
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
          <View style={styles.profileChevron}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.subtitle} />
          </View>
        </TouchableOpacity>

        {/* Account Role */}
        <SectionHeader title="Account Role" />
        <View style={styles.roleRow}>
          {ROLES.map(role => (
            <TouchableOpacity
              key={role.key}
              style={[styles.roleBtn, accountRole === role.key && styles.roleBtnActive]}
              onPress={async () => {
                setAccountRole(role.key);
                await saveSettings({ account_role: role.key });
              }}>
              <Ionicons
                name={role.icon}
                size={18}
                color={accountRole === role.key ? COLORS.primary : COLORS.subtitle}
              />
              <Text style={[styles.roleBtnText, accountRole === role.key && styles.roleBtnTextActive]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Discovery section */}
        <SectionHeader title="Discovery" />

        {/* Location picker */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={openLocationModal}>
            <View style={styles.rowLeft}>
              <Ionicons name="location-outline" size={20} color={COLORS.text} />
              <Text style={styles.rowLabel} numberOfLines={1}>
                {discoveryLocationAddress || 'Add discovery location'}
              </Text>
            </View>
            <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Distance slider */}
        <View style={styles.distanceRow}>
          <Text style={styles.distanceLabel}>Max Distance</Text>
          <Text style={styles.distanceValue}>{distance} km</Text>
        </View>
        <View style={styles.sliderWrapper}>
          <Slider
            style={{ width: '100%' }}
            minimumValue={1}
            maximumValue={300}
            value={distance}
            onValueChange={(v) => setDistance(Math.round(v))}
            onSlidingComplete={(v) => saveSettings({ max_distance: Math.round(v) })}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.divider}
            thumbTintColor={COLORS.primary}
          />
        </View>

        {/* Global search toggle */}
        <SectionHeader title="Global Search" />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="globe-outline" size={20} color={COLORS.text} />
              <View>
                <Text style={styles.rowLabel}>Search worldwide</Text>
                <Text style={styles.rowSub}>Ignore distance radius</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: COLORS.primary, false: COLORS.divider }}
              value={globalSearch}
              onValueChange={(v) => { setGlobalSearch(v); saveSettings({ global_search: v }); }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="eye-outline" size={20} color={COLORS.text} />
              <View>
                <Text style={styles.rowLabel}>Show me in discovery</Text>
                <Text style={styles.rowSub}>Others can find your listings</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: COLORS.primary, false: COLORS.divider }}
              value={enableDiscovery}
              onValueChange={(v) => { setEnableDiscovery(v); saveSettings({ enable_discovery: v }); }}
            />
          </View>
        </View>

        {/* My Listings */}
        <SectionHeader title="My Items" />
        <View style={styles.card}>
          <MenuItem
            icon="albums-outline"
            label="My Listings"
            onPress={() => router.push('/myListings')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="add-circle-outline"
            label="Add New Listing"
            onPress={() => router.push('/addListing')}
          />
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.card}>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/updateProfile')} />
          <View style={styles.divider} />
          <MenuItem icon="help-circle-outline" label="FAQ" onPress={() => router.push('/faq')} />
          <View style={styles.divider} />
          <MenuItem icon="shield-checkmark-outline" label="Safety Centre" onPress={() => router.push('/safety')} />
          <View style={styles.divider} />
          <MenuItem icon="headset-outline" label="Support" onPress={() => openSupportChat()} />
        </View>

        {/* Danger zone */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <MenuItem
            icon="log-out-outline"
            label="Logout"
            onPress={() => setShowLogoutModal(true)}
            color={COLORS.danger}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="trash-outline"
            label="Delete Account"
            onPress={() => setShowDeleteModal(true)}
            color={COLORS.danger}
          />
        </View>
      </ScrollView>

      {/* Location picker modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        onRequestClose={closeLocationModal}>
        <View style={styles.modalContainer}>
          {region ? (
            <View style={styles.map}>
              <ProfileLocationMap
                region={region}
                marker={marker}
                onPress={(e: any) => {
                  const coords = e.nativeEvent.coordinate;
                  setMarker(coords);
                  handleMapPress(e);
                }}
              />
            </View>
          ) : (
            <View style={[styles.map, styles.center]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          <View style={[styles.mapBottomPanel, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.mapHint}>Tap the map to set your discovery location</Text>
            {discoveryLocationAddress ? (
              <View style={styles.locationPreview}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.locationName}>{newPlaceName}</Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>{discoveryLocationAddress}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.mapActionRow}>
              <TouchableOpacity
                style={styles.mapCloseBtn}
                onPress={closeLocationModal}
                accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !discoveryLocationAddress && styles.confirmBtnDisabled]}
                onPress={handleSaveLocation}
                disabled={!discoveryLocationAddress}>
                <Text style={styles.confirmBtnText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.overlayBg}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Logout?</Text>
            <Text style={styles.alertBody}>Are you sure you want to log out?</Text>
            <View style={styles.alertBtns}>
              <TouchableOpacity style={styles.alertCancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.alertDangerBtn} onPress={handleLogout}>
                <Text style={styles.alertDangerText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.overlayBg}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Delete Account?</Text>
            <Text style={styles.alertBody}>This action is permanent and cannot be undone. All your listings and matches will be removed.</Text>
            <View style={styles.alertBtns}>
              <TouchableOpacity style={styles.alertCancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.alertDangerBtn} onPress={handleDeleteAccount}>
                <Text style={styles.alertDangerText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function MenuItem({
  icon, label, onPress, color,
}: {
  icon: string; label: string; onPress: () => void; color?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={color ?? COLORS.text} />
        <Text style={[styles.rowLabel, color ? { color } : {}]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.subtitle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent:   { paddingHorizontal: 16 },
  profileCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  avatarRing:      { padding: 3, borderRadius: 38, borderWidth: 2, borderColor: COLORS.primary + '25' },
  avatar:          { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  avatarInitials:  { fontSize: 22, fontFamily: 'NunitoBold', color: COLORS.primary },
  profileInfo:     { flex: 1, marginLeft: 14, marginRight: 8 },
  profileName:     { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text },
  profileEmail:    { fontSize: 13, color: COLORS.subtitle, marginTop: 3 },
  profileChevron:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  roleRow:         { flexDirection: 'row', gap: 10, marginBottom: 4 },
  roleBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.divider, backgroundColor: COLORS.white },
  roleBtnActive:   { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  roleBtnText:     { fontSize: 13, color: COLORS.subtitle, fontFamily: 'NunitoBold' },
  roleBtnTextActive: { color: COLORS.primary },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  sectionTitle:    { fontSize: 13, fontFamily: 'NunitoBold', color: COLORS.subtitle, marginRight: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLine:     { flex: 1, height: 1, backgroundColor: COLORS.divider },
  card:            { backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  row:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 16, justifyContent: 'space-between' },
  rowLeft:         { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowLabel:        { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.text },
  rowSub:          { fontSize: 12, color: COLORS.subtitle, marginTop: 1 },
  divider:         { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 14 },
  distanceRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingHorizontal: 4 },
  distanceLabel:   { fontSize: 14, fontFamily: 'NunitoBold', color: COLORS.text },
  distanceValue:   { fontSize: 14, fontFamily: 'NunitoBold', color: COLORS.primary },
  sliderWrapper:   { paddingHorizontal: 4, marginBottom: 4 },
  menuItem:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 16 },
  // Modal
  modalContainer:  { flex: 1, backgroundColor: COLORS.white },
  map:             { flex: 1 },
  mapBottomPanel:  { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.divider },
  mapHint:         { textAlign: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, fontSize: 13, color: COLORS.subtitle },
  locationPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  locationName:    { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.text },
  locationAddress: { fontSize: 13, color: COLORS.subtitle, marginTop: 2 },
  mapActionRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 4 },
  mapCloseBtn:     { width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: COLORS.divider, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  confirmBtn:      { flex: 1, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText:  { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 16 },
  // Alert modals
  overlayBg:       { flex: 1, backgroundColor: '#00000060', alignItems: 'center', justifyContent: 'center' },
  alertCard:       { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '90%', maxWidth: 392 },
  alertTitle:      { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, textAlign: 'center' },
  alertBody:       { fontSize: 14, color: COLORS.subtitle, textAlign: 'center', marginTop: 8 },
  alertBtns:       { flexDirection: 'row', gap: 12, marginTop: 20 },
  alertCancelBtn:  { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.divider, alignItems: 'center' },
  alertCancelText: { fontFamily: 'NunitoBold', color: COLORS.text },
  alertDangerBtn:  { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.danger, alignItems: 'center' },
  alertDangerText: { fontFamily: 'NunitoBold', color: COLORS.white },
});
