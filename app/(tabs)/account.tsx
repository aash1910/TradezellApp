import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { authService } from '@/services/auth.service';

const { width } = Dimensions.get('window');

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

export default function AccountScreen() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Discovery settings (from PiqRider pattern)
  const [distance, setDistance] = useState(250);
  const [globalSearch, setGlobalSearch] = useState(false);
  const [enableDiscovery, setEnableDiscovery] = useState(true);
  const [discoveryLocationAddress, setDiscoveryLocationAddress] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [marker, setMarker] = useState({ latitude: 0, longitude: 0 });
  const [region, setRegion] = useState({ latitude: 0, longitude: 0, latitudeDelta: 0.05, longitudeDelta: 0.05 });

  // Account role
  const [accountRole, setAccountRole] = useState('trader');

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
      if (u?.settings) {
        const s = typeof u.settings === 'string' ? JSON.parse(u.settings) : u.settings;
        setDistance(s.max_distance ?? 250);
        setGlobalSearch(s.global_search ?? false);
        setEnableDiscovery(s.enable_discovery ?? true);
        setAccountRole(s.account_role ?? 'trader');
        if (s.discovery_location) {
          setNewPlaceName(s.discovery_location.name ?? '');
          setDiscoveryLocationAddress(s.discovery_location.address ?? '');
          setMarker({ latitude: s.discovery_location.latitude ?? 0, longitude: s.discovery_location.longitude ?? 0 });
        }
      }
    } catch (e) {
      console.error('Load user error:', e);
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadUser(); }, [loadUser]));

  useEffect(() => {
    if (showLocationModal) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
          }
        } catch (_) {}
      })();
    }
  }, [showLocationModal]);

  const saveSettings = async (patch: Record<string, unknown>) => {
    try {
      const current = user?.settings
        ? (typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings)
        : {};
      const merged = { ...current, ...patch };
      await api.post('/update-settings', { settings: merged });
      await AsyncStorage.setItem('user_settings', JSON.stringify(merged));
    } catch (e) {
      console.error('Settings save error:', e);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    try {
      const geo = await Location.reverseGeocodeAsync(coords);
      if (geo.length > 0) {
        const p = geo[0];
        const parts = [p.name, p.street, p.city, p.region, p.postalCode, p.country].filter(Boolean);
        setDiscoveryLocationAddress([...new Set(parts)].join(', '));
        setNewPlaceName(p.region ?? p.city ?? p.name ?? '');
      } else {
        setDiscoveryLocationAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (_) {}
  };

  const handleSaveLocation = async () => {
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
      Alert.alert('Error', 'Failed to delete account. Please try again.');
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
  const avatarUri = user?.image ? `${apiBase}/${user.image}` : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={36} color={COLORS.subtitle} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/updateProfile')}>
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity style={styles.row} onPress={() => setShowLocationModal(true)}>
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
          <MenuItem icon="headset-outline" label="Support" onPress={() => router.push('/supportService')} />
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
      <Modal visible={showLocationModal} animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Discovery Location</Text>
            <View style={{ width: 24 }} />
          </View>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}>
            {marker.latitude !== 0 && (
              <Marker coordinate={marker} />
            )}
          </MapView>
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
          <TouchableOpacity
            style={[styles.confirmBtn, !discoveryLocationAddress && styles.confirmBtnDisabled, { marginBottom: insets.bottom + 16 }]}
            onPress={handleSaveLocation}
            disabled={!discoveryLocationAddress}>
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </TouchableOpacity>
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
  avatar:          { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: { backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  profileInfo:     { flex: 1, marginLeft: 12 },
  profileName:     { fontSize: 17, fontFamily: 'NunitoBold', color: COLORS.text },
  profileEmail:    { fontSize: 13, color: COLORS.subtitle, marginTop: 2 },
  editBtn:         { padding: 8 },
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
  modalContainer:  { flex: 1, backgroundColor: COLORS.background },
  modalHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  modalTitle:      { fontSize: 17, fontFamily: 'NunitoBold', color: COLORS.text },
  map:             { flex: 1, minHeight: 320 },
  mapHint:         { textAlign: 'center', padding: 10, fontSize: 13, color: COLORS.subtitle },
  locationPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.divider },
  locationName:    { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.text },
  locationAddress: { fontSize: 13, color: COLORS.subtitle, marginTop: 2 },
  confirmBtn:      { marginHorizontal: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText:  { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 16 },
  // Alert modals
  overlayBg:       { flex: 1, backgroundColor: '#00000060', alignItems: 'center', justifyContent: 'center' },
  alertCard:       { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: width - 48 },
  alertTitle:      { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, textAlign: 'center' },
  alertBody:       { fontSize: 14, color: COLORS.subtitle, textAlign: 'center', marginTop: 8 },
  alertBtns:       { flexDirection: 'row', gap: 12, marginTop: 20 },
  alertCancelBtn:  { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.divider, alignItems: 'center' },
  alertCancelText: { fontFamily: 'NunitoBold', color: COLORS.text },
  alertDangerBtn:  { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.danger, alignItems: 'center' },
  alertDangerText: { fontFamily: 'NunitoBold', color: COLORS.white },
});
