/**
 * 공공데이터포털 API — 금융위원회 주식시세정보 / KRX상장종목정보 / 주식배당정보
 * 출처: 금융위원회 (data.go.kr)
 * 상업적 이용: 공공데이터법에 의해 법적 보장
 */
import axios from 'axios';
import Constants from 'expo-constants';

let API_KEY = Constants.expoConfig?.extra?.publicDataApiKey || '';

const STOCK_PRICE_URL =
  'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
const KRX_LISTING_URL =
  'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo';
const DIVIDEND_URL =
  'https://apis.data.go.kr/1160100/service/GetStocDiviInfoService/getDiviInfo';

export interface KrxStockPrice {
  basDt: string;      // 기준일자 (YYYYMMDD)
  srtnCd: string;     // 종목코드 (6자리)
  isinCd: string;     // ISIN코드
  itmsNm: string;     // 종목명
  mrktCtg: string;    // 시장구분 (KOSPI/KOSDAQ)
  clpr: string;       // 종가
  vs: string;         // 전일대비
  fltRt: string;      // 등락률
  mkp: string;        // 시가
  hipr: string;       // 고가
  lopr: string;       // 저가
  trqu: string;       // 거래량
  trPrc: string;      // 거래대금
  lstgStCnt: string;  // 상장주식수
  mrktTotAmt: string; // 시가총액
}

export interface KrxListedStock {
  srtnCd: string;     // 종목코드
  isinCd: string;     // ISIN코드
  mrktCtg: string;    // 시장구분
  itmsNm: string;     // 종목명
  crno: string;       // 법인등록번호
  corpNm: string;     // 법인명
}

export function setPublicDataApiKey(key: string) {
  API_KEY = key;
}

// ─── 전종목 캐시 ───────────────────────────────────────────────
let krxStockCache: KrxListedStock[] = [];

/**
 * KRX 전체 상장종목을 1회 로드하여 메모리에 캐시
 * (GetKrxListedInfoService — basDt 기준 2,700여 종목 반환)
 */
export async function loadKrxStockList(): Promise<void> {
  if (!API_KEY) return;
  if (krxStockCache.length > 0) return;

  for (let daysAgo = 1; daysAgo <= 5; daysAgo++) {
    try {
      const basDt = getDateDaysAgo(daysAgo);
      const { data } = await axios.get(KRX_LISTING_URL, {
        params: {
          serviceKey: API_KEY,
          numOfRows: 3000,
          pageNo: 1,
          resultType: 'json',
          basDt,
        },
        timeout: 15000,
      });

      const totalCount = data?.response?.body?.totalCount ?? 0;
      if (totalCount === 0) continue;

      const raw = data?.response?.body?.items?.item;
      if (!raw) continue;
      const list = (Array.isArray(raw) ? raw : [raw]) as KrxListedStock[];

      krxStockCache = list.map((item) => ({
        ...item,
        srtnCd: item.srtnCd.replace(/^A/, ''),
      }));
      return;
    } catch (e) {
    }
  }
}

/**
 * 캐시된 전종목에서 부분 검색 (한글/영문/종목코드)
 */
export function searchKrxLocal(query: string): KrxListedStock[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return krxStockCache
    .filter(
      (s) =>
        s.itmsNm.toLowerCase().includes(q) ||
        s.srtnCd.includes(q) ||
        (s.corpNm && s.corpNm.toLowerCase().includes(q))
    )
    .slice(0, 20);
}

/**
 * 한국주식 시세 조회 (금융위원회_주식시세정보)
 */
/**
 * srtnCd 로 시세 조회 시 itmsNm(종목명) 파라미터 사용
 * → GetStockSecuritiesInfoService 는 srtnCd 필터가 동작하지 않아 itmsNm 으로 대체
 */
export async function getKrxStockPrice(
  stockCode: string,
  stockName?: string,
  date?: string
): Promise<KrxStockPrice | null> {
  if (!API_KEY) return null;

  try {
    const basDt = date || getLatestBusinessDate();
    const params: Record<string, string | number> = {
      serviceKey: API_KEY,
      numOfRows: 1,
      pageNo: 1,
      resultType: 'json',
      basDt,
    };

    // itmsNm 이 있으면 종목명으로 정확히 필터 (srtnCd 필터 미지원 이슈 우회)
    if (stockName) {
      params.itmsNm = stockName;
    } else {
      params.srtnCd = stockCode;
    }

    const { data } = await axios.get(STOCK_PRICE_URL, { params, timeout: 5000 });

    const raw = data?.response?.body?.items?.item;
    const items = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

    // 당일 데이터 있으면 바로 반환
    if (items.length > 0 && items[0]?.srtnCd) {
      return items[0] as KrxStockPrice;
    }

    // 당일 데이터 없음 → 최근 7일 범위로 재시도
    const retryParams: Record<string, string | number> = {
      serviceKey: API_KEY,
      numOfRows: 1,
      pageNo: 1,
      resultType: 'json',
      beginBasDt: getDateDaysAgo(7),
      endBasDt: basDt,
    };
    if (stockName) {
      retryParams.itmsNm = stockName;
    } else {
      retryParams.srtnCd = stockCode;
    }

    const retryRes = await axios.get(STOCK_PRICE_URL, { params: retryParams, timeout: 5000 });
    const retryRaw = retryRes.data?.response?.body?.items?.item;
    if (!retryRaw) return null;
    const retryItems = Array.isArray(retryRaw) ? retryRaw : [retryRaw];
    return retryItems.length > 0 ? (retryItems[0] as KrxStockPrice) : null;
  } catch {
    return null;
  }
}

/**
 * KRX 상장종목 검색 (금융위원회_KRX상장종목정보)
 * GetKrxListedInfoService가 403이면 GetStockSecuritiesInfoService로 폴백
 */
export async function searchKrxStocks(
  query: string
): Promise<KrxListedStock[]> {
  if (!API_KEY) return [];

  const isCode = /^\d+$/.test(query);
  const baseParams: Record<string, string | number> = {
    serviceKey: API_KEY,
    numOfRows: 20,
    pageNo: 1,
    resultType: 'json',
  };

  // 1차: GetKrxListedInfoService
  try {
    const params = { ...baseParams };
    if (isCode) {
      params.srtnCd = query;
    } else {
      params.itmsNm = query;
    }

    const { data } = await axios.get(KRX_LISTING_URL, { params, timeout: 5000 });
    const items = data?.response?.body?.items?.item;
    if (items) {
      const list = Array.isArray(items) ? items : [items];
      if (list.length > 0) return list as KrxListedStock[];
    }
  } catch {
    // 403 등 에러 → 폴백으로 진행
  }

  // 2차 폴백: GetStockSecuritiesInfoService (시세 API) — 승인된 서비스
  try {
    const params: Record<string, string | number> = {
      ...baseParams,
      numOfRows: 20,
      beginBasDt: getDateDaysAgo(7),
      endBasDt: getLatestBusinessDate(),
    };
    if (isCode) {
      params.srtnCd = query;
    } else {
      params.itmsNm = query;
    }

    const { data } = await axios.get(STOCK_PRICE_URL, { params, timeout: 5000 });
    const raw = data?.response?.body?.items?.item;
    if (!raw) return [];
    const items = (Array.isArray(raw) ? raw : [raw]) as KrxStockPrice[];

    // 중복 종목코드 제거 후 KrxListedStock 형태로 변환
    const seen = new Set<string>();
    return items
      .filter((item) => {
        if (seen.has(item.srtnCd)) return false;
        seen.add(item.srtnCd);
        return true;
      })
      .map((item) => ({
        srtnCd: item.srtnCd,
        isinCd: item.isinCd,
        mrktCtg: item.mrktCtg,
        itmsNm: item.itmsNm,
        crno: '',
        corpNm: item.itmsNm,
      }));
  } catch {
    return [];
  }
}

/**
 * N일 전 날짜 계산 (YYYYMMDD)
 */
function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * 최근 영업일 계산 (YYYYMMDD)
 */
function getLatestBusinessDate(): string {
  const now = new Date();
  const day = now.getDay();
  // 토요일(6)→금요일, 일요일(0)→금요일
  if (day === 0) now.setDate(now.getDate() - 2);
  else if (day === 6) now.setDate(now.getDate() - 1);

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * 한국주식 배당 정보 조회 (금융위원회_주식배당정보 GetStocDiviInfoService)
 */
export async function getKrDividendInfo(
  stockName: string,
  currentPrice: number
) {
  if (!API_KEY) return null;
  try {
    // 최근 3년 데이터만 조회 (가장 최신 배당 기준)
    const endDt = getLatestBusinessDate();
    const beginDt = getDateDaysAgo(365 * 3);

    const { data } = await axios.get(DIVIDEND_URL, {
      params: {
        serviceKey: API_KEY,
        numOfRows: 20,
        pageNo: 1,
        resultType: 'json',
        stckIssuCmpyNm: stockName,
        beginBasDt: beginDt,
        endBasDt: endDt,
      },
      timeout: 5000,
    });

    const raw = data?.response?.body?.items?.item;
    if (!raw) return null;
    const items = (Array.isArray(raw) ? raw : [raw]) as Array<Record<string, string>>;
    if (items.length === 0) return null;

    // dvdnBasDt 기준으로 내림차순 정렬 → 가장 최근 배당 선택
    const sorted = [...items].sort((a, b) =>
      (b.dvdnBasDt || '').localeCompare(a.dvdnBasDt || '')
    );
    const latest = sorted[0];
    const dps = parseFloat(latest.stckGenrDvdnAmt) || 0;
    if (dps === 0) return null;

    const formatDate = (d: string) =>
      d ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : '';

    return {
      symbol: stockName,
      annualDividend: dps,
      dividendPerShare: dps,
      frequency: 1,
      exDate: formatDate(latest.dvdnBasDt),
      payDate: formatDate(latest.cashDvdnPayDt),
      yieldPercent: currentPrice > 0 ? (dps / currentPrice) * 100 : 0,
    };
  } catch {
    return null;
  }
}
