import { create } from 'zustand';
import { getUsdKrwRate, ExchangeRateData } from '../services/bokApi';

interface ExchangeState {
  usdKrw: ExchangeRateData | null;
  isLoading: boolean;
  lastFetched: string | null;

  fetchRate: () => Promise<void>;
  convertToKrw: (usdAmount: number) => number;
  getRate: () => number;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  usdKrw: null,
  isLoading: false,
  lastFetched: null,

  fetchRate: async () => {
    set({ isLoading: true });
    try {
      const data = await getUsdKrwRate();
      if (data) {
        set({ usdKrw: data, lastFetched: new Date().toISOString() });
      }
    } catch {
      // keep existing rate
    }
    set({ isLoading: false });
  },

  convertToKrw: (usdAmount: number) => {
    const rate = get().getRate();
    return usdAmount * rate;
  },

  getRate: () => {
    return get().usdKrw?.rate || 1370;
  },
}));
