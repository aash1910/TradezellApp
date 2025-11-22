import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { LetterIcon } from '@/components/icons/LetterIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { Package } from '@/services/packageList.service';
import api from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 120;

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

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [orderData, setOrderData] = useState<Package | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

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

  React.useEffect(() => {
    StatusBar.setBarStyle('dark-content'); 
  }, []);

  React.useEffect(() => {
    const orderData = JSON.parse(params.orderData as string);
    setOrderData(orderData);
  }, [params.orderData]);

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

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <TouchableOpacity 
        key={index} 
        onPress={() => handleStarPress(index + 1)}
        activeOpacity={0.7}
      >
        <StarIcon 
          width={49} 
          height={48} 
          color={index < rating ? COLORS.primary : "#E6E6E6"} 
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert(t('common.error'), t('review.validation.selectRating'));
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert(t('common.error'), t('review.validation.writeReview'));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/reviews', {
        order_id: orderData?.order?.id,
        reviewee_id: orderData?.order?.dropper?.id,
        rating: rating,
        review_text: reviewText.trim()
      });

      if (response.data.status === 'success') {
        Alert.alert(t('review.success.title'), t('review.success.message'));
        router.push('/(tabs)/manage');
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.message || error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 86, 86) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.push("/(tabs)/manage")}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('review.title')}</Text>
        </Animated.View>
        <View style={styles.form}>
          <View style={styles.senderProfileContainer}> 
            <View style={styles.senderProfileImageContainer}>
              <Image source={orderData?.order?.dropper?.image ? { uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${orderData.order.dropper.image}` } : require('@/assets/img/profile-blank.png')} style={styles.senderProfileImage} />
            </View>
            <View style={styles.senderProfileTextContainer}> 
              <Text style={styles.title}>{orderData?.order?.dropper?.name}</Text>
              <Text style={styles.subtitle}>{t('review.rider')}</Text>
              <Text style={styles.price}>{orderData?.price}</Text>
            </View>
          </View>
          <View style={styles.reviewTextContainer}> 
            <Text style={[styles.title, {textAlign: 'center'}]}>{t('review.experienceQuestion')}</Text>
            <View style={styles.reviewStarContainer}>
              {renderStars()}
            </View>
          </View>
          <Text style={styles.label}>{t('review.writeReview')}</Text> 
          <View style={styles.inputContainer}> 
            <TextInput 
              multiline={true}
              placeholder={t('review.enterReview')}
              style={styles.input}
              value={reviewText}
              onChangeText={setReviewText}
              onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
            /> 
          </View>
        </View>
        {isKeyboardVisible && (
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom + 22, 22) }]}>
            <TouchableOpacity 
              style={[styles.loginButton, {backgroundColor: '#E6E6E6'}]} 
              onPress={() => router.push('/(tabs)/manage')}
              disabled={isSubmitting}
            >
              <Text style={[styles.loginText, {color: COLORS.text}]}>{t('review.maybeLater')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.loginButton, { marginBottom: 14}]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.loginText}>{isSubmitting ? t('review.submitting') : t('review.submitReview')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>

      {!isKeyboardVisible && (
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom + 22, 22) }]}>
          <TouchableOpacity 
            style={[styles.loginButton, {backgroundColor: '#E6E6E6'}]} 
            onPress={() => router.push('/(tabs)/manage')}
            disabled={isSubmitting}
          >
            <Text style={[styles.loginText, {color: COLORS.text}]}>{t('review.maybeLater')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.loginButton, { marginBottom: 14}]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.loginText}>{isSubmitting ? t('review.submitting') : t('review.submitReview')}</Text>
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
    marginBottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    paddingBottom: 86,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  leftArrow: {
    width: 44,
    height: 44,
    position: 'absolute',
    left: 16,
    top: 52,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 44,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    marginTop: 18,
    fontFamily: 'nunito-bold',
    fontSize: 18,
    letterSpacing: 0.2,
    color: COLORS.text,
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    height: 96,
  },
  input: {
    paddingBottom: 16,
    fontFamily: 'nunito-regular',
    fontSize: 14,
    lineHeight: 16,
    color: "#000",
  },
  labelSubtitle: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.subtitle,
    marginBottom: 16,
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loginText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  senderProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
    marginVertical: 24,
  },
  senderProfileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
  },
  senderProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  senderProfileTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    letterSpacing: 0.2,
    marginBottom: 0,
  },
  price: {
    fontSize: 14,
    fontFamily: 'nunito-bold',
    lineHeight: 18,
    color: COLORS.text,
    letterSpacing: 0.2,
    marginTop: 16,
    marginBottom: 0,
    textAlign: 'right',
  },
  reviewTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
    marginVertical: 24,
  },
  reviewStarContainer:{
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  }
});
