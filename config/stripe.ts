import Constants from 'expo-constants';

export const STRIPE_CONFIG = {
  publishableKey: Constants.expoConfig?.extra?.stripePublishableKey || 'pk_test_your_stripe_publishable_key_here',
}; 