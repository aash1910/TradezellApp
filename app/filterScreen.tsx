import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  primary: '#2D6A4F', background: '#F8FAF9', white: '#FFFFFF',
  text: '#1B1B1B', textLight: '#6B7280', border: '#E5E7EB',
};

const CONDITIONS = ['', 'new', 'like_new', 'good', 'fair', 'poor'];
const CATEGORIES = ['', 'Clothing', 'Shoes', 'Electronics', 'Books', 'Furniture', 'Jewellery', 'Sports', 'Toys', 'Art', 'Other'];

export default function FilterScreen() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');

  const handleApply = () => {
    router.back();
    // The Discover screen reads these from navigation params or AsyncStorage on focus
  };

  const handleReset = () => {
    setType(''); setCondition(''); setCategory('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Listings</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Listing Type</Text>
        <View style={styles.chipsRow}>
          {[['', 'All'], ['trade', 'Trade'], ['sell', 'Sell']].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, type === val && styles.chipActive]}
              onPress={() => setType(val)}>
              <Text style={[styles.chipText, type === val && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Condition</Text>
        <View style={styles.chipsRow}>
          {CONDITIONS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, condition === c && styles.chipActive]}
              onPress={() => setCondition(c)}>
              <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>
                {c === '' ? 'Any' : c.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c === '' ? 'All' : c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:    { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text },
  resetText:      { fontSize: 14, color: COLORS.primary },
  body:           { padding: 20, paddingBottom: 40 },
  sectionTitle:   { fontSize: 15, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  chipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 13, color: COLORS.textLight, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontFamily: 'NunitoBold' },
  footer:         { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  applyBtn:       { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  applyBtnText:   { color: COLORS.white, fontFamily: 'NunitoBold', fontSize: 16 },
});
