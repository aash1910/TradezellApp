import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Alert, ActivityIndicator } from 'react-native';
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
        allowsEditing: true,
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
        allowsEditing: true,
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
        allowsEditing: true,
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
            Alert.alert('Success', 'ID card image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update ID card image');
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
        allowsEditing: true,
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
            Alert.alert('Success', 'ID card image updated successfully');
          } else {
            Alert.alert('Error', 'Failed to update ID card image');
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
          <Text style={styles.label}>Upload ID <Text style={styles.requiredRedStar}>*</Text></Text>
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
        </View>
        {isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.push('/success')}
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
                Alert.alert('Error', 'Please upload both ID document and profile picture');
                return;
              } else if (!profileImage) {
                Alert.alert('Error', 'Please upload your profile picture');
                return;
              } else if (!idCardImage) {
                Alert.alert('Error', 'Please upload your ID document');
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
    opacity: 0.7,
  },
});
