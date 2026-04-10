export function calculateTotalReturn(
  currentPrice: number,
  avgCost: number,
  shares: number
): { value: number; percent: number } {
  const value = (currentPrice - avgCost) * shares;
  const percent = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;
  return { value, percent };
}

export function calculateWeight(
  marketValue: number,
  totalPortfolioValue: number
): number {
  if (totalPortfolioValue === 0) return 0;
  return (marketValue / totalPortfolioValue) * 100;
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): { finalValue: number; totalInvested: number; totalReturn: number } {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  let balance = principal;

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }

  const totalInvested = principal + monthlyContribution * months;
  return {
    finalValue: balance,
    totalInvested,
    totalReturn: balance - totalInvested,
  };
}

export function calculateDCA(
  monthlyInvestment: number,
  periods: number,
  prices: number[]
): { avgCost: number; totalShares: number; totalInvested: number } {
  let totalShares = 0;
  const totalInvested = monthlyInvestment * periods;

  for (let i = 0; i < periods; i++) {
    const price = prices[i % prices.length];
    if (price > 0) {
      totalShares += monthlyInvestment / price;
    }
  }

  const avgCost = totalShares > 0 ? totalInvested / totalShares : 0;
  return { avgCost, totalShares, totalInvested };
}

export function calculateDividendGoal(
  monthlyGoal: number,
  avgYield: number
): number {
  if (avgYield <= 0) return 0;
  const annualGoal = monthlyGoal * 12;
  return annualGoal / (avgYield / 100);
}

export function calculateYieldOnCost(
  annualDividendPerShare: number,
  avgCost: number
): number {
  if (avgCost <= 0) return 0;
  return (annualDividendPerShare / avgCost) * 100;
}

export function calculateAnnualDividend(
  dividendPerShare: number,
  frequency: number,
  shares: number
): number {
  return dividendPerShare * frequency * shares;
}
