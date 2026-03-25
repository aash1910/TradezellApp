import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth.service';

const PRIMARY = '#2D6A4F';

export default function WelcomeScreen() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    checkAndRoute();
  }, []);

  const checkAndRoute = async () => {
    try {
      const [isAuthenticated, hasBoarded] = await Promise.all([
        authService.isAuthenticated(),
        AsyncStorage.getItem('has_boarded'),
      ]);

      if (!hasBoarded) {
        router.replace('/boarding');
        return;
      }

      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Validate token still works
      try {
        const user = await authService.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        router.replace('/(tabs)');
      } catch {
        await authService.logout();
        router.replace('/login');
      }
    } catch {
      router.replace('/boarding');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
