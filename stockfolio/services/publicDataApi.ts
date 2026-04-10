/**
 * 공공데이터포털 API — 금융위원회 주식시세정보 / KRX상장종목정보
 * 출처: 금융위원회 (data.go.kr)
 * 상업적 이용: 공공데이터법에 의해 법적 보장
 */
import axios from 'axios';

// 공공데이터포털 API 키 — .env 또는 settings에서 관리
let API_KEY = '';

const STOCK_PRICE_URL =
  'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
const KRX_LISTING_URL =
  'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo';

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

/**
 * 한국주식 시세 조회 (금융위원회_주식시세정보)
 */
export async function getKrxStockPrice(
  stockCode: string,
  date?: string
): Promise<KrxStockPrice | null> {
  if (!API_KEY) return null;

  try {
    const basDt = date || getLatestBusinessDate();
    const { data } = await axios.get(STOCK_PRICE_URL, {
      params: {
        serviceKey: API_KEY,
        numOfRows: 1,
        pageNo: 1,
        resultType: 'json',
        srtnCd: stockCode,
        beginBasDt: basDt,
        endBasDt: basDt,
      },
      timeout: 10000,
    });

    const items = data?.response?.body?.items?.item;
    if (!items || items.length === 0) return null;
    return items[0] as KrxStockPrice;
  } catch {
    return null;
  }
}

/**
 * KRX 상장종목 검색 (금융위원회_KRX상장종목정보)
 */
export async function searchKrxStocks(
  query: string
): Promise<KrxListedStock[]> {
  if (!API_KEY) return [];

  try {
    // 종목코드(숫자)인지 종목명(한글/영문)인지 구분
    const isCode = /^\d+$/.test(query);
    const params: Record<string, string | number> = {
      serviceKey: API_KEY,
      numOfRows: 20,
      pageNo: 1,
      resultType: 'json',
    };

    if (isCode) {
      params.srtnCd = query;
    } else {
      params.itmsNm = query;
    }

    const { data } = await axios.get(KRX_LISTING_URL, {
      params,
      timeout: 10000,
    });

    const items = data?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch {
    return [];
  }
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
