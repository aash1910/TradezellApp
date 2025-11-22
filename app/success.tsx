import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
  inputBorder: '#EEEEEE',
  iconBackground: '#F0F0F0',
};

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 86) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.header}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} color={"#212121"} />
          </TouchableOpacity>
          <Image source={require('@/assets/img/congratulation-bg.png')} style={styles.logo} />
          <Text style={styles.appName}>Congratulations!</Text>
          <Text style={styles.tagline}>Registeration is successful.</Text>
        </Animated.View>
        <View style={styles.form}></View>
        {isKeyboardVisible && (
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.replace('/uploadFile')}
            >
              <Text style={styles.continueButtonText}>Tap to continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {!isKeyboardVisible && (
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.replace('/uploadFile')}
          >
            <Text style={styles.continueButtonText}>Tap to continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    paddingBottom: 86,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  leftArrow: {
    width: 44,
    height: 44,
    marginBottom: 37,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'nunito-extrabold',
    color: COLORS.text,
    letterSpacing: 0.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    color: COLORS.subtitle,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  logo: {
    width: 280,
    height: 301,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 45,
  },
  form: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 46,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
