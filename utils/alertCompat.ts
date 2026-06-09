import { Alert, Platform, type AlertButton } from 'react-native';

export type ShowAlertOptions = { cancelable?: boolean };

/**
 * Drop-in replacement for `Alert.alert`: react-native-web's `Alert` is a no-op on web.
 * Supports optional `buttons` and `options` like native (0–2 buttons mapped to alert/confirm).
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: ShowAlertOptions
): void {
  if (Platform.OS !== 'web') {
    if (buttons != null && buttons.length > 0) {
      Alert.alert(title, message ?? '', buttons, options);
    } else if (message != null && message !== '') {
      Alert.alert(title, message);
    } else {
      Alert.alert(title);
    }
    return;
  }

  const w = typeof window !== 'undefined' ? window : undefined;
  if (!w) return;

  const msg = message ?? '';
  const body = msg !== '' ? `${title}\n\n${msg}` : title;

  if (buttons == null || buttons.length === 0) {
    w.alert(body);
    return;
  }

  if (buttons.length === 1) {
    w.alert(body);
    queueMicrotask(() => {
      buttons[0].onPress?.();
    });
    return;
  }

  if (buttons.length === 2) {
    const ok = w.confirm(body);
    const cancelButton = buttons.find((b) => b.style === 'cancel');
    const nonCancel = buttons.find((b) => b.style !== 'cancel');
    queueMicrotask(() => {
      if (ok) {
        (nonCancel ?? buttons[1]).onPress?.();
      } else {
        (cancelButton ?? buttons[0]).onPress?.();
      }
    });
    return;
  }

  w.alert(
    `${body}\n\n${buttons.map((b, i) => `${i + 1}. ${b.text ?? 'Option'}`).join('\n')}`
  );
  const primary =
    buttons.find((b) => b.style === 'default') ?? buttons[buttons.length - 1];
  queueMicrotask(() => {
    primary.onPress?.();
  });
}
