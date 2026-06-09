import { Platform, useWindowDimensions } from 'react-native';

import { WEB_APP_MAX_WIDTH } from '@/constants/webLayout';
import { getStaticSafeWindow } from '@/utils/getStaticSafeWindow';

/**
 * Use for layout math instead of raw `useWindowDimensions()` on web so width
 * matches the max-width column (see root `_layout` web shell).
 */
export function useAppContentDimensions() {
  const { width: winW, height: winH } = useWindowDimensions();
  const fb = getStaticSafeWindow();
  const rawW = winW > 0 ? winW : fb.width;
  const rawH = winH > 0 ? winH : fb.height;
  const width = Platform.OS === 'web' ? Math.min(rawW, WEB_APP_MAX_WIDTH) : rawW;
  const webViewportHeight =
    typeof window !== 'undefined'
      ? Math.round(window.visualViewport?.height ?? window.innerHeight ?? rawH)
      : rawH;
  const height = Platform.OS === 'web' && webViewportHeight > 0 ? webViewportHeight : rawH;
  return { width, height };
}
