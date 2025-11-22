import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, Dimensions, Alert } from 'react-native';
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
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
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

const TABS = ['Guide', 'Tools'];
const screenWidth = Dimensions.get('window').width;
const TAB_WIDTH = (screenWidth - 32 - 8) / TABS.length;

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const [activeTab, setActiveTab] = useState(0);
  const translateX = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);

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
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('report.title')}</Text>
        </Animated.View>

        <View style={styles.form}>
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
                    {t(`report.tabs.${label.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Tab Content */}
            <View style={styles.contentContainer}>
              {activeTab === 0 && (
              <>
                <Image source={require('@/assets/icons/report.png')} style={styles.successImage} />
                <Text style={styles.successText}>{t('report.guide.title')}</Text>
                <Text style={styles.successDescription}>{t('report.guide.description')}</Text>
              </>
              )}
              {activeTab === 1 && (
              <>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png' }} 
                  style={styles.successImage} 
                />
                <Text style={styles.successText}>{t('report.tools.title')}</Text>
                <Text style={styles.successDescription}>{t('report.tools.description')}</Text>
                <View style={styles.toolsContainer}>
                  <Text style={styles.toolText}>{t('report.tools.blockUser')}</Text>
                  <Text style={styles.toolText}>{t('report.tools.flagContent')}</Text>
                  <Text style={styles.toolText}>{t('report.tools.contactSupport')}</Text>
                </View>
              </>
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.continueButtonText}>{t('report.reportButton')}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
            <Text style={styles.modalTitle}>{t('report.modal.title')}</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              Alert.alert(t('report.modal.emailSent'));
            }}>
              <Text style={styles.modalOptionText}>{t('report.modal.options.unsolicited')}</Text>
              <RightArrowIcon size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              Alert.alert(t('report.modal.emailSent'));
            }}>
              <Text style={styles.modalOptionText}>{t('report.modal.options.underage')}</Text>
              <RightArrowIcon size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              Alert.alert(t('report.modal.emailSent'));
            }}>
              <Text style={styles.modalOptionText}>{t('report.modal.options.spam')}</Text>
              <RightArrowIcon size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingBottom: 24 + (Platform.OS === 'android' ? 24 : 0),
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
});
