import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

const COLORS = {
  primary: '#2D6A4F', background: '#F8FAF9', white: '#FFFFFF',
  text: '#1B1B1B', textLight: '#6B7280', border: '#E5E7EB', danger: '#EF4444',
};

export default function BlockedListScreen() {
  const insets = useSafeAreaInsets();
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // For MVP we show a placeholder — a full block list API can be added in V2
      setLoading(false);
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.empty}>
        <Ionicons name="ban-outline" size={60} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No blocked users</Text>
        <Text style={styles.emptySubtitle}>Users you block will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle:   { fontSize: 18, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 12 },
  emptySubtitle:{ fontSize: 14, color: COLORS.textLight, marginTop: 6 },
});
