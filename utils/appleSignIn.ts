import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, Alert } from 'react-native';

export const isAppleSignInAvailable = async () => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    return false;
  }
};

export const showAppleSignInUnavailableAlert = () => {
  Alert.alert(
    'Apple Sign-In Unavailable',
    'Apple Sign-In is only available on iOS devices running iOS 13 or later.',
    [{ text: 'OK' }]
  );
};

export const handleAppleSignIn = async () => {
  const isAvailable = await isAppleSignInAvailable();
  
  if (!isAvailable) {
    showAppleSignInUnavailableAlert();
    return null;
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // IMPORTANT: Use identityToken for backend verification
    // The identityToken is a JWT that can be verified directly
    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    return {
      user: credential.user, // Unique Apple user ID
      identityToken: credential.identityToken, // JWT to verify on backend
      email: credential.email || null, // May be null on subsequent logins
      fullName: credential.fullName
        ? {
            givenName: credential.fullName.givenName || null,
            familyName: credential.fullName.familyName || null,
          }
        : null,
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User canceled - this is normal, don't show error
      console.log('Apple Sign-In was canceled by user');
      return null;
    }
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};

