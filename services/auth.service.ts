import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
  role?: string;
  account_role?: string;
  remember?: boolean;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  nationality: string;
  gender: string;
  account_role?: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface SettingsData {
  language?: string;
  account_role?: string;
  max_distance?: number;
  global_search?: boolean;
  enable_discovery?: boolean;
  discovery_location?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  gender: string;
  nationality: string;
  date_of_birth: string | null;
  document: string | null;
  is_verified: number;
  settings: SettingsData | string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  message: string;
  user: UserData;
}

interface RestoreConfirmationResponse {
  requires_restore_confirmation: boolean;
  message: string;
  deleted_at: string;
  user_email: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    console.log('Login Request:', { 
      url: '/login',
      data: { ...credentials, password: '****' } 
    });

    try {
      const response = await api.post<LoginResponse>('/login', credentials, {
        timeout: 30000, // 30 seconds timeout
      });
      console.log('Login Response:', {
        status: response.status,
        data: response.data
      });

      // Check if account restoration is required
      const responseData = response.data as any;
      if (responseData.requires_restore_confirmation) {
        return {
          requires_restore_confirmation: true,
          message: responseData.message,
          deleted_at: responseData.deleted_at,
          user_email: responseData.user_email,
        } as RestoreConfirmationResponse;
      }

      const { access_token, user } = response.data as LoginResponse;
      
      // Store the token without Bearer prefix (will be added by API interceptor)
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // If remember me is true, store a flag
      if (credentials.remember) {
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('remember_me');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });

      throw error;
    }
  }

  async restoreAccount(credentials: LoginCredentials) {
    try {
      const response = await api.post<LoginResponse>('/restore-account', credentials, {
        timeout: 30000,
      });

      const { access_token, user } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      if (credentials.remember) {
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('remember_me');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Restore Account Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async register(data: RegisterData) {
    console.log('Register Request:', { 
      url: '/register',
      data: { ...data, password: '****', password_confirmation: '****' } 
    });

    try {
      const response = await api.post('/register', data, {
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log('Register Response:', {
        status: response.status,
        data: response.data
      });

      const { token : access_token, user } = response.data?.data;
      
      // Store the token without Bearer prefix (will be added by API interceptor)
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      console.error('Register Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });

      throw error;
    }
  }

  async getUser() {
    try {
      const response = await api.get('/user');

      const { user } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Get User API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        }
      });
      
      // If it's an auth error, clear the token
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('auth_token');
      }
      
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const response = await api.post('/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      console.error('API Response Error:', error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      const response = await api.post('/resend-otp', { email });
      return response.data;
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordData) {
    try {
      const response = await api.post('/forgot-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData) {
    try {
      const response = await api.post('/reset-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Logging out...');
      await api.post('/logout');
      console.log('Logout API call successful');
      
      // Clear all auth data including remember me
      await AsyncStorage.multiRemove(['auth_token', 'user', 'remember_me']);
      console.log('Local storage cleared');
    } catch (error: any) {
      console.error('Logout Error:', error);
      
      // Even if the API call fails, clear local storage
      await AsyncStorage.multiRemove(['auth_token', 'user', 'remember_me']);
      
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error: any) {
      console.error('Get Current User Error:', error);
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      // If no token exists, user is not authenticated
      if (!token) {
        return false;
      }
      
      // Check if remember me is set (optional check)
      const rememberMe = await AsyncStorage.getItem('remember_me');
      
      // If remember me is not set, user needs to login again
      if (!rememberMe) {
        // Clear the token since remember me is not set
        await AsyncStorage.removeItem('auth_token');
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Is Authenticated Error:', error);
      return false; // Return false on error instead of throwing
    }
  }

  async updateUserImage(imageUrl: string) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        user.image = imageUrl;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Update User Image Error:', error);
      throw error;
    }
  }

  async updateUserDocument(documentUrl: string) {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        user.document = documentUrl;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Update User Document Error:', error);
      throw error;
    }
  }

  async updateUserProfile(userData: any) {
    try {
      const response = await api.post('/update-profile', userData);

      const { user } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error: any) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  }

  async updateUserSettings(newSettings: SettingsData) {
    try {
      const response = await api.post('/update-settings', {
        settings: newSettings
      });

      // Get current user from storage
      const user = await this.getCurrentUser();
      if (user) {
        // Update user's settings
        user.settings = response.data.settings;
        // Save updated user back to storage
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    } catch (error: any) {
      console.error('Update User Settings Error:', error);
      throw error;
    }
  }

  async uploadImage(imageUri: string, type: 'profile' | 'id_card') {
    try { 
      
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${type}_${Date.now()}.jpg`
      } as any);
      formData.append('type', type === 'profile' ? 'image' : 'document');

      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase to 60 seconds for image uploads
      });

      // If this is a profile image upload, update the user's image in auth service
      if (type === 'profile' && response.data?.data?.image) {
        await authService.updateUserImage(response.data.data.image);
      }
      if (type === 'id_card' && response.data?.data?.document) {
        await authService.updateUserDocument(response.data.data.document);
      }

      return response.data;
    } catch (error: any) {
      console.error(`Error uploading ${type} image:`, error);
      let errorMessage = `Failed to upload ${type} image. Please try again.`;
      
      if (error?.response?.data?.errors) {
        // Convert validation errors object to readable message
        const errors = error.response.data.errors;
        errorMessage = Object.keys(errors)
          .map(key => errors[key].join('\n'))
          .join('\n');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  async phoneLogin(data: { phone: string; role: string }) {
    try {
      // Validate phone number format
      if (!data.phone.startsWith('+')) {
        throw new Error('Phone number must start with country code (e.g., +880)');
      }

      // Validate role
      if (!data.role) {
        throw new Error('Role is required');
      }

      const response = await api.post('/phone-login', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async verifyPhoneOtp(phone: string, otp: string) {
    try {
      const response = await api.post('/verify-phone-otp', { phone, otp });
      
      const { access_token, user } = response.data;
      if (access_token) {
        await AsyncStorage.setItem('auth_token', `Bearer ${access_token}`);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async googleLogin(data: { id_token: string; role?: string; account_role?: string }) {
    try {
      const response = await api.post('/google-login', data, {
        timeout: 30000,
      });

      const { access_token, user } = response.data;
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      console.error('Google Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async appleLogin(data: { identity_token: string; email?: string | null; first_name?: string; last_name?: string; role?: string; account_role?: string }) {
    try {
      const response = await api.post('/apple-login', data, {
        timeout: 30000,
      });

      // Check if account restoration is required
      if (response.data.requires_restore_confirmation) {
        return {
          requires_restore_confirmation: true,
          message: response.data.message,
          deleted_at: response.data.deleted_at,
          user_email: response.data.user_email,
        };
      }

      const { access_token, user } = response.data;
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Store remember me flag
      await AsyncStorage.setItem('remember_me', 'true');
      
      return response.data;
    } catch (error: any) {
      console.error('Apple Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async restoreAppleAccount(data: { identity_token: string; email?: string | null; role?: string; account_role?: string }) {
    try {
      const response = await api.post('/apple-restore', data, {
        timeout: 30000,
      });

      const { access_token, user } = response.data;
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Store remember me flag
      await AsyncStorage.setItem('remember_me', 'true');
      
      return response.data;
    } catch (error: any) {
      console.error('Restore Apple Account Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async checkPhoneExists(phone: string) {
    try {
      // Validate phone number format
      if (!phone.startsWith('+')) {
        throw new Error('Phone number must start with country code (e.g., +880)');
      }
      const response = await api.post('/check-phone-exists', { phone });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

}

export const authService = new AuthService(); 