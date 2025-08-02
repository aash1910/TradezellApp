/**
 * Facebook Login utility for handling availability in different environments
 * @author Ashraful Islam
 */

// Conditional import for Facebook Login
let Facebook: any = null;

try {
  Facebook = require('expo-facebook');
} catch (error) {
  console.log('Facebook Login module not available in Expo Go');
}

export const isFacebookLoginAvailable = () => {
  return Facebook !== null;
};

export const initializeFacebook = async () => {
  if (Facebook) {
    try {
      await Facebook.initializeAsync({
        appId: '727197286878204', //'1018394353841992',
      });
      return true;
    } catch (error) {
      console.error('Facebook initialization error:', error);
      return false;
    }
  }
  return false;
};

export const getFacebookModule = () => {
  return Facebook;
};

export const showFacebookLoginUnavailableAlert = () => {
  const { Alert } = require('react-native');
  Alert.alert(
    'Facebook Login Not Available',
    'Facebook Login is not available in Expo Go. Please use a development build or native build to test this feature.',
    [
      {
        text: 'OK',
        onPress: () => console.log('User acknowledged Facebook Login limitation')
      }
    ]
  );
};

export const handleFacebookLogin = async () => {
  if (!isFacebookLoginAvailable()) {
    showFacebookLoginUnavailableAlert();
    return null;
  }

  try {
    const initialized = await initializeFacebook();
    if (!initialized) {
      throw new Error('Failed to initialize Facebook');
    }

    const result = await Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile'],
    });

    if (result.type === 'success') {
      // Get user details from Facebook (basic fields only - no verification required)
      const response = await fetch(`https://graph.facebook.com/me?access_token=${result.token}&fields=id,name`);
      const data = await response.json();
      return data;
    } else {
      throw new Error('Facebook login was cancelled');
    }
  } catch (error: any) {
    console.error('Facebook Login Error:', error);
    throw error;
  }
}; 