import Constants from 'expo-constants';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  maxWithdrawal: number;
  minWithdrawal: number;
}

export const CURRENCY_CONFIG: CurrencyConfig = Constants.expoConfig?.extra?.currency || {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    maxWithdrawal: 10000,
    minWithdrawal: 50,
};

export const getCurrencyConfig = (): CurrencyConfig => CURRENCY_CONFIG; 