import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const KEYBOARD_VISIBLE_THRESHOLD = 50;

/**
 * Tracks virtual-keyboard overlap on mobile web via the Visual Viewport API.
 * Returns 0 on native platforms (use RN Keyboard events there instead).
 */
export function useWebKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return;
    }

    const update = () => {
      const inset = Math.max(
        0,
        Math.round(window.innerHeight - visualViewport.height - visualViewport.offsetTop),
      );
      const visible = inset > KEYBOARD_VISIBLE_THRESHOLD;
      setKeyboardInset(visible ? inset : 0);
      setKeyboardVisible(visible);
    };

    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
    update();

    return () => {
      visualViewport.removeEventListener('resize', update);
      visualViewport.removeEventListener('scroll', update);
    };
  }, []);

  return { keyboardInset, isKeyboardVisible };
}
