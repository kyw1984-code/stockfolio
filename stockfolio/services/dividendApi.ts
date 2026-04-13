import { getDividends, getBasicFinancials } from './finnhubApi';

export interface DividendInfo {
  symbol: string;
  annualDividend: number;
  dividendPerShare: number;
  frequency: number; // payments per year
  exDate: string;
  payDate: string;
  yieldPercent: number;
}

export async function getDividendInfo(
  symbol: string,
  currentPrice: number
): Promise<DividendInfo | null> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const from = oneYearAgo.toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];

    const dividends = await getDividends(symbol, from, to);

    if (dividends && dividends.length > 0) {
      const frequency = dividends.length;
      const totalAnnualDiv = dividends.reduce((sum, d) => sum + d.amount, 0);
      const latestDiv = dividends[dividends.length - 1];
      return {
        symbol,
        annualDividend: totalAnnualDiv,
        dividendPerShare: latestDiv.amount,
        frequency,
        exDate: latestDiv.date,
        payDate: latestDiv.payDate,
        yieldPercent: currentPrice > 0 ? (totalAnnualDiv / currentPrice) * 100 : 0,
      };
    }

    // 폴백: /stock/metric의 연간 배당 데이터 사용
    const fin = await getBasicFinancials(symbol);
    const dps = fin?.metric?.dividendPerShareAnnual;
    const yieldPct = fin?.metric?.dividendYieldIndicatedAnnual;
    if (!dps || dps === 0) return null;

    return {
      symbol,
      annualDividend: dps,
      dividendPerShare: dps / 4,
      frequency: 4,
      exDate: '',
      payDate: '',
      yieldPercent: yieldPct || (currentPrice > 0 ? (dps / currentPrice) * 100 : 0),
    };
  } catch {
    return null;
  }
}

export function getMonthlyDividendSchedule(
  holdings: Array<{
    symbol: string;
    shares: number;
    dividendInfo: DividendInfo | null;
  }>
): Record<number, number> {
  const monthly: Record<number, number> = {};
  for (let m = 0; m < 12; m++) {
    monthly[m] = 0;
  }

  for (const holding of holdings) {
    if (!holding.dividendInfo) continue;
    const { frequency, annualDividend } = holding.dividendInfo;
    const perPayment = (annualDividend * holding.shares) / frequency;

    // Distribute payments based on frequency
    if (frequency === 12) {
      for (let m = 0; m < 12; m++) {
        monthly[m] += perPayment;
      }
    } else if (frequency === 4) {
      // Quarterly — typical months: Mar, Jun, Sep, Dec
      [2, 5, 8, 11].forEach((m) => {
        monthly[m] += perPayment;
      });
    } else if (frequency === 2) {
      [5, 11].forEach((m) => {
        monthly[m] += perPayment;
      });
    } else if (frequency === 1) {
      monthly[11] += perPayment;
    }
  }

  return monthly;
}
