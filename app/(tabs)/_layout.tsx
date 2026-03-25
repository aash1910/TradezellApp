import { Tabs, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { calculateUnreadCount } from './conversations';
import api from '@/services/api';

const COLORS = {
  primary: '#2D6A4F',
  text: '#616161',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/conversations');
      if (response.data.status === 'success') {
        setUnreadCount(calculateUnreadCount(response.data.conversations));
      }
    } catch (_) {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  useEffect(() => {
    const env = Constants.expoConfig?.extra?.environment;
    if (env !== 'development') {
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'nunito-semibold',
          fontSize: 10,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: { height: 64, paddingTop: 4 },
        tabBarIconStyle: { width: 25, height: 25 },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 86 : insets.bottom + 64,
        },
      }}>

      {/* Home — swipe discovery deck */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Ionicons name="layers-outline" size={25} color={color} />
          ),
        }}
      />

      {/* Likes — mutual matches */}
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={25} color={color} />
          ),
        }}
      />

      {/* Chat — conversations */}
      <Tabs.Screen
        name="conversations"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/conversations');
          },
          focus: fetchUnreadCount,
        }}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={25} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount.toString() : undefined,
        }}
      />

      {/* Account — profile & settings */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={25} color={color} />
          ),
        }}
      />

      {/* Hidden tab screens (used as stack-like routes inside tabs) */}
      <Tabs.Screen name="message"      options={{ href: null }} />
      <Tabs.Screen name="notification" options={{ href: null }} />
    </Tabs>
  );
}
