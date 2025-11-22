import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';

const HEADER_HEIGHT = 120;

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#424242',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
};
let tabWidth = 0;

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [user, setUser] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const translateX = useSharedValue(0);

  const TABS = [t('safety.tabs.guide'), t('safety.tabs.tools')];
  const screenWidth = Dimensions.get('window').width;
  tabWidth = useMemo(() => (screenWidth - 32 - 8) / TABS.length, [screenWidth, TABS.length]);

  const handlePress = (index: number) => {
    setActiveTab(index);
    translateX.value = withTiming(index * tabWidth, { duration: 200 });
  };

  const animatedTabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

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

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    getUser();
  }, []);

  const getUser = async () => {
    const user = await authService.getCurrentUser();
    setUser(user);
  };

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (Platform.OS === 'android' ? insets.bottom : 0) }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl enabled={false} refreshing={false} onRefresh={() => {}} />}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('safety.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.senderProfileContainer}> 
            <View style={styles.senderProfileImageContainer}>
              {user?.image ? (
                <Image source={{ uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${user?.image}` }} style={styles.senderProfileImage} />
              ) : (
                <Image source={require('@/assets/img/profile-blank.png')} style={styles.senderProfileImage} />
              )}
            </View>
            <View style={styles.senderProfileTextContainer}> 
              <Text style={styles.title}>{t('safety.greeting')} {user?.first_name} {user?.last_name}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('safety.subtitle')}</Text>

          <View style={styles.tabContainer}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <Animated.View style={[styles.animatedIndicator, animatedTabStyle]} />
              {TABS.map((label, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePress(index)}
                  style={styles.tabButton}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === index && styles.activeTabText,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Tab Content */}
            <View style={styles.contentContainer}>
              {activeTab === 0 && (
              <>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image source={require('@/assets/icons/check_id.png')} style={styles.successImage} />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.guide.checkId.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.guide.checkId.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image source={require('@/assets/icons/carefull.png')} style={styles.successImage} />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.guide.careful.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.guide.careful.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image source={require('@/assets/icons/scammers.png')} style={styles.successImage} />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.guide.scammers.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.guide.scammers.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image source={require('@/assets/icons/payment.png')} style={styles.successImage} />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.guide.payment.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.guide.payment.description')}</Text>
                    </View>
                  </View>
                </View>
              </>
              )}
              {activeTab === 1 && (
              <>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image 
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1067/1067575.png' }} 
                      style={styles.successImage} 
                    />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.tools.emergencyContacts.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.tools.emergencyContacts.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image 
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' }} 
                      style={styles.successImage} 
                    />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.tools.locationSharing.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.tools.locationSharing.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image 
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png' }} 
                      style={styles.successImage} 
                    />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.tools.verificationChecklist.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.tools.verificationChecklist.description')}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.notificationContainer}>
                  <View style={styles.successContainer}> 
                    <Image 
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png' }} 
                      style={styles.successImage} 
                    />
                    <View style={styles.successTextContainer}>
                      <Text style={styles.successText}>{t('safety.tools.reportIssues.title')}</Text>
                      <Text style={styles.successDescription}>{t('safety.tools.reportIssues.description')}</Text>
                    </View>
                  </View>
                </View>
              </>
              )}
            </View>
          </View>
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
  form: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  notificationContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  successTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  successText: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.text,
    marginBottom: 6,
  },
  successDescription: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 20,
    color: '#919191',
  },
  senderProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  senderProfileImageContainer: {
    width: 48,
    height: 48,
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
  },
  title: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'nunito-medium',
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  tabContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: COLORS.backgroundWrapper,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    padding: 4,
  },
  animatedIndicator: {
    position: 'absolute',
    height: '100%',
    width: tabWidth,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    zIndex: 0,
    top: 4,
    left: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
    paddingVertical: 12,
  },
  tabText: {
    color: COLORS.text,
    fontFamily: 'nunito-bold',
    fontSize: 14, 
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  activeTabText: {
    color: COLORS.background,
  },
  contentContainer: {
    marginTop: 24,
    flex: 1,
  },
  successImage: {
    width: 56,
    height: 56,
  },

});
