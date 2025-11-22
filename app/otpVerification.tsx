import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { authService } from '@/services/auth.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 207;

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

export default function OTPVerificationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    // Focus on first input field
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
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

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      await authService.resendOtp(email);
      
      // Clear all OTP fields
      setOtp(['', '', '', '']);
      
      // Focus on first input field
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);

      setTimeLeft(60);
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (err: any) {
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      // Handle Axios error response
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 4) {
        Alert.alert('Error', 'Please enter a valid 4-digit OTP');
        return;
      }

      setIsLoading(true);
      const response = await authService.verifyOtp(email, otpCode);
      
      console.log('OTP verification successful:', response);
      //Alert.alert('OTP verification successful', 'Please login to continue');
      router.replace('/success');
    } catch (err: any) {
      console.error('OTP verification error:', err);

      let errorMessage = 'OTP verification failed. Please try again.';
      
      // Handle Axios error response
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Verification Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.replace('/login')}>
            <LeftArrowIcon size={44} color={"#212121"} />
          </TouchableOpacity>
          <Image source={require('@/assets/img/otp-bg.png')} style={styles.logo} />
          <Text style={styles.appName}>OTP Verification</Text>
          <Text style={styles.tagline}>Please enter the One-Time Password (OTP) {'\n'}sent to {email}</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  if (ref) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                editable={!isLoading}
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive any code?</Text>
            <View style={styles.resendLinkContainer}>
              <TouchableOpacity 
                onPress={handleResend} 
                disabled={timeLeft > 0 || isLoading}
              >
                <Text style={[
                  styles.resendLink, 
                  (timeLeft > 0 || isLoading) && styles.resendLinkDisabled
                ]}>
                  Resend
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeLeftText}>
                {timeLeft > 0 && ` - ${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
              </Text>
            </View>
          </View>
        </View>
        {isKeyboardVisible && (
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.buttonText} />
              ) : (
                <Text style={styles.continueButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {!isKeyboardVisible && (
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.buttonText} />
            ) : (
              <Text style={styles.continueButtonText}>Verify OTP</Text>
            )}
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
  },
  tagline: {
    color: COLORS.subtitle,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  logo: {
    width: 280,
    height: 272,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  otpInput: {
    width: 74,
    height: 61,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    fontFamily: 'nunito-bold',
  },
  otpInputFocused: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(85, 176, 134, 0.08)',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  resendText: {
    fontFamily: 'nunito-semibold',
    fontSize: 14,
    color: COLORS.subtitle,
  },
  timeLeftText: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: COLORS.subtitle,
  },
  resendLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  resendLink: {
    color: COLORS.primary,
    fontFamily: 'nunito-bold',
  },
  resendLinkDisabled: {
    color: COLORS.subtitle,
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
  continueButtonDisabled: {
    opacity: 0.7,
  },
});
