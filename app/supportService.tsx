import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { openSupportChat, SUPPORT_CHAT_PARAMS } from '@/utils/openSupportChat';

/** Legacy route — forwards to the real support conversation screen. */
export default function SupportServiceScreen() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      openSupportChat({ replace: true });
      return;
    }

    router.navigate({
      pathname: '/(tabs)/message',
      params: {
        ...SUPPORT_CHAT_PARAMS,
        refresh: String(Date.now()),
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#55B086" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
