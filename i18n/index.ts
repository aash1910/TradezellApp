import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { authService } from '@/services/auth.service';
import { LANGUAGES, LANG_CODES } from '@/constants/languages';

i18n
  .use(initReactI18next)
  .init({
    resources: LANGUAGES,
    lng: Localization.getLocales()?.[0]?.languageCode || 'en', // Default to device language
    fallbackLng: 'en',
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false
    }
  });

// Handle language loading from user settings
const loadUserLanguage = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (user?.settings) {
      const settings = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
      if (settings.language && LANG_CODES.includes(settings.language)) {
        await i18n.changeLanguage(settings.language);
      }
    }
  } catch (error) {
    console.error('Error loading user language:', error);
  }
};

// Load user language on initialization
loadUserLanguage();

export default i18n; 