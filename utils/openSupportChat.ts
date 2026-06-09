import { router } from 'expo-router';
import { Platform } from 'react-native';

export const SUPPORT_CHAT_PARAMS = {
  userId: '1',
  userName: 'Support Service',
  userImage: '',
  userMobile: '',
} as const;

export type MessageChatParams = {
  userId: string;
  userName: string;
  userImage: string;
  userMobile: string;
};

function buildMessageHref(params: MessageChatParams) {
  return {
    pathname: '/(tabs)/message' as const,
    params: {
      ...params,
      refresh: String(Date.now()),
    },
  };
}

/** Open a 1:1 chat. Uses `navigate` on native so hidden tab routes switch correctly. */
export function openMessageChat(params: MessageChatParams, options?: { replace?: boolean }) {
  const href = buildMessageHref(params);

  if (Platform.OS === 'web') {
    if (options?.replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
    return;
  }

  if (options?.replace) {
    router.replace(href);
    return;
  }

  router.navigate(href);
}

export function openSupportChat(options?: { replace?: boolean }) {
  openMessageChat({ ...SUPPORT_CHAT_PARAMS }, options);
}
