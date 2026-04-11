import { create } from 'zustand';

interface SettingsState {
  currency: 'USD' | 'KRW';
  language: 'en' | 'ko';
  priceAlertsEnabled: boolean;
  dividendAlertsEnabled: boolean;
  isPro: boolean;
  finnhubApiKey: string;

  setCurrency: (currency: 'USD' | 'KRW') => void;
  setLanguage: (language: 'en' | 'ko') => void;
  togglePriceAlerts: () => void;
  toggleDividendAlerts: () => void;
  setIsPro: (isPro: boolean) => void;
  setFinnhubApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: 'USD',
  language: 'en',
  priceAlertsEnabled: true,
  dividendAlertsEnabled: true,
  isPro: false,
  finnhubApiKey: 'd7cu5epr01qv03etmimgd7cu5epr01qv03etmin0',

  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
  togglePriceAlerts: () =>
    set((s) => ({ priceAlertsEnabled: !s.priceAlertsEnabled })),
  toggleDividendAlerts: () =>
    set((s) => ({ dividendAlertsEnabled: !s.dividendAlertsEnabled })),
  setIsPro: (isPro) => set({ isPro }),
  setFinnhubApiKey: (key) => set({ finnhubApiKey: key }),
}));
