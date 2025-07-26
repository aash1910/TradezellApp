/**
 * Google Sign-In utility for handling availability in different environments
 * @author Ashraful Islam
 */

// Conditional import for Google Sign-In
let GoogleSignin: any = null;
let isSuccessResponse: any = null;
let isErrorWithCode: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  isSuccessResponse = googleSignInModule.isSuccessResponse;
  isErrorWithCode = googleSignInModule.isErrorWithCode;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
  console.log('Google Sign-In module not available in Expo Go');
}

export const isGoogleSignInAvailable = () => {
  return GoogleSignin !== null;
};

export const configureGoogleSignIn = () => {
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: '885136208940-5ru8ijrkjmkdkhqi9aar0c1t62fth09n.apps.googleusercontent.com',
      iosClientId: '885136208940-c07brsdi2plaqiijmfq9rslnmnlvi7bt.apps.googleusercontent.com',
      profileImageSize: 150,
    });
  }
};

export const getGoogleSignInModule = () => {
  return {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
  };
};

export const showGoogleSignInUnavailableAlert = () => {
  const { Alert } = require('react-native');
  Alert.alert(
    'Google Sign-In Not Available',
    'Google Sign-In is not available in Expo Go. Please use a development build or native build to test this feature.',
    [
      {
        text: 'OK',
        onPress: () => console.log('User acknowledged Google Sign-In limitation')
      }
    ]
  );
}; 