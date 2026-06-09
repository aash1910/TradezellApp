import { Dimensions } from 'react-native';

import { WEB_APP_MAX_WIDTH } from '@/constants/webLayout';

/** Fallback when `Dimensions` is not ready (Expo static web / Node SSR). */
const DEFAULT = { width: WEB_APP_MAX_WIDTH, height: 956 };

export function getStaticSafeWindow() {
  const { width, height } = Dimensions.get('window');
  if (width > 0 && height > 0) {
    return { width, height };
  }
  return DEFAULT;
}
