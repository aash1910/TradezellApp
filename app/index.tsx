import { View, Text, Image, StyleSheet, Dimensions, StatusBar, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import ParallaxScrollViewNormal from '@/components/ParallaxScrollViewNormal';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const HEADER_DELIVERY_HEIGHT = height / 100 * 22;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        
        // First, ensure minimum 3 second wait for users to read content
        await new Promise(resolve => setTimeout(resolve, 6000));
        
        // Then check user data if authenticated
        let user = null;
        if (isAuthenticated) {
          try {
            user = await authService.getUser();
          } catch (error) {
            console.error('Failed to get user data:', error);
            // If getUser fails, clear auth and redirect to login
            await authService.logout();
            router.replace('/login');
            return;
          }
        }
        
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
          //router.replace('/getStarted');
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        // Clear any invalid auth data
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('Logout error during auth check:', logoutError);
        }
        //router.replace('/getStarted');
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
    <View style={styles.container}>
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

      <ThemedView style={[styles.buttonBackgroundContainer, { paddingBottom: Math.max(insets.bottom, 28) }]}>
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={() => router.replace('/getStarted')}
        >
          <Text style={styles.buttonText}>Get started</Text>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none"> 
            <Path d="M7.5 15C7.5 15 12.5 11.3176 12.5 10C12.5 8.68233 7.5 5 7.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg> 
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
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
    marginBottom: 120,
    paddingHorizontal: 20,
  },
  stepText: {
    textAlign: 'center',
    color: '#212121',
    fontFamily: 'NunitoSemiBold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  buttonBackgroundContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 10,
    paddingHorizontal: 16,
    paddingBottom: 28,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: 54,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: '#55B086',   
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'NunitoBold',
    fontSize: 17, 
    letterSpacing: 0.2,
  },
});
