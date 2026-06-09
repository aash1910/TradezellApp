import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, Platform, Keyboard, StatusBar, RefreshControl, Linking } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { SentBtnIcon } from '@/components/icons/SentBtnIcon';
import { CallIcon } from '@/components/icons/CallIcon';
import { CameraIcon } from '@/components/icons/CameraIcon';
import { MicrophoneIcon } from '@/components/icons/MicrophoneIcon';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  user_id: number;
  name: string;
  image: string | null;
  mobile: string | null;
  last_message: string;
  last_message_time: string;
  is_support: boolean;
  unread_count: number;
}

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

function paramString(value: string | string[] | undefined, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value[0]) return value[0];
  return fallback;
}

export default function MessageScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    userId?: string | string[];
    userName?: string | string[];
    name?: string | string[];
    userImage?: string | string[];
    userMobile?: string | string[];
    refresh?: string | string[];
  }>();

  const userId = paramString(params.userId, '1');
  const userName = paramString(params.userName) || paramString(params.name) || (userId === '1' ? 'Support Service' : 'User');
  const userImage = paramString(params.userImage);
  const userMobile = paramString(params.userMobile);
  const refresh = paramString(params.refresh, '0');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const pollCountRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const currentUserIdRef = useRef<string>(userId);
  const unreadCountIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();
  /** Must match `tabBarStyle.height` in `(tabs)/_layout.tsx` (iOS 86, else safe bottom + row). */
  const tabBarInset = Platform.OS === 'ios' ? 86 : insets.bottom + 64;
  /** Matches `inputBarWrapper`: paddingTop 10 + row (input/send ~44) + paddingBottom. */
  const composerPaddingBottom = isKeyboardVisible ? 10 : Math.max(insets.bottom, 10);
  const inputComposerHeight = 10 + 44 + composerPaddingBottom;
  /** List must clear tab bar + absolutely positioned composer above it. */
  const scrollListBottomInset = tabBarInset + inputComposerHeight + 8;
  const tabBarInsetRef = useRef(tabBarInset);
  tabBarInsetRef.current = tabBarInset;
  const bottomPosition = useSharedValue(tabBarInset);
  // Update currentUserIdRef when userId changes
  useEffect(() => {
    currentUserIdRef.current = userId;
  }, [userId]);

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

  const startPolling = useCallback(() => {
    const environment = Constants.expoConfig?.extra?.environment;
    
    // Only start polling if not in development mode
    if (environment === 'development') {
      console.log('Skipping polling in development mode');
      return;
    }
    
    console.log('Starting polling, current count:', pollCountRef.current);
    // Clear any existing interval
    if (pollIntervalRef.current) {
      console.log('Clearing existing interval');
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Start new polling
    console.log('Creating new interval');
    pollIntervalRef.current = setInterval(async () => {
      console.log('Interval triggered, current count:', pollCountRef.current);
      if (pollCountRef.current >= 10) {
        console.log('Reached max count, stopping polling');
        // Stop polling after 10 attempts
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }

      await fetchMessages();
      pollCountRef.current += 1;
      console.log('Polling...', pollCountRef.current);
    }, 5000); // Poll every 5 seconds
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/conversations');
      if (response.data.status === 'success') {
        const conversations: Conversation[] = response.data.conversations;
        const currentConversation = conversations.find((conv: Conversation) => conv.user_id === parseInt(currentUserIdRef.current));
        if (currentConversation) {
          setUnreadCount(currentConversation.unread_count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${currentUserIdRef.current}`);
      if (response.data.status === 'success') {
        let fetchedMessages = response.data.messages;
        
        // Add support messages at the beginning if userId is 1
        if (currentUserIdRef.current === '1') {
          const supportMessages = [
            {
              id: -1,
              sender_id: 1,
              receiver_id: 1,
              message: t('supportService.customerService.greeting'),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: -2,
              sender_id: 1,
              receiver_id: 1,
              message: t('supportService.customerService.intro'),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          fetchedMessages = [...supportMessages, ...fetchedMessages];
        }

        // Get the last message from the fetched messages
        const lastMessage = fetchedMessages[fetchedMessages.length - 1];
        
        // Check if we received new messages by comparing with the last message ID we've seen
        const hasNewMessages = lastMessage && 
          lastMessage.id !== lastMessageIdRef.current && 
          lastMessage.sender_id === parseInt(currentUserIdRef.current);
        
        // Update the last message ID we've seen
        if (lastMessage) {
          lastMessageIdRef.current = lastMessage.id;
        }
        
        setMessages(fetchedMessages);
        
        // If we received new messages, restart polling and reset counter
        if (hasNewMessages) {
          console.log('New message received, resetting count to 0');
          pollCountRef.current = 0;
          console.log('hasNewMessages', pollCountRef.current);
          startPolling();

          // Mark messages as read when new messages arrive
          await markMessagesAsRead();

          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await api.post(`/messages/${currentUserIdRef.current}/mark-read`);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Start polling when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, resetting count to 0');
      currentUserIdRef.current = userId;
      lastMessageIdRef.current = null;
      fetchMessages();
      fetchUnreadCount();
      
      // Mark messages as read when conversation is opened
      markMessagesAsRead();

      pollCountRef.current = 0;
      startPolling();

      // Start unread count polling
      if (unreadCountIntervalRef.current) {
        clearInterval(unreadCountIntervalRef.current);
      }
      unreadCountIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 5000);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Cleanup polling when screen loses focus
      return () => {
        console.log('Screen unfocused, cleaning up polling');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (unreadCountIntervalRef.current) {
          clearInterval(unreadCountIntervalRef.current);
          unreadCountIntervalRef.current = null;
        }
      };
    }, [userId, refresh])
  );

  useEffect(() => {
    if (!isKeyboardVisible) {
      bottomPosition.value = tabBarInset;
    }
  }, [tabBarInset, isKeyboardVisible]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, (event) => {
      const height = event.endCoordinates.height;
      setKeyboardVisible(true);
      setKeyboardHeight(height);
      bottomPosition.value = withTiming(height, { duration: 250 });
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      bottomPosition.value = withTiming(tabBarInsetRef.current, { duration: 250 });
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      bottom: bottomPosition.value,
    };
  });

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        const response = await api.post('/messages', {
          receiver_id: currentUserIdRef.current,
          message: input.trim()
        });

        if (response.data.status === 'success') {
          setInput('');
          await fetchMessages();
          // Reset poll count and restart polling after sending a message
          pollCountRef.current = 0;
          startPolling();

          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
        <Animated.View style={[styles.header]}>
          <TouchableOpacity style={styles.leftArrow} onPress={() => router.push({
            pathname: '/conversations'
          })}>
            <LeftArrowIcon size={44} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>{userName}</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {userMobile && (
            <TouchableOpacity style={styles.callIcon} onPress={() => Linking.openURL(`tel:${userMobile}`)}>
              <CallIcon size={44} />
            </TouchableOpacity>
          )}
        </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: isKeyboardVisible
              ? keyboardHeight + inputComposerHeight + 12
              : scrollListBottomInset,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={COLORS.primary}
            onRefresh={() => {
              console.log('Refreshing messages');
              fetchMessages();
              pollCountRef.current = 0;
              startPolling();
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            refreshing={false}
          />
        }
        >
        <View style={styles.contentContainer}>
          {/* Date Separator */}
          <View style={styles.dateSeparatorWrapper}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <View style={styles.dateSeparatorLine} />
          </View>
          {/* Messages */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={msg.sender_id === parseInt(currentUserIdRef.current) ? styles.receivedMsgWrapper : styles.sentMsgWrapper}
            >
              {msg.sender_id === parseInt(currentUserIdRef.current) && (
                <>
                {msg.sender_id === 1 ? (
                  <Image source={require('@/assets/icons/robot.png')} style={styles.avatar} />
                ) : userImage ? (
                  <Image source={{ uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${userImage}` }} style={styles.avatar} />
                ) : (
                  <Image source={require('@/assets/img/profile-blank.png')} style={styles.avatar} />
                )}
                </>
              )}
              <View style={msg.sender_id === parseInt(currentUserIdRef.current) ? styles.receivedBubble : styles.sentBubble}>
                <Text style={msg.sender_id === parseInt(currentUserIdRef.current) ? styles.receivedText : styles.sentText}>{msg.message}</Text>
                <Text style={msg.sender_id === parseInt(currentUserIdRef.current) ? styles.receivedTimestamp : styles.sentTimestamp}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
        {/* Message Input Bar */}
        <Animated.View
          style={[
            styles.inputBarWrapper,
            { paddingBottom: isKeyboardVisible ? 10 : Math.max(insets.bottom, 10) },
            inputBarAnimatedStyle,
          ]}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
            />
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
            <SentBtnIcon size={44} />
          </TouchableOpacity>
        </Animated.View>
      
    </View>
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
  callIcon: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.background,
    letterSpacing: 0.2,
    lineHeight: 25,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundWrapper,
  },
  dateSeparatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DADADA',
    marginHorizontal: 8,
  },
  dateSeparatorText: {
    color: '#919191',
    fontSize: 12,
    fontFamily: 'nunito-semibold',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  sentMsgWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  receivedMsgWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  sentBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  receivedBubble: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sentText: {
    color: COLORS.background,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontFamily: 'nunito-semibold',
    marginBottom: 8,
    textAlign: 'right',
  },
  receivedText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontFamily: 'nunito-semibold',
    marginBottom: 8,
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.2,
    fontFamily: 'nunito-medium',
    alignSelf: 'flex-start',
  },
  receivedTimestamp: {
    color: '#919191',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.2,
    fontFamily: 'nunito-medium',
    alignSelf: 'flex-end',
  },
  inputBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
    zIndex: 10,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 10,
    flex: 1,
  },
  input: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: 'nunito-medium',
    height: 44,
    flex: 1,
  },
  sendBtn: {

  },
});
