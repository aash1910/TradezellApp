import api from './api';
import { getCurrencyConfig } from '@/constants/Currency';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  message?: string;
}

class PaymentService {
  // Create a payment intent for escrow
  async createPaymentIntent(packageId: string | number | null, amount: number, packageData?: any): Promise<PaymentIntent> {
    try {
      const currencyConfig = getCurrencyConfig();
      const payload: any = {
        amount: amount * 100, // Convert to cents
        currency: currencyConfig.code.toLowerCase(),
      };
      
      if (packageId) {
        payload.package_id = packageId;
      } else if (packageData) {
        payload.package_data = packageData;
      }
      
      const response = await api.post('/payments/create-intent', payload);
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  }

  // Create package after successful payment
  async createPackageAfterPayment(paymentIntentId: string, packageData: any): Promise<any> {
    try {
      const response = await api.post('/payments/create-package', {
        payment_intent_id: paymentIntentId,
        package_data: packageData
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create package after payment');
    }
  }

  // Confirm payment with payment method
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentStatus> {
    try {
      const response = await api.post('/payments/confirm', {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    try {
      const response = await api.get(`/payments/status/${paymentIntentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  }

  // Request refund for escrow
  async requestRefund(packageId: string | number, reason?: string): Promise<PaymentStatus> {
    try {
      const response = await api.post('/payments/refund', {
        package_id: packageId,
        reason: reason || 'No dropper assigned'
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request refund');
    }
  }

  // Get payment history for user
  async getPaymentHistory(): Promise<any[]> {
    try {
      const response = await api.get('/payments/history');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  }

  // Get payment details for a specific package
  async getPackagePayment(packageId: string | number): Promise<any> {
    try {
      const response = await api.get(`/payments/package/${packageId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get package payment');
    }
  }

  // Release payment from escrow when delivery is completed
  async releasePaymentFromEscrow(packageId: string | number): Promise<PaymentStatus> {
    try {
      const response = await api.post(`/payments/release/${packageId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to release payment from escrow');
    }
  }
}

export const paymentService = new PaymentService(); 