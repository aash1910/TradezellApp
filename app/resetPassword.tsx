import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { LockIcon } from '@/components/icons/LockIcon';
import { CircleIcon } from '@/components/icons/CircleIcon';
import { Feather } from '@expo/vector-icons';
import { authService } from '@/services/auth.service';

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

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const tokenInputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleResetPassword = async () => {
    // Validate all fields are filled
    if (!token || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate password requirements
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push('- Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('- Must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('- Must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('- Must contain at least one number');
    }

    if (passwordErrors.length > 0) {
      Alert.alert(
        'Invalid Password',
        'Password requirements:\n' + passwordErrors.join('\n')
      );
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({
        token: token.trim(),
        password,
        password_confirmation: confirmPassword,
        email: email || ''
      });
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.token?.[0] || 
                         error.response?.data?.message ||
                         error.message || 
                         'Failed to reset password. Please try again.';
      Alert.alert('Error', errorMessage);
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.header}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} color={"#212121"} />
          </TouchableOpacity>
          <Text style={styles.appName}>Reset your password </Text>
        </Animated.View>
        <View style={styles.form}>
          <Text style={styles.label}>Token</Text> 
          <View style={styles.inputContainer}> 
            <CircleIcon size={20} color={COLORS.text} />
            <TextInput 
              ref={tokenInputRef}
              placeholder="Enter Token" 
              style={styles.input} 
              keyboardType="default" 
              value={token}
              onChangeText={setToken}
              autoComplete="off"
              importantForAutofill="no"
              textContentType="oneTimeCode"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus();
              }}
            /> 
          </View>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <LockIcon size={20} color={COLORS.text} />
            <TextInput 
              ref={passwordInputRef} 
              placeholder="Password" 
              style={styles.input} 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="off"
              importantForAutofill="no"
              textContentType="oneTimeCode"
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordInputRef.current?.focus();
              }}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Feather 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={COLORS.text} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.inputContainer}>
            <LockIcon size={20} color={COLORS.text} />
            <TextInput 
              ref={confirmPasswordInputRef}
              placeholder="Confirm password" 
              style={styles.input} 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="off"
              importantForAutofill="no"
              textContentType="oneTimeCode"
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
              <Feather 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color={COLORS.text} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.labelSubtitle}>Enter the new password for your account.</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.buttonText} />
            ) : (
              <Text style={styles.continueButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
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
    paddingBottom: 16,
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
    marginBottom: 0,
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
  label: {
    marginTop: 18,
    fontFamily: 'nunito-bold',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: Platform.OS === 'android' ? 0 : 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 14,
    height: 54,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    color: COLORS.text,
  },
  labelSubtitle: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
    marginBottom: 0,
    marginTop: 16,
  },
});
