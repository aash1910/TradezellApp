/**
 * Facebook Login utility for handling availability in different environments
 * @author Ashraful Islam
 */

import { Alert } from 'react-native';

// Conditional import for Facebook Login
let FacebookSDK: any = null;

try {
  const { LoginManager, AccessToken, GraphRequest, GraphRequestManager } = require('react-native-fbsdk-next');
  FacebookSDK = {
    LoginManager,
    AccessToken,
    GraphRequest,
    GraphRequestManager
  };
} catch (error) {
  console.log('Facebook SDK not available in Expo Go - requires development build');
}

export const isFacebookLoginAvailable = () => {
  return FacebookSDK !== null;
};

export const initializeFacebook = async () => {
  if (FacebookSDK) {
    try {
      // The new SDK doesn't require explicit initialization like the old expo-facebook
      // It's automatically initialized when the app starts
      return true;
    } catch (error) {
      console.error('Facebook initialization error:', error);
      return false;
    }
  }
  return false;
};

export const getFacebookModule = () => {
  return FacebookSDK;
};

export const showFacebookLoginUnavailableAlert = () => {
  Alert.alert(
    'Facebook Login Not Available',
    'Facebook Login requires a development build. Please use "expo run:ios" or "expo run:android" to test this feature.',
    [
      {
        text: 'OK',
        onPress: () => console.log('User acknowledged Facebook Login limitation')
      }
    ]
  );
};

interface FacebookUserData {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export const handleFacebookLogin = async (): Promise<FacebookUserData | null> => {
  if (!isFacebookLoginAvailable()) {
    showFacebookLoginUnavailableAlert();
    return null;
  }

  try {
    const initialized = await initializeFacebook();
    if (!initialized) {
      throw new Error('Failed to initialize Facebook');
    }

    const { LoginManager, AccessToken, GraphRequest, GraphRequestManager } = FacebookSDK;

    // Request login permissions
    const result = await LoginManager.logInWithPermissions(['user_link']);

    if (result.isCancelled) {
      throw new Error('Facebook login was cancelled');
    }

    if (result.grantedPermissions && result.grantedPermissions.length > 0) {
      // Get access token
      const accessToken = await AccessToken.getCurrentAccessToken();
      
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Get user details using Graph API
      return new Promise<FacebookUserData>((resolve, reject) => {
        const userInfoRequest = new GraphRequest(
          '/me',
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string: 'id,name,email,picture.type(large)'
              }
            }
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Graph API Error:', error);
              reject(new Error('Failed to get user information'));
            } else {
              resolve(result as FacebookUserData);
            }
          }
        );

        new GraphRequestManager().addRequest(userInfoRequest).start();
      });
    } else {
      throw new Error('No permissions granted');
    }
  } catch (error: any) {
    console.error('Facebook Login Error:', error);
    throw error;
  }
}; 