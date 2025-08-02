import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LetterIcon } from '@/components/icons/LetterIcon';
import { LockIcon } from '@/components/icons/LockIcon';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { Picker } from '@react-native-picker/picker';
import { SelectArrowIcon } from '@/components/icons/SelectArrowIcon';
import { UserRoundedIcon } from '@/components/icons/UserRoundedIcon';
import { COUNTRIES } from '@/components/countries';
import { authService } from '@/services/auth.service';

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
  facebook: '#1877F2',
  google: '#DB4437',
};

const GENDERS = [
  'Male',
  'Female',
  'Other'
];

export default function LoginScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'nationality' | 'gender'>('nationality');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const nationalityInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams();
  const [mobile, setMobile] = useState(params.phone ? String(params.phone) : '');

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
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

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const openPicker = (type: 'nationality' | 'gender') => {
    try {
      // Blur any active input to prevent keyboard conflicts
      confirmPasswordInputRef.current?.blur();
      emailInputRef.current?.blur();
      passwordInputRef.current?.blur();
      firstNameInputRef.current?.blur();
      lastNameInputRef.current?.blur();
      
      setPickerType(type);
      setShowPicker(true);
    } catch (error) {
      console.error('Error opening picker:', error);
      Alert.alert('Error', 'Unable to open picker. Please try again.');
    }
  };

  const handlePickerChange = (value: string) => {
    try {
      if (pickerType === 'nationality') {
        setNationality(value);
      } else {
        setGender(value);
      }
    } catch (error) {
      console.error('Picker change error:', error);
      // Fallback to prevent crash
      if (pickerType === 'nationality') {
        setNationality('');
      } else {
        setGender('');
      }
    }
  };

  const getPickerTitle = () => {
    return pickerType === 'nationality' ? 'Nationality' : 'Gender';
  };

  const getPickerItems = () => {
    try {
      if (pickerType === 'nationality') {
        return [
          { label: 'Select Nationality', value: '' },
          ...COUNTRIES.map(country => ({ label: country, value: country }))
        ];
      } else {
        return [
          { label: 'Select Gender', value: '' },
          ...GENDERS.map(gender => ({ label: gender, value: gender }))
        ];
      }
    } catch (error) {
      console.error('Error getting picker items:', error);
      return [{ label: 'Error loading options', value: '' }];
    }
  };

  const getSelectedValue = () => {
    try {
      const value = pickerType === 'nationality' ? nationality : gender;
      return value || '';
    } catch (error) {
      console.error('Error getting selected value:', error);
      return '';
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!firstName.trim()) {
      errors.push('- First name is required');
    }
    if (!lastName.trim()) {
      errors.push('- Last name is required');
    }
    if (!email.trim()) {
      errors.push('- Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('- Please enter a valid email address');
    }
    if (!password) {
      errors.push('- Password is required');
    } else {
      // Validate password requirements
      if (password.length < 8) {
        errors.push('- Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('- Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('- Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('- Password must contain at least one number');
      }
    }
    if (password !== confirmPassword) {
      errors.push('- Passwords do not match');
    }
    if (!nationality) {
      errors.push('- Nationality is required');
    }
    if (!gender) {
      errors.push('- Gender is required');
    }

    if (errors.length > 0) {
      Alert.alert(
        'Validation Error',
        'Please fix the following errors:\n' + errors.join('\n')
      );
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      console.log('Starting registration process...');
      setIsLoading(true);
      
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      console.log('Making registration request...');
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        nationality,
        gender: gender.toLowerCase(),
        role: 'sender',
      };
      if (mobile) {
        payload.mobile = mobile;
      }
      const response = await authService.register(payload);
      
      console.log('Registration successful:', response);

      // Navigate to OTP verification
      Alert.alert('Registration successful', 'Please check your email for OTP verification');
      router.replace({
        pathname: '/otpVerification',
        params: { email: email.trim() }
      });
    } catch (err: any) {
      console.error('Registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Handle specific error cases
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Connection timed out. Please check your internet connection and try again.';
      } else if (err.response?.status === 422) {
        // Handle validation errors from the API
        const validationErrors: string[] = [];
        
        // Get errors from response data
        const responseData = err.response.data;
        console.log('Validation Response Data:', responseData);

        if (responseData?.errors && typeof responseData.errors === 'object') {
          // Loop through each error field
          Object.entries(responseData.errors).forEach(([field, fieldErrors]) => {
            // Handle both array and string error messages
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(error => {
                validationErrors.push(`- ${error}`);
              });
            } else if (typeof fieldErrors === 'string') {
              validationErrors.push(`- ${fieldErrors}`);
            }
          });

          console.log('Parsed Validation Errors:', validationErrors);
          errorMessage = validationErrors.join('\n');
        } else {
          errorMessage = responseData?.message || 'Invalid registration data';
        }
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message || 'Registration failed. Please try again.';
      }

      Alert.alert(
        'Registration Error',
        errorMessage
      );
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
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.appName}>Sign up</Text>
          <Text style={styles.tagline}>Create your account to get started</Text>
        </Animated.View>

        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <UserRoundedIcon size={20} color={COLORS.text} />
            <TextInput 
              ref={firstNameInputRef}
              placeholder="Name" 
              style={styles.input} 
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="name"
              autoCorrect={false}
              autoFocus={true}
              clearButtonMode="always"
              keyboardType="default"
              returnKeyType="next"
              onSubmitEditing={() => {
                lastNameInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <UserRoundedIcon size={20} color={COLORS.text} />
            <TextInput 
              placeholder="Name" 
              ref={lastNameInputRef}
              style={styles.input} 
              value={lastName}
              onChangeText={setLastName}
              autoComplete="name"
              clearButtonMode="always"
              keyboardType="default"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => {
                emailInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <LetterIcon size={20} color={COLORS.text} />
            <TextInput 
              placeholder="Email" 
              ref={emailInputRef}
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="off"
              keyboardType="email-address"
              clearButtonMode="always"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus();
              }}
            />
          </View>

          <Text style={styles.label}>Password</Text>
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

          <Text style={styles.label}>Nationality</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => openPicker('nationality')}
            activeOpacity={0.7}
          >
            <Text style={[styles.input, !nationality && { color: '#999' }]}>
              {nationality || 'Select Nationality'}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => openPicker('gender')}
            activeOpacity={0.7}
          >
            <Text style={[styles.input, !gender && { color: '#999' }]}>
              {gender || 'Select Gender'}
            </Text>
            <SelectArrowIcon size={20} color={COLORS.text} />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.doneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={getSelectedValue()}
                  onValueChange={handlePickerChange}
                  style={styles.modalPicker}
                  itemStyle={styles.pickerItem}
                >
                  {(() => {
                    try {
                      return getPickerItems().map((item, index) => (
                        <Picker.Item 
                          key={`${pickerType}-${index}`} 
                          label={item.label} 
                          value={item.value}
                          color={item.value === '' ? '#999' : COLORS.text}
                        />
                      ));
                    } catch (error) {
                      console.error('Error rendering picker items:', error);
                      return (
                        <Picker.Item 
                          key="error" 
                          label="Error loading options" 
                          value="" 
                          color="#999"
                        />
                      );
                    }
                  })()}
                </Picker>
              </View>
            </View>
          </Modal>
        </View>
        {isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.buttonText} />
              ) : (
                <Text style={styles.loginText}>Sign up</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
      {!isKeyboardVisible && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.buttonText} />
            ) : (
              <Text style={styles.loginText}>Sign up</Text>
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
    paddingTop: 47,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: HEADER_HEIGHT,
  },
  leftArrow: {
    width: 44,
    height: 44,
    marginBottom: 27,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'nunito-extrabold',
    color: COLORS.background,
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  form: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 46,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  title: {
    fontSize: 24,
    fontFamily: 'nunito-extrabold',
    letterSpacing: 0.2,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    letterSpacing: 0.2,
    marginBottom: 14,
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
    paddingVertical: 15,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    marginBottom: 28,
  },
  rememberText: {
    fontFamily: 'nunito-semibold',
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 5,
    flex: 1,
  },
  forgotLink: {
    marginLeft: 'auto',
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  picker: {
    flex: 1,
    fontFamily: 'nunito-medium',
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'transparent',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  cancelButton: {
    color: COLORS.subtitle,
    fontSize: 16,
    fontFamily: 'nunito-medium',
  },
  doneButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  modalPicker: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: 'nunito-medium',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  pickerItem: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    color: COLORS.text,
  },
});
