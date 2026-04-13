import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  currency: 'USD' | 'KRW';
  language: 'en' | 'ko';
  theme: 'dark' | 'light';
  priceAlertsEnabled: boolean;
  dividendAlertsEnabled: boolean;
  isPro: boolean;
  finnhubApiKey: string;

  setCurrency: (currency: 'USD' | 'KRW') => void;
  setLanguage: (language: 'en' | 'ko') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  togglePriceAlerts: () => void;
  toggleDividendAlerts: () => void;
  setIsPro: (isPro: boolean) => void;
  setFinnhubApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      language: 'en',
      theme: 'dark',
      priceAlertsEnabled: true,
      dividendAlertsEnabled: true,
      isPro: false,
      finnhubApiKey: '',

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      togglePriceAlerts: () =>
        set((s) => ({ priceAlertsEnabled: !s.priceAlertsEnabled })),
      toggleDividendAlerts: () =>
        set((s) => ({ dividendAlertsEnabled: !s.dividendAlertsEnabled })),
      setIsPro: (isPro) => set({ isPro }),
      setFinnhubApiKey: (key) => set({ finnhubApiKey: key }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
