import { create } from 'zustand';
import { getQuote } from '../services/finnhubApi';
import { getKrxStockPrice } from '../services/publicDataApi';
import { getCachedPrice, setCachedPrice } from '../services/priceCache';
import { getSector } from '../data/sectorMapping';

export type MarketType = 'US' | 'KR';

export interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  previousClose: number;
  sector: string;
  market: MarketType;
  addedAt: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend';
  shares: number;
  price: number;
  amount: number;
  date: string;
}

interface PortfolioState {
  holdings: StockHolding[];
  transactions: Transaction[];
  isLoading: boolean;
  lastUpdated: string | null;

  addHolding: (symbol: string, name: string, shares: number, avgCost: number, market?: MarketType) => void;
  removeHolding: (symbol: string) => void;
  updateHolding: (symbol: string, updates: Partial<StockHolding>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  refreshPrices: () => Promise<void>;

  // Computed
  getTotalValue: () => number;
  getTodayChange: () => { value: number; percent: number };
  getTotalReturn: () => { value: number; percent: number };
  getSectorBreakdown: () => Array<{ sector: string; value: number; percent: number }>;
  getKrHoldings: () => StockHolding[];
  getUsHoldings: () => StockHolding[];
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  transactions: [],
  isLoading: false,
  lastUpdated: null,

  addHolding: (symbol, name, shares, avgCost, market = 'US') => {
    const existing = get().holdings.find(
      (h) => h.symbol.toUpperCase() === symbol.toUpperCase()
    );
    if (existing) {
      // Average up/down
      const totalShares = existing.shares + shares;
      const newAvgCost =
        (existing.avgCost * existing.shares + avgCost * shares) / totalShares;
      set((state) => ({
        holdings: state.holdings.map((h) =>
          h.symbol.toUpperCase() === symbol.toUpperCase()
            ? { ...h, shares: totalShares, avgCost: newAvgCost }
            : h
        ),
      }));
    } else {
      const newHolding: StockHolding = {
        symbol: symbol.toUpperCase(),
        name,
        shares,
        avgCost,
        currentPrice: avgCost,
        previousClose: avgCost,
        sector: getSector(symbol),
        market,
        addedAt: new Date().toISOString(),
      };
      set((state) => ({ holdings: [...state.holdings, newHolding] }));
    }

    // Add buy transaction
    get().addTransaction({
      symbol: symbol.toUpperCase(),
      type: 'buy',
      shares,
      price: avgCost,
      amount: shares * avgCost,
      date: new Date().toISOString(),
    });
  },

  removeHolding: (symbol) => {
    set((state) => ({
      holdings: state.holdings.filter(
        (h) => h.symbol.toUpperCase() !== symbol.toUpperCase()
      ),
    }));
  },

  updateHolding: (symbol, updates) => {
    set((state) => ({
      holdings: state.holdings.map((h) =>
        h.symbol.toUpperCase() === symbol.toUpperCase()
          ? { ...h, ...updates }
          : h
      ),
    }));
  },

  addTransaction: (tx) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      transactions: [...state.transactions, { ...tx, id }],
    }));
  },

  refreshPrices: async () => {
    const { holdings, isLoading } = get();
    if (holdings.length === 0 || isLoading) return;

    set({ isLoading: true });

    try {
      // 5개씩 나눠서 순차 처리 (동시 API 호출 폭주 방지)
      const BATCH_SIZE = 5;
      const allResults: Array<{ symbol: string; price: number; previousClose: number } | null> = [];

      for (let i = 0; i < holdings.length; i += BATCH_SIZE) {
        const batch = holdings.slice(i, i + BATCH_SIZE);
        const batchUpdates = await Promise.allSettled(
          batch.map(async (h) => {
            const cached = getCachedPrice(h.symbol);
            if (cached) {
              return { symbol: h.symbol, price: cached.price, previousClose: cached.price - cached.change };
            }

            if (h.market === 'KR') {
              const krData = await getKrxStockPrice(h.symbol);
              if (krData) {
                const price = parseFloat(krData.clpr);
                const change = parseFloat(krData.vs);
                const changePercent = parseFloat(krData.fltRt);
                setCachedPrice(h.symbol, price, change, changePercent);
                return { symbol: h.symbol, price, previousClose: price - change };
              }
              return null;
            }

            const quote = await getQuote(h.symbol);
            if (quote && quote.c > 0) {
              setCachedPrice(h.symbol, quote.c, quote.d, quote.dp);
              return { symbol: h.symbol, price: quote.c, previousClose: quote.pc };
            }
            return null;
          })
        );
        batchUpdates.forEach((r) => {
          allResults.push(r.status === 'fulfilled' ? r.value : null);
        });
      }

      set((state) => {
        const newHoldings = state.holdings.map((h) => {
          const result = allResults.find((r) => r && r.symbol === h.symbol);
          if (result) {
            return { ...h, currentPrice: result.price, previousClose: result.previousClose };
          }
          return h;
        });
        return { holdings: newHoldings, isLoading: false, lastUpdated: new Date().toISOString() };
      });
    } catch {
      set({ isLoading: false });
    }
  },

  getTotalValue: () => {
    return get().holdings.reduce(
      (sum, h) => sum + h.currentPrice * h.shares,
      0
    );
  },

  getTodayChange: () => {
    const holdings = get().holdings;
    const todayValue = holdings.reduce(
      (sum, h) => sum + (h.currentPrice - h.previousClose) * h.shares,
      0
    );
    const prevTotal = holdings.reduce(
      (sum, h) => sum + h.previousClose * h.shares,
      0
    );
    return {
      value: todayValue,
      percent: prevTotal > 0 ? (todayValue / prevTotal) * 100 : 0,
    };
  },

  getTotalReturn: () => {
    const holdings = get().holdings;
    const totalCost = holdings.reduce(
      (sum, h) => sum + h.avgCost * h.shares,
      0
    );
    const totalValue = holdings.reduce(
      (sum, h) => sum + h.currentPrice * h.shares,
      0
    );
    return {
      value: totalValue - totalCost,
      percent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };
  },

  getSectorBreakdown: () => {
    const holdings = get().holdings;
    const totalValue = get().getTotalValue();
    const sectorMap = new Map<string, number>();

    holdings.forEach((h) => {
      const value = h.currentPrice * h.shares;
      sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + value);
    });

    return Array.from(sectorMap.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  },

  getKrHoldings: () => get().holdings.filter((h) => h.market === 'KR'),
  getUsHoldings: () => get().holdings.filter((h) => h.market === 'US'),
}));
