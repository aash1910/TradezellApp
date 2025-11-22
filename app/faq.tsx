import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
import { HeadphonesRoundIcon } from '@/components/icons/HeadphonesRoundIcon';
import { SelectUpArrowIcon } from '@/components/icons/SelectUpArrowIcon';
import { SelectDownArrowIcon } from '@/components/icons/SelectDownArrowIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import api from '@/services/api';

const HEADER_HEIGHT = 80;

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#919191',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
};

const TABS = ['Guide', 'Tools'];
const screenWidth = Dimensions.get('window').width;
const TAB_WIDTH = (screenWidth - 32 - 8) / TABS.length;

interface FAQ {
  title: string;
  description: string;
}

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const translateX = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePress = (index: number) => {
    setActiveTab(index);
    translateX.value = withTiming(index * TAB_WIDTH, { duration: 200 });
  };

  const animatedTabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/faqs');
      if (response.data.status === 'success') {
        setFaqs(response.data.data);
        setError(null);
      } else {
        setError('Failed to load FAQs');
      }
    } catch (err) {
      setError('Failed to load FAQs');
      console.error('Error fetching FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of FAQs
  useEffect(() => {
    fetchFaqs();
  }, []);

  // Filtered FAQs based on search
  const filteredFaqs = faqs.filter(faq =>
    faq.title.toLowerCase().includes(search.toLowerCase()) ||
    faq.description.toLowerCase().includes(search.toLowerCase())
  );

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom , 86) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            enabled={false} 
            refreshing={false}
            onRefresh={fetchFaqs}
          /> 
        }
        >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('faq.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBarIcon}>
              <SearchIcon color="#BDBDBD" />
            </View>
            <TextInput
              style={styles.searchBar}
              placeholder={t('faq.search')}
              placeholderTextColor="#BDBDBD"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* FAQ Accordion */}
          <View style={styles.faqContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>{t('faq.loading')}</Text>
              </View>
            ) : error ? (
              <Text style={styles.errorText}>{t('faq.error')}</Text>
            ) : filteredFaqs.length === 0 ? (
              <Text style={{color: '#BDBDBD', textAlign: 'center', marginTop: 32}}>{t('faq.noFaqsFound')}</Text>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <View key={idx} style={styles.accordionItem}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => setOpenIndex(openIndex === idx ? null : idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionTitle}>{faq.title}</Text>
                    <Text style={styles.accordionIcon}>{openIndex === idx ? <SelectUpArrowIcon color={COLORS.primary} /> : <SelectDownArrowIcon color={COLORS.primary} />}</Text>
                  </TouchableOpacity>
                  {openIndex === idx && (
                    <View style={styles.accordionContent}>
                      <Text style={styles.accordionDescription}>{faq.description}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
        {isKeyboardVisible && (
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom , 22) }]}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => router.push('/supportService')} 
            >
              <HeadphonesRoundIcon size={20} color={COLORS.buttonText} />
              <Text style={styles.continueButtonText}>{t('faq.getSupport')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
      {!isKeyboardVisible && (
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom , 22) }]}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.replace('/(tabs)/message')} 
          >
            <HeadphonesRoundIcon size={20} color={COLORS.buttonText} />
            <Text style={styles.continueButtonText}>{t('faq.getSupport')}</Text>
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
    fontFamily: 'nunito-extrabold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: COLORS.text,
    marginBottom: 18,
    marginTop: 46,
  },
  successDescription: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 20,
    color: '#616161',
    textAlign: 'center',
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
    width: TAB_WIDTH,
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
    alignItems: 'center',
  },
  successImage: {
    width: 280,
    height: 280,
  },
  toolsContainer: {
    width: '100%',
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 16,
  },
  toolText: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.subtitle,
    textAlign: 'center',
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
    flexDirection: 'row',
    gap: 16,
  },
  continueButtonText: {
    color: COLORS.buttonText,
    fontFamily: 'nunito-bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 32,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    color: COLORS.primary,
    fontFamily: 'nunito-extrabold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 28,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  modalOptionText: {
    fontFamily: 'nunito-semibold',
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 24,
    marginTop: 0,
    height: 54,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: 'nunito-medium',
    backgroundColor: 'transparent',
    height: 48,
  },
  searchBarIcon: {
    marginRight: 14,
  },
  faqContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 8,
  },
  accordionItem: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  accordionIcon: {
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 12,
  },
  accordionContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  accordionDescription: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    letterSpacing: 0.2,
    color: COLORS.textSecondary,
    lineHeight: 22,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    paddingTop: 12,
    marginTop: -4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'nunito-medium',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontFamily: 'nunito-medium',
    fontSize: 16,
  },
});
