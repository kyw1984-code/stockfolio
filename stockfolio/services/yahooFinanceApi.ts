/**
 * Yahoo Finance 비공식 API — 한국 주식 시세 조회
 * 심볼 형태: '005930.KS' (KOSPI), '035720.KQ' (KOSDAQ)
 */
import axios from 'axios';

export interface YahooQuote {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

export async function getKrStockPrice(symbol: string): Promise<YahooQuote | null> {
  try {
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: { interval: '1d', range: '1d' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000,
      }
    );
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || !meta.regularMarketPrice) return null;

    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;

    return {
      price,
      previousClose,
      change,
      changePercent: previousClose > 0 ? (change / previousClose) * 100 : 0,
    };
  } catch {
    return null;
  }
}
