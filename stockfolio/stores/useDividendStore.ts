import { create } from 'zustand';
import { DividendInfo, getDividendInfo, getMonthlyDividendSchedule } from '../services/dividendApi';

interface DividendState {
  dividendData: Record<string, DividendInfo | null>;
  monthlyGoal: number;
  isLoading: boolean;

  fetchDividendInfo: (symbol: string, currentPrice: number) => Promise<void>;
  fetchAllDividends: (holdings: Array<{ symbol: string; currentPrice: number }>) => Promise<void>;
  setMonthlyGoal: (goal: number) => void;

  getAnnualDividend: (holdings: Array<{ symbol: string; shares: number }>) => number;
  getMonthlySchedule: (holdings: Array<{ symbol: string; shares: number }>) => Record<number, number>;
  getYieldOnCost: (holdings: Array<{ symbol: string; shares: number; avgCost: number }>) => number;
}

export const useDividendStore = create<DividendState>((set, get) => ({
  dividendData: {},
  monthlyGoal: 500,
  isLoading: false,

  fetchDividendInfo: async (symbol, currentPrice) => {
    const info = await getDividendInfo(symbol, currentPrice);
    set((state) => ({
      dividendData: { ...state.dividendData, [symbol.toUpperCase()]: info },
    }));
  },

  fetchAllDividends: async (holdings) => {
    set({ isLoading: true });
    try {
      // 3개씩 나눠서 순차 처리 (Finnhub rate limit 보호)
      const BATCH_SIZE = 3;
      const newData: Record<string, DividendInfo | null> = {};

      for (let i = 0; i < holdings.length; i += BATCH_SIZE) {
        const batch = holdings.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(async (h) => {
            const info = await getDividendInfo(h.symbol, h.currentPrice);
            return { symbol: h.symbol.toUpperCase(), info };
          })
        );
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            newData[r.value.symbol] = r.value.info;
          }
        });
      }

      set({ dividendData: newData, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setMonthlyGoal: (goal) => set({ monthlyGoal: goal }),

  getAnnualDividend: (holdings) => {
    const { dividendData } = get();
    return holdings.reduce((sum, h) => {
      const info = dividendData[h.symbol.toUpperCase()];
      if (!info) return sum;
      return sum + info.annualDividend * h.shares;
    }, 0);
  },

  getMonthlySchedule: (holdings) => {
    const { dividendData } = get();
    return getMonthlyDividendSchedule(
      holdings.map((h) => ({
        ...h,
        dividendInfo: dividendData[h.symbol.toUpperCase()] || null,
      }))
    );
  },

  getYieldOnCost: (holdings) => {
    const { dividendData } = get();
    let totalCost = 0;
    let totalAnnualDiv = 0;

    holdings.forEach((h) => {
      const info = dividendData[h.symbol.toUpperCase()];
      if (!info) return;
      totalCost += h.avgCost * h.shares;
      totalAnnualDiv += info.annualDividend * h.shares;
    });

    return totalCost > 0 ? (totalAnnualDiv / totalCost) * 100 : 0;
  },
}));
