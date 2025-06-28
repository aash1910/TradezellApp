import { View, Text, Image, StyleSheet, Dimensions, StatusBar, ActivityIndicator, Alert } from 'react-native';
import ParallaxScrollViewNormal from '@/components/ParallaxScrollViewNormal';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

const { width, height } = Dimensions.get('window');
const HEADER_DELIVERY_HEIGHT = height / 100 * 22;

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        
        // Run the timer and API call concurrently, ensuring minimum 3 second wait
        const [_, user] = await Promise.all([
          new Promise(resolve => setTimeout(resolve, 3000)),
          isAuthenticated ? authService.getUser().catch(() => null) : null
        ]);
        
        //setShowContent(false);
        
        if (isAuthenticated && user) {
          if( user.is_verified == 0 ) {
            router.replace('/login');
          }
          else if( user.image == null || user.document == null ) {
            router.replace('/login');
          }
          else {
            router.replace('/(tabs)');
          }
        } else {
          // User needs to go through onboarding
          router.replace('/getStarted');
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        // Clear any invalid auth data
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('Logout error during auth check:', logoutError);
        }
        router.replace('/getStarted');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (!showContent) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.loadingLogo}
        />
        <ActivityIndicator 
          size="large" 
          color="#55B086" 
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  return (
    <ParallaxScrollViewNormal
      headerBackgroundColor={{ light: '#55B086', dark: '#4CAF8C' }}
      curveHeight={height / 100 * 14.7}
      headerImage={
        <Image
          source={require('@/assets/img/delivery-bg.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>Effortless Global{'\n'}Delivery</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="default" style={styles.stepText}> 
          Send your package anywhere in the {'\n'}world through travellers and {'\n'}freelancers with just a few clicks. {'\n'}Quick and easy.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollViewNormal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  loadingSpinner: {
    marginTop: 20,
  },
  headerImage: {
    height: HEADER_DELIVERY_HEIGHT,
    width: '100%',
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  titleText: {
    color: '#55B086',
    textAlign: 'center',
    fontFamily: 'NunitoExtraBold',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.2,
  },
  stepContainer: {
    backgroundColor: '#F5F5F5',
    gap: 8,
    marginBottom: 8,
  },
  stepText: {
    textAlign: 'center',
    color: '#212121',
    fontFamily: 'NunitoSemiBold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
