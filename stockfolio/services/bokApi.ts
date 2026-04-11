/**
 * 한국은행 ECOS API — 환율 정보
 * 출처: 한국은행 경제통계시스템 (ECOS, ecos.bok.or.kr)
 * 상업적 이용: 공공데이터법 적용, 출처 표시 필수
 *
 * 준수사항:
 * 1. 출처 표시: "출처: 한국은행" 명기
 * 2. 가공 사실 명시: 환율 가공 시 가공 사실 표기
 * 3. 오인 금지: 한국은행 후원/특수관계 암시 금지
 */
import axios from 'axios';

let API_KEY = 'LU2ZDQSMFY5M4VY4WCZB';

const BASE_URL = 'https://ecos.bok.or.kr/api';

// 통계표코드: 731Y001 = 원/달러 환율 (매매기준율)
const EXCHANGE_RATE_TABLE = '731Y001';
const USD_KRW_ITEM = '0000001'; // 원/미국달러

export interface ExchangeRateData {
  rate: number;          // 매매기준율
  date: string;          // 기준일 (YYYYMMDD)
  source: string;        // 출처
  lastUpdated: string;   // 조회 시각
}

export function setBokApiKey(key: string) {
  API_KEY = key;
}

/**
 * 최신 USD/KRW 환율 조회
 * 한국은행 ECOS API → 731Y001 (주요국통화의 대원화환율)
 */
export async function getUsdKrwRate(): Promise<ExchangeRateData | null> {
  if (!API_KEY) {
    // API 키 없으면 fallback 비율 반환
    return {
      rate: 1370,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      source: '한국은행 (기본값)',
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const { startDate, endDate } = getDateRange(7);

    const url = `${BASE_URL}/StatisticSearch/${API_KEY}/json/kr/1/1/${EXCHANGE_RATE_TABLE}/D/${startDate}/${endDate}/${USD_KRW_ITEM}`;

    const { data } = await axios.get(url, { timeout: 5000 });

    const rows = data?.StatisticSearch?.row;
    if (!rows || rows.length === 0) {
      return null;
    }

    // 가장 최근 데이터
    const latest = rows[rows.length - 1];
    return {
      rate: parseFloat(latest.DATA_VALUE?.replace(/,/g, '') || '0'),
      date: latest.TIME || '',
      source: '한국은행',
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    // CORS 등 네트워크 오류 시 fallback 반환
    return {
      rate: 1370,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      source: '한국은행 (기본값)',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * 환율 히스토리 조회 (차트용)
 */
export async function getExchangeRateHistory(
  days: number = 30
): Promise<Array<{ date: string; rate: number }>> {
  if (!API_KEY) return [];

  try {
    const { startDate, endDate } = getDateRange(days);
    const url = `${BASE_URL}/StatisticSearch/${API_KEY}/json/kr/1/100/${EXCHANGE_RATE_TABLE}/D/${startDate}/${endDate}/${USD_KRW_ITEM}`;

    const { data } = await axios.get(url, { timeout: 5000 });
    const rows = data?.StatisticSearch?.row;
    if (!rows) return [];

    return rows.map((r: { TIME: string; DATA_VALUE: string }) => ({
      date: r.TIME,
      rate: parseFloat(r.DATA_VALUE?.replace(/,/g, '') || '0'),
    }));
  } catch {
    return [];
  }
}

function getDateRange(daysBack: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${dd}`;
  };

  return { startDate: fmt(start), endDate: fmt(end) };
}
