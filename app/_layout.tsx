import '@/i18n';
import { loadUserLanguage } from '@/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { WEB_APP_MAX_WIDTH } from '@/constants/webLayout';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const WEB_GLOBAL_STYLES_ID = 'tradezell-web-global-styles';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono:       require('../assets/fonts/SpaceMono-Regular.ttf'),
    Nunito:          require('../assets/fonts/Nunito-Regular.ttf'),
    NunitoSemiBold:  require('../assets/fonts/Nunito-SemiBold.ttf'),
    NunitoBold:      require('../assets/fonts/Nunito-Bold.ttf'),
    NunitoExtraBold: require('../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      const hideSplash = async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
        await SplashScreen.hideAsync();
      };
      hideSplash();
    }
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      loadUserLanguage();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    if (document.getElementById(WEB_GLOBAL_STYLES_ID)) {
      return;
    }
    const el = document.createElement('style');
    el.id = WEB_GLOBAL_STYLES_ID;
    el.textContent = `
/* Use aria-modal, not role=dialog: inactive stacked modals lose role but keep aria-modal (react-native-web). */
[aria-modal="true"] {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}
[aria-modal="true"] > div {
  width: 100% !important;
  max-width: ${WEB_APP_MAX_WIDTH}px !important;
  flex: 1 !important;
  align-self: center !important;
  box-sizing: border-box !important;
}

/* Remove default browser focus ring on RN Web text fields (web only). */
input:focus,
input:focus-visible,
textarea:focus,
textarea:focus-visible,
select:focus,
select:focus-visible {
  outline: none !important;
  outline-width: 0 !important;
  box-shadow: none !important;
}
`.trim();
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);

  if (!loaded) return null;

  const app = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="index">
        {/* Auth flow */}
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="boarding"        options={{ headerShown: false }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="register"        options={{ headerShown: false }} />
        <Stack.Screen name="otpVerification" options={{ headerShown: false }} />
        <Stack.Screen name="success"         options={{ headerShown: false }} />
        <Stack.Screen name="uploadFile"      options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword"  options={{ headerShown: false }} />
        <Stack.Screen name="resetPassword"   options={{ headerShown: false }} />
        <Stack.Screen name="accountRecovery" options={{ headerShown: false }} />
        {/* Main tabs */}
        <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
        {/* Tradezell-specific stack screens */}
        <Stack.Screen name="addListing"      options={{ headerShown: false }} />
        <Stack.Screen name="listingDetail"   options={{ headerShown: false }} />
        <Stack.Screen name="myListings"      options={{ headerShown: false }} />
        <Stack.Screen name="filterScreen"    options={{ headerShown: false }} />
        <Stack.Screen name="mapScreen"       options={{ headerShown: false }} />
        <Stack.Screen name="blocked"         options={{ headerShown: false }} />
        {/* Shared screens */}
        <Stack.Screen name="profile"         options={{ headerShown: false }} />
        <Stack.Screen name="updateProfile"   options={{ headerShown: false }} />
        <Stack.Screen name="review"          options={{ headerShown: false }} />
        <Stack.Screen name="report"          options={{ headerShown: false }} />
        <Stack.Screen name="safety"          options={{ headerShown: false }} />
        <Stack.Screen name="faq"             options={{ headerShown: false }} />
        <Stack.Screen name="supportService"  options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webShell}>
        <View style={styles.webColumn}>{app}</View>
      </View>
    );
  }

  return app;
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  webColumn: {
    flex: 1,
    width: '100%',
    maxWidth: WEB_APP_MAX_WIDTH,
    overflow: 'hidden',
  },
});
