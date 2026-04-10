/**
 * 한국 세금 관련 상수 및 계산
 */

// 한국 배당소득세: 15.4% (소득세 14% + 지방소득세 1.4%)
export const KR_DIVIDEND_TAX_RATE = 0.154;

// 해외주식 배당 원천징수세: 15% (미국 기준)
export const US_DIVIDEND_WITHHOLDING_RATE = 0.15;

// 해외주식 양도소득세: 22% (소득세 20% + 지방소득세 2%)
export const OVERSEAS_CAPITAL_GAINS_TAX_RATE = 0.22;

// 해외주식 양도소득 기본공제: 250만원
export const OVERSEAS_CAPITAL_GAINS_DEDUCTION = 2_500_000;

// 금융소득 종합과세 기준: 2,000만원
export const FINANCIAL_INCOME_THRESHOLD = 20_000_000;

/**
 * 국내 배당소득세 계산 (15.4%)
 */
export function calculateKrDividendTax(grossDividend: number): {
  tax: number;
  netDividend: number;
  taxRate: number;
} {
  const tax = grossDividend * KR_DIVIDEND_TAX_RATE;
  return {
    tax,
    netDividend: grossDividend - tax,
    taxRate: KR_DIVIDEND_TAX_RATE * 100,
  };
}

/**
 * 해외 배당소득세 계산 (미국 15% 원천징수)
 */
export function calculateUsDividendTax(grossDividendUsd: number, exchangeRate: number): {
  taxUsd: number;
  taxKrw: number;
  netDividendUsd: number;
  netDividendKrw: number;
} {
  const taxUsd = grossDividendUsd * US_DIVIDEND_WITHHOLDING_RATE;
  return {
    taxUsd,
    taxKrw: taxUsd * exchangeRate,
    netDividendUsd: grossDividendUsd - taxUsd,
    netDividendKrw: (grossDividendUsd - taxUsd) * exchangeRate,
  };
}

/**
 * 해외주식 양도소득세 계산
 * - 연간 양도차익에서 250만원 기본공제 후 22% 과세
 */
export function calculateOverseasCapitalGainsTax(
  totalGainKrw: number
): {
  taxableGain: number;
  tax: number;
  netGain: number;
  deduction: number;
} {
  const taxableGain = Math.max(totalGainKrw - OVERSEAS_CAPITAL_GAINS_DEDUCTION, 0);
  const tax = taxableGain * OVERSEAS_CAPITAL_GAINS_TAX_RATE;
  return {
    taxableGain,
    tax,
    netGain: totalGainKrw - tax,
    deduction: OVERSEAS_CAPITAL_GAINS_DEDUCTION,
  };
}
