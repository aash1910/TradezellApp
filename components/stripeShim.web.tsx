import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Elements, CardElement, useElements, useStripe as useWebStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

type StripeProviderProps = {
  children: React.ReactNode;
  publishableKey?: string;
};

type CardFieldProps = {
  postalCodeEnabled?: boolean;
  placeholders?: { number?: string };
  cardStyle?: Record<string, unknown>;
  onCardChange?: (card: { complete: boolean }) => void;
  style?: any;
};

const stripePromiseCache = new Map<string, ReturnType<typeof loadStripe>>();

function getStripePromise(publishableKey?: string) {
  const key = publishableKey?.trim();
  if (!key) return null;
  if (!stripePromiseCache.has(key)) {
    stripePromiseCache.set(key, loadStripe(key));
  }
  return stripePromiseCache.get(key)!;
}

export function StripeProvider({ children, publishableKey }: StripeProviderProps) {
  const stripePromise = getStripePromise(publishableKey);
  if (!stripePromise) {
    return <>{children}</>;
  }
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

export function CardField({ style, onCardChange }: CardFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <CardElement
        options={{
          hidePostalCode: true,
          style: {
            base: {
              color: '#212121',
              fontSize: '14px',
              '::placeholder': {
                color: '#919191',
              },
            },
            invalid: {
              color: '#FF3B30',
            },
          },
        }}
        onChange={(event: { complete?: boolean }) => onCardChange?.({ complete: !!event.complete })}
      />
    </View>
  );
}

type ConfirmPaymentError = {
  message?: string;
};

type ConfirmPaymentResult = {
  error: ConfirmPaymentError | null;
  paymentIntent: { id: string; status: string } | null;
};

export function useStripe() {
  const stripe = useWebStripe();
  const elements = useElements();

  const confirmPayment = async (
    clientSecret?: string,
    _params?: { paymentMethodType?: string }
  ): Promise<ConfirmPaymentResult> => {
    if (!clientSecret) {
      return {
        error: { message: 'Missing Stripe client secret.' },
        paymentIntent: null,
      };
    }

    if (!stripe || !elements) {
      return {
        error: { message: 'Stripe has not finished loading. Please try again.' },
        paymentIntent: null,
      };
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return {
        error: { message: 'Card details are incomplete. Please check and try again.' },
        paymentIntent: null,
      };
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      return {
        error: { message: result.error.message || 'Payment confirmation failed.' },
        paymentIntent: null,
      };
    }

    if (!result.paymentIntent) {
      return {
        error: { message: 'No payment intent returned from Stripe.' },
        paymentIntent: null,
      };
    }

    return {
      error: null,
      paymentIntent: {
        id: result.paymentIntent.id,
        status: result.paymentIntent.status,
      },
    };
  };

  return { confirmPayment };
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
});
