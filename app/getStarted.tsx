import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import ParallaxScrollViewNormal from '@/components/ParallaxScrollViewNormal';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import React, { useEffect } from 'react';

const { width, height } = Dimensions.get('window');
const HEADER_DELIVERY_HEIGHT = height / 100 * 25;

export default function GetStartedScreen() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <ParallaxScrollViewNormal
      headerBackgroundColor={{ light: '#55B086', dark: '#4CAF8C' }}
      curveHeight={height / 100 * 11.7}
      headerImage={
        <Image
          source={require('@/assets/img/delivery-man-bg.png')} 
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>Manage with ease</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="default" style={styles.stepText}> 
          Stay updated and manage your {'\n'}delivery seamlessly from pickup to {'\n'}delivery.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonBackgroundContainer}>
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.buttonText}>Login</Text>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none"> 
            <Path d="M7.5 15C7.5 15 12.5 11.3176 12.5 10C12.5 8.68233 7.5 5 7.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg> 
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollViewNormal>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 37,
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
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 37,
    backgroundColor: '#F5F5F5',
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
