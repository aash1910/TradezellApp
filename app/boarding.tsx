import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
};

const SLIDES = [
  {
    key: '1',
    icon: 'leaf-outline' as const,
    title: 'Trade for a better planet',
    subtitle:
      'Tradezell is built for people who want to recycle, reuse, and trade — giving items a new life instead of adding waste.',
  },
  {
    key: '2',
    icon: 'layers-outline' as const,
    title: 'Swipe to discover',
    subtitle:
      "Browse listings near you. Swipe right if you like something. When the owner likes one of yours back, it's a match!",
  },
  {
    key: '3',
    icon: 'chatbubbles-outline' as const,
    title: 'Chat & arrange the trade',
    subtitle:
      'Once you match, chat directly to organise your exchange — no middleman, just two people making a deal.',
  },
];

const ROLES = [
  { key: 'trader', label: 'Trader', desc: 'I trade items — swap old for new!', icon: 'swap-horizontal-outline' as const },
  { key: 'seller', label: 'Seller', desc: 'I mainly sell items for money.', icon: 'pricetag-outline' as const },
  { key: 'buyer',  label: 'Buyer',  desc: "I'm looking to buy or receive items.", icon: 'bag-handle-outline' as const },
];

export default function BoardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>('trader');
  const listRef = useRef<FlatList>(null);
  const showRolePicker = currentIndex === SLIDES.length; // last step

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      listRef.current?.scrollToIndex({ index: next });
    } else if (currentIndex === SLIDES.length - 1) {
      setCurrentIndex(SLIDES.length);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('has_boarded', 'true');
    await AsyncStorage.setItem('pending_account_role', selectedRole);
    router.replace('/login');
  };

  if (showRolePicker) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Text style={styles.roleTitle}>How will you use{'\n'}Tradezell?</Text>
        <Text style={styles.roleSubtitle}>You can change this anytime in Settings.</Text>

        <View style={styles.roleList}>
          {ROLES.map(role => (
            <TouchableOpacity
              key={role.key}
              style={[styles.roleCard, selectedRole === role.key && styles.roleCardActive]}
              onPress={() => setSelectedRole(role.key)}>
              <Ionicons
                name={role.icon}
                size={28}
                color={selectedRole === role.key ? COLORS.primary : COLORS.textLight}
              />
              <View style={styles.roleCardText}>
                <Text style={[styles.roleCardTitle, selectedRole === role.key && styles.roleCardTitleActive]}>
                  {role.label}
                </Text>
                <Text style={styles.roleCardDesc}>{role.desc}</Text>
              </View>
              {selectedRole === role.key && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleGetStarted}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
          <Text style={styles.primaryBtnText}>
            {currentIndex < SLIDES.length - 1 ? 'Next' : 'Choose your role'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  slide:          { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle:     { width: 140, height: 140, borderRadius: 70, backgroundColor: '#D8F3DC', alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  slideTitle:     { fontSize: 26, fontFamily: 'NunitoBold', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  slideSubtitle:  { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  dots:           { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive:      { backgroundColor: COLORS.primary, width: 24 },
  footer:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  skipText:       { fontSize: 15, color: COLORS.textLight },
  primaryBtn:     { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', alignSelf: 'center', marginTop: 12 },
  primaryBtnText: { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 16 },
  roleTitle:      { fontSize: 26, fontFamily: 'NunitoBold', color: COLORS.text, textAlign: 'center', paddingHorizontal: 24 },
  roleSubtitle:   { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  roleList:       { flex: 1, paddingHorizontal: 20, gap: 12 },
  roleCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 14 },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: '#F0FFF4' },
  roleCardText:   { flex: 1 },
  roleCardTitle:  { fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.text },
  roleCardTitleActive: { color: COLORS.primary },
  roleCardDesc:   { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
});
