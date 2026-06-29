import Constants from 'expo-constants';

export const isDevelopment = Constants.expoConfig?.extra?.environment === 'development';
