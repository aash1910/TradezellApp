import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, KeyboardAvoidingView, Platform, Keyboard, StatusBar, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { SuccessIcon } from '@/components/icons/SuccessIcon';
import { DotIcon } from '@/components/icons/DotIcon';
import { getNotifications, refreshNotifications, markNotificationAsRead, deleteNotification, Notification } from '@/services/notification.service';

const HEADER_HEIGHT = 80;

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#424242',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  useFocusEffect(
    useCallback(() => { 
      // Fetch notifications when page comes into focus (initial load)
      fetchNotifications(true);
      
      // Set up interval to refresh every 5 seconds while page is focused
      const interval = setInterval(() => {
        fetchNotifications(false); // Background refresh, not initial load
      }, 5000);

      // Cleanup interval when page loses focus
      return () => clearInterval(interval);
    }, [])
  );

  const fetchNotifications = async (isInitial: boolean = false) => {
    try {
      // Only show loading indicator on initial load, not on background refreshes
      if (isInitial) {
        setIsLoading(true);
      }
      const data = await refreshNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isInitial) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await refreshNotifications();
      setNotifications(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Actually delete the notification from the database
      await deleteNotification(notificationId);
      
      // Remove the notification from local state immediately for better UX
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Could show an alert here if needed
    }
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
      <Animated.View style={[styles.header]}>
        <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
          <LeftArrowIcon size={44} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Notifications</Text>
        <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
          <Image source={require('@/assets/icons/settings-icon.png')} style={{width: 44, height: 44}} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }>
        <View style={styles.form}>
          {isLoading && isInitialLoad && !isRefreshing ? (
            <Text style={styles.loadingText}>Loading notifications...</Text>
          ) : notifications.length === 0 ? (
            <Text style={styles.noNotificationsText}>No notifications found</Text>
          ) : (
            notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationContainer}>
                <View style={styles.successContainer}> 
                  <SuccessIcon size={40} />
                  <View style={styles.successTextContainer}>
                    <Text style={styles.successText}>{notification.title}</Text>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>{notification.date}</Text>
                      <DotIcon size={3} />
                      <Text style={styles.dateText}>{notification.time}</Text>
                    </View>
                  </View>
                    {notification.isNew && (
                      <Text style={styles.newText}>New</Text>
                    )}
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNotification(notification.id)}
                      accessibilityLabel="Delete notification"
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  
                </View>
                <Text style={styles.successDescription}>{notification.description}</Text>
              </View>
            ))
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  leftArrow: {
    width: 44,
    height: 44,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 25,
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
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'nunito-medium',
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 16,
    color: COLORS.subtitle,
  },
  newText: {
    fontFamily: 'nunito-semibold',
    fontSize: 10,
    letterSpacing: 0.2,
    color: COLORS.background,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
  },
  successDescription: {
    fontFamily: 'nunito-medium',
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  loadingText: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
  },
  noNotificationsText: {
    fontFamily: 'nunito-medium',
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -24,
    right: -16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
