import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
import api from '@/services/api';

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

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#424242',
  subtitle: '#616161',
  border: '#EEEEEE',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  cardBorder: '#F0F0F0',
};

// Function to calculate total unread count from conversations
export const calculateUnreadCount = (conversations: Conversation[]): number => {
  return conversations.reduce((total, conversation) => total + (conversation.unread_count || 0), 0);
};

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      if (response.data.status === 'success') {
        console.log('Conversations data:', response.data.conversations);
        setConversations(response.data.conversations);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      // Trigger a refresh of the unread count in the tab layout
      // This will be handled by the periodic refresh in the tab layout
    }, [])
  );

  // Refresh conversations every 5 seconds when app is active
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    }
  };

  const handleConversationPress = async (conversation: Conversation) => {
    // Mark messages as read when conversation is opened
    if (conversation.unread_count && conversation.unread_count > 0) {
      try {
        await api.post(`/messages/${conversation.user_id}/mark-read`);
        // Update the local state to reflect the change
        setConversations(prev => prev.map(conv => 
          conv.user_id === conversation.user_id 
            ? { ...conv, unread_count: 0 }
            : conv
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }

    router.push({
      pathname: '/(tabs)/message',
      params: {
        userId: conversation.user_id.toString(),
        userName: conversation.is_support ? 'Support Service' : conversation.name,
        userImage: conversation.image || '',
        userMobile: conversation.mobile || '',
      }
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.is_support ? (
          <Image source={require('@/assets/icons/robot.png')} style={styles.avatar} />
        ) : item.image ? (
          <Image 
            source={{ uri: `${(api.defaults.baseURL || '').replace('/api', '')}/${item.image}` }} 
            style={styles.avatar} 
          />
        ) : (
          <Image source={require('@/assets/img/profile-blank.png')} style={styles.avatar} />
        )}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.is_support ? 'Support Service' : item.name}
          </Text>
          <Text style={styles.conversationTime}>
            {formatTime(item.last_message_time)}
          </Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.last_message}
        </Text>
      </View>
      
      <View style={styles.arrowContainer}>
        {item.unread_count && item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
          </View>
        )}
        <RightArrowIcon size={16} color={COLORS.subtitle} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image 
        source={require('@/assets/images/empty_board.png')} 
        style={styles.emptyStateImage} 
      />
      <Text style={styles.emptyStateTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start a conversation with support or other users to see them here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftArrow} onPress={() => router.back()}>
          <LeftArrowIcon size={44} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.newChatButton} 
          onPress={() => router.push({
            pathname: '/(tabs)/message',
            params: {
              userId: '1',
              userName: 'Support Service',
              userImage: '',
              userMobile: '',
            }
          })}
        >
          <PlusIcon size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item, index) => `conversation-${item.user_id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWrapper,
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
    shadowColor: COLORS.cardShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
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
    flex: 1,
    textAlign: 'center',
  },
  newChatButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    fontFamily: 'nunito-medium',
    color: COLORS.subtitle,
    backgroundColor: COLORS.backgroundWrapper,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    backgroundColor: COLORS.backgroundWrapper,
    borderRadius: 16,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 