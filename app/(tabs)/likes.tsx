import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
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

const COLORS = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  background: '#F8FAF9',
  white: '#FFFFFF',
  text: '#1B1B1B',
  textLight: '#6B7280',
  danger: '#EF4444',
  border: '#E5E7EB',
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
}

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState<number | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/matches');
      if (res.data.status === 'success') {
        setMatches(res.data.matches ?? []);
      }
    } catch (e) {
      console.error('Matches fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [fetchMatches])
  );

  const handleUnmatch = (match: Match) => {
    const name = match.other_user
      ? `${match.other_user.first_name} ${match.other_user.last_name}`
      : 'this person';

    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${name}?`,
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
            } catch (e) {
              Alert.alert('Error', 'Failed to unmatch. Please try again.');
            } finally {
              setUnmatching(null);
            }
          },
        },
      ]
    );
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const other = item.other_user;
    const name = other ? `${other.first_name} ${other.last_name}` : 'Unknown';

    return (
      <TouchableOpacity
        style={styles.matchRow}
        activeOpacity={0.7}
        onPress={() => {
          if (other) {
            router.push({ pathname: '/message', params: { userId: other.id, name } });
          }
        }}>
        {other?.image ? (
          <Image source={{ uri: other.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={28} color={COLORS.textLight} />
          </View>
        )}

        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{name}</Text>
          <Text style={styles.matchSub}>Tap to start chatting</Text>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => {
              if (other) {
                router.push({ pathname: '/message', params: { userId: other.id, name } });
              }
            }}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.unmatchBtn}
            onPress={() => handleUnmatch(item)}
            disabled={unmatching === item.id}>
            {unmatching === item.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Ionicons name="close-circle-outline" size={22} color={COLORS.danger} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerCount}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={72} color={COLORS.secondary} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Swipe on items you like — when someone likes yours back, they'll appear here!
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push('/')}>
            <Text style={styles.discoverBtnText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle:  { fontSize: 24, fontFamily: 'NunitoBold', color: COLORS.text },
  headerCount:  { fontSize: 14, color: COLORS.textLight },
  loader:       { marginTop: 60 },
  list:         { paddingHorizontal: 16, paddingBottom: 120 },
  matchRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  avatar:       { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { backgroundColor: '#E8F4F0', alignItems: 'center', justifyContent: 'center' },
  matchInfo:    { flex: 1, marginLeft: 12 },
  matchName:    { fontSize: 16, fontFamily: 'NunitoBold', color: COLORS.text },
  matchSub:     { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  matchActions: { flexDirection: 'row', gap: 8 },
  chatBtn:      { padding: 8 },
  unmatchBtn:   { padding: 8 },
  separator:    { height: 10 },
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle:   { fontSize: 20, fontFamily: 'NunitoBold', color: COLORS.text, marginTop: 16 },
  emptySubtitle:{ fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
  discoverBtn:  { marginTop: 24, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  discoverBtnText:{ color: COLORS.white, fontFamily: 'NunitoBold' },
});
