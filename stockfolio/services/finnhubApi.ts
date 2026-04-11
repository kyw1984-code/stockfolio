import axios from 'axios';

// Finnhub API key
const API_KEY = 'd7cu5epr01qv03etmimgd7cu5epr01qv03etmin0';
const BASE_URL = 'https://finnhub.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  params: { token: API_KEY },
  timeout: 5000,
});

export interface QuoteData {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
  t: number;  // Timestamp
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface DividendData {
  symbol: string;
  date: string;       // Ex-dividend date
  amount: number;
  payDate: string;
  declarationDate: string;
  currency: string;
  freq: string;        // annual, quarterly, monthly, etc.
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  logo: string;
  finnhubIndustry: string;
  marketCapitalization: number;
  exchange: string;
}

export async function getQuote(symbol: string): Promise<QuoteData> {
  const { data } = await api.get<QuoteData>('/quote', {
    params: { symbol: symbol.toUpperCase() },
  });
  return data;
}

export async function searchSymbol(query: string): Promise<SearchResult[]> {
  const { data } = await api.get<{ result: SearchResult[] }>('/search', {
    params: { q: query },
  });
  return (data.result || []).filter(
    (r) => r.type === 'Common Stock' || r.type === 'ETP'
  );
}

export async function getDividends(
  symbol: string,
  from: string,
  to: string
): Promise<DividendData[]> {
  const { data } = await api.get<DividendData[]>('/stock/dividend', {
    params: { symbol: symbol.toUpperCase(), from, to },
  });
  return data || [];
}

export async function getCompanyProfile(
  symbol: string
): Promise<CompanyProfile> {
  const { data } = await api.get<CompanyProfile>('/stock/profile2', {
    params: { symbol: symbol.toUpperCase() },
  });
  return data;
}

export function setApiKey(key: string) {
  api.defaults.params = { ...api.defaults.params, token: key };
}
