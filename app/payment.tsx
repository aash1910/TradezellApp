import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StripeProvider, CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { LeftArrowIcon } from '@/components/icons/LeftArrowIcon';
import { paymentService, PaymentIntent } from '@/services/payment.service';
import { Package } from '@/services/packageList.service';
import { useTranslation } from 'react-i18next';
import { STRIPE_CONFIG } from '@/config/stripe';

const COLORS = {
  primary: '#55B086',
  background: '#FFFFFF',
  backgroundWrapper: '#F5F5F5',
  text: '#212121',
  textSecondary: '#919191',
  buttonText: '#FFFFFF',
  subtitle: '#616161',
  error: '#FF3B30',
  success: '#34C759',
};

// Stripe publishable key from config
const STRIPE_PUBLISHABLE_KEY = STRIPE_CONFIG.publishableKey;

function PaymentScreenContent() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [orderData, setOrderData] = useState<Package | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { confirmPayment } = useStripe();

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    try {
      if (params.orderData) {
        const parsedData = typeof params.orderData === 'string' 
          ? JSON.parse(params.orderData) 
          : params.orderData;
        setOrderData(parsedData);
      }
    } catch (error) {
      console.error('Error parsing order data:', error);
      Alert.alert('Error', 'Invalid order data');
      router.back();
    }
  }, [params.orderData]);

  useEffect(() => {
    if (orderData) {
      createPaymentIntent();
    }
  }, [orderData]);

  const createPaymentIntent = async () => {
    if (!orderData) return;
    
    try {
      setIsLoading(true);
      const intent = await paymentService.createPaymentIntent(
        orderData.id, 
        parseFloat(orderData.price || '0')
      );
      setPaymentIntent(intent);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentIntent || !cardComplete) {
      Alert.alert('Error', 'Please complete your card details');
      return;
    }

    try {
      setPaymentStatus('processing');
      
      const { error, paymentIntent: confirmedPaymentIntent } = await confirmPayment(
        paymentIntent.client_secret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        setPaymentStatus('error');
        Alert.alert('Payment Failed', error.message);
      } else if (confirmedPaymentIntent) {
        setPaymentStatus('success');
        Alert.alert(
          'Payment Successful', 
          'Your payment has been processed and is held in escrow. You will be refunded if no dropper accepts your package.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/manage')
            }
          ]
        );
      }
    } catch (error: any) {
      setPaymentStatus('error');
      Alert.alert('Payment Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Setting up payment...</Text>
      </View>
    );
  }

  if (!orderData || !paymentIntent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load payment information</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <LeftArrowIcon size={44} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment.title')}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          <View style={styles.orderDetails}>
            <Text style={styles.orderDetailText}>
              From: {orderData.pickup.name} ({orderData.pickup.address})
            </Text>
            <Text style={styles.orderDetailText}>
              To: {orderData.drop.name} ({orderData.drop.address})
            </Text>
            <Text style={styles.orderDetailText}>
              Weight: {orderData.weight}kg
            </Text>
            <Text style={styles.orderDetailText}>
              Price: ${parseFloat(orderData.price || '0').toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.escrowInfo}>
            This payment will be held in escrow until a dropper accepts your package. 
            If no dropper accepts within 24 hours, you will be automatically refunded.
          </Text>
          
          <View style={styles.cardContainer}>
            <Text style={styles.cardLabel}>Card Details</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: COLORS.background,
                textColor: COLORS.text,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.subtitle,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (!cardComplete || paymentStatus === 'processing') && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!cardComplete || paymentStatus === 'processing'}
        >
          {paymentStatus === 'processing' ? (
            <ActivityIndicator color={COLORS.buttonText} />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${parseFloat(orderData.price || '0').toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityText}>
            🔒 Your payment information is secure and encrypted by Stripe
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function PaymentScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreenContent />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: 'nunito-medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    fontFamily: 'nunito-medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 44,
    height: 44,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  orderSummary: {
    backgroundColor: COLORS.backgroundWrapper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderDetails: {
    gap: 8,
  },
  orderDetailText: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.textSecondary,
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  escrowInfo: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    color: COLORS.textSecondary,
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'nunito-medium',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardField: {
    height: 60,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  payButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontFamily: 'nunito-bold',
    letterSpacing: 0.2,
  },
  securityNotice: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'nunito-regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
}); 