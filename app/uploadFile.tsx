import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { AddIcon } from '@/components/icons/AddIcon';
import Icon from 'react-native-vector-icons/Feather';
import api from '@/services/api';
import { authService } from '@/services/auth.service';
import { uploadService } from '@/services/upload.service';

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

export default function UploadFileScreen() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'id'>('id');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingId, setIsLoadingId] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const baseURLWithoutApi = (api.defaults.baseURL || '').replace('/api', '');

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
      }

      const user = await authService.getCurrentUser();
      if (user.image) {
        setProfileImage(user.image);
      }
      if (user.document) {
        setIdCardImage(user.document);
      }
    })();
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

  const takeProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoadingProfile(true);
        try {
          // Compress image before upload
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'profile');
          if (response.data.image) {
            setProfileImage(response.data.image);
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update profile image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      setShowImageOptions(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoadingProfile(true);
        try {
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'profile');
          if (response.data.image) {
            setProfileImage(response.data.image);
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update profile image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setShowImageOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoadingId(true);
        try {
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'id_card');
          if (response.data.document) {
            setIdCardImage(response.data.document);
            Alert.alert('Success', 'Passport/ID card image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update Passport/ID card image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setIsLoadingId(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setShowImageOptions(false);
    }
  };

  const takeIdCardPicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 1,
      });
      setShowImageOptions(false);
      if (!result.canceled) {
        setIsLoadingId(true);
        try {
          const compressedUri = await uploadService.compressImage(result.assets[0].uri);
          const response = await authService.uploadImage(compressedUri, 'id_card');
          if (response.data.document) {
            setIdCardImage(response.data.document);
            Alert.alert('Success', 'Passport/ID card image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update Passport/ID card image');
          }
        } catch (error: any) {
          Alert.alert('Error', error.message);
        } finally {
          setIsLoadingId(false);
        }
      }
      
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      setShowImageOptions(false);
    }
  };

  const openLegalModal = (title: string, content: string) => {
    setLegalContent({ title, content });
    setShowLegalModal(true);
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
          <Text style={styles.appName}>Document Upload</Text>
        </Animated.View>

        <View style={styles.form}>
          <Text style={styles.label}>Upload Passport/ID <Text style={styles.requiredRedStar}>*</Text></Text>
          <Text style={styles.labelSubtitle}>We're required to ask you for some documents to sign you as a sender. Documents scans and quality photos are accepted.</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => {
              setImageType('id');
              setShowImageOptions(true);
            }}
            disabled={isLoadingId}
          >
            {isLoadingId ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : idCardImage ? (
              <Image source={{ uri: `${baseURLWithoutApi}/${idCardImage}` }} style={styles.idCardImage} />
            ) : (
              <>
                <AddIcon size={15} color={COLORS.text} />
                <Text>Upload file</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Profile Picture <Text style={styles.requiredRedStar}>*</Text></Text>
          <Text style={styles.labelSubtitle}>Picture of you where you can clearly see your face without sunglasses or a hat. Please take the photo in a well lit place.</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => {
              setImageType('profile');
              setShowImageOptions(true);
            }}
            disabled={isLoadingProfile}
          >
            {isLoadingProfile ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : profileImage ? (
              <Image source={{ uri: `${baseURLWithoutApi}/${profileImage}` }} style={styles.profileImage} />
            ) : (
              <>
                <AddIcon size={15} color={COLORS.text} />
                <Text>Take photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.agreementContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && (
                <Icon name="check" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <Text 
                style={styles.linkText}
                onPress={() => openLegalModal(
                  'Terms of Use',
                  'Welcome to PiqDrop. By using our service, you agree to these Terms of Use. Please read them carefully.\n\n1. Service Description\nPiqDrop is a delivery service platform that connects users with delivery partners. We facilitate the delivery of items between users and delivery partners, but we are not a delivery service provider.\n\n2. User Accounts\nYou must be at least 18 years old to use PiqDrop. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information when creating your account.\n\n3. User Conduct\nYou agree to use PiqDrop only for lawful purposes and in accordance with these Terms. You will not:\n- Use the service for any illegal purposes\n- Harass, abuse, or harm others\n- Attempt to gain unauthorized access to any part of the service\n- Interfere with the proper working of the service\n\n4. Delivery Services\n- Delivery partners are independent contractors, not employees of PiqDrop\n- Delivery times are estimates and not guaranteed\n- You are responsible for providing accurate delivery information\n- We reserve the right to refuse service to anyone\n\n5. Payment Terms\n- All payments must be made through our approved payment methods\n- Prices are subject to change without notice\n- Additional fees may apply for special delivery requests\n- Refunds are subject to our refund policy\n\n6. Intellectual Property\nAll content, features, and functionality of PiqDrop are owned by us and are protected by copyright, trademark, and other intellectual property laws.\n\n7. Limitation of Liability\nPiqDrop is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.\n\n8. Modifications to Terms\nWe reserve the right to modify these terms at any time. We will notify users of any material changes via the app or email.\n\n9. Termination\nWe may terminate or suspend your access to PiqDrop immediately, without prior notice, for any breach of these Terms.\n\n10. Governing Law\nThese Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PiqDrop operates.\n\n11. Contact Information\nFor questions about these Terms, please contact our support team through the app or at support@piqdrop.com.'
                )}
              >
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => openLegalModal(
                  'Privacy Policy',
                  'Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.\n\n1. Information We Collect\nWe collect information that you provide directly to us, including but not limited to your name, email address, phone number, delivery addresses, and any other information you choose to provide.\n\n2. How We Use Your Information\nWe use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and our users. This includes processing your orders, communicating with you about your account, and sending you updates about our services.\n\n3. Information Sharing and Disclosure\nWe do not share your personal information with third parties except as described in this privacy policy. We may share your information with delivery partners, payment processors, and service providers who assist us in operating our platform.\n\n4. Data Security\nWe implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.\n\n5. Your Rights and Choices\nYou have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications and manage your privacy preferences through your account settings.\n\n6. Cookies and Tracking Technologies\nWe use cookies and similar tracking technologies to collect information about your browsing activities and preferences. This helps us improve your experience and provide personalized content.\n\n7. Children\'s Privacy\nOur services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.\n\n8. International Data Transfers\nYour information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in compliance with applicable data protection laws.\n\n9. Data Retention\nWe retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.\n\n10. Changes to This Policy\nWe may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.'
                )}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </View>
        {isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, (!agreedToTerms || !profileImage || !idCardImage) && styles.continueButtonDisabled]}
              onPress={() => {
                if (!profileImage && !idCardImage) {
                  Alert.alert('Error', 'Please upload both Passport/ID document and profile picture');
                  return;
                } else if (!profileImage) {
                  Alert.alert('Error', 'Please upload your profile picture');
                  return;
                } else if (!idCardImage) {
                  Alert.alert('Error', 'Please upload your Passport/ID document');
                  return;
                } else if (!agreedToTerms) {
                  Alert.alert('Error', 'Please agree to the Terms & Conditions and Privacy Policy');
                  return;
                }
                router.push('/(tabs)');
              }}
              disabled={!agreedToTerms || !profileImage || !idCardImage}
            >
              <Text style={styles.continueButtonText}>Tap to continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {!isKeyboardVisible && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              if (!profileImage && !idCardImage) {
                Alert.alert('Error', 'Please upload both Passport/ID document and profile picture');
                return;
              } else if (!profileImage) {
                Alert.alert('Error', 'Please upload your profile picture');
                return;
              } else if (!idCardImage) {
                Alert.alert('Error', 'Please upload your Passport/ID document');
                return;
              } else if (!agreedToTerms) {
                Alert.alert('Error', 'Please agree to the Terms & Conditions and Privacy Policy');
                return;
              }
              router.push('/(tabs)');
            }}
          >
            <Text style={styles.continueButtonText}>Tap to continue</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                console.log('pickImage called');
                if (imageType === 'profile') {
                  pickProfileImage();
                } else {
                  pickImage();
                }
              }}
            >
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                if (imageType === 'profile') {
                  takeProfilePicture();
                } else {
                  takeIdCardPicture();
                }
              }}
            >
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLegalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegalModal(false)}
      >
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalContainer}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>{legalContent.title}</Text>
              <TouchableOpacity 
                style={styles.legalModalCloseButton}
                onPress={() => setShowLegalModal(false)}
              >
                <Icon name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalModalContent} contentContainerStyle={styles.legalModalContentContainer}>
              <Text style={styles.legalModalText}>{legalContent.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 0,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  leftArrow: {
    width: 44,
    height: 44,
    marginBottom: 28,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'nunito-extrabold',
    color: COLORS.text,
    letterSpacing: 0.2,
    marginBottom: 0,
  },
  form: {
    flex: 1,
    paddingTop: 0,
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
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 28,
  },
  requiredRedStar: {
    color: 'red',
  },
  labelSubtitle: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    maxWidth: 139,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  idCardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
    padding: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
    textAlign: 'center',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelOptionText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: 'red',
    textAlign: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: 'nunito-bold',
    textDecorationLine: 'underline',
  },
  legalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  legalModalTitle: {
    fontSize: 20,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
  },
  legalModalCloseButton: {
    padding: 4,
  },
  legalModalContent: {
    padding: 20,
  },
  legalModalContentContainer: {
    paddingBottom: 48,
  },
  legalModalText: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: COLORS.text,
    lineHeight: 24,
  },
});
