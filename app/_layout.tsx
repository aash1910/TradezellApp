import '@/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

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

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="index">
        {/* Auth flow */}
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="boarding"        options={{ headerShown: false }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="register"        options={{ headerShown: false }} />
        <Stack.Screen name="otpVerification" options={{ headerShown: false }} />
        <Stack.Screen name="success"         options={{ headerShown: false }} />
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
}
