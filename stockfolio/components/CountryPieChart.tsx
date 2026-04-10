import { View, Text, StyleSheet } from 'react-native';
import { usePortfolioStore, StockHolding } from '../stores/usePortfolioStore';
import { useExchangeStore } from '../stores/useExchangeStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { formatCurrency } from '../utils/formatters';

interface CountryBreakdown {
  country: string;
  label: string;
  flag: string;
  value: number;
  valueKrw: number;
  percent: number;
  color: string;
}

export default function CountryPieChart() {
  const { holdings } = usePortfolioStore();
  const { convertToKrw } = useExchangeStore();
  const { currency } = useSettingsStore();

  if (holdings.length === 0) return null;

  const breakdown = getCountryBreakdown(holdings, convertToKrw);
  const maxPercent = Math.max(...breakdown.map((b) => b.percent), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {currency === 'KRW' ? '국내/해외 비중' : 'Domestic/Foreign Allocation'}
      </Text>

      {/* Simple horizontal bars */}
      {breakdown.map((item) => (
        <View key={item.country} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.percent}>{item.percent.toFixed(1)}%</Text>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(item.percent / maxPercent) * 100}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <Text style={styles.value}>
            {currency === 'KRW'
              ? formatCurrency(item.valueKrw, 'KRW')
              : formatCurrency(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function getCountryBreakdown(
  holdings: StockHolding[],
  convertToKrw: (usd: number) => number
): CountryBreakdown[] {
  let krValue = 0;
  let usValue = 0;

  holdings.forEach((h) => {
    const mv = h.currentPrice * h.shares;
    if (h.market === 'KR') {
      krValue += mv;
    } else {
      usValue += mv;
    }
  });

  const total = krValue + convertToKrw(usValue);
  if (total === 0) return [];

  const result: CountryBreakdown[] = [];

  if (krValue > 0) {
    result.push({
      country: 'KR',
      label: '국내주식',
      flag: '🇰🇷',
      value: krValue,
      valueKrw: krValue,
      percent: (krValue / total) * 100,
      color: '#FF3B30',
    });
  }

  if (usValue > 0) {
    const usKrw = convertToKrw(usValue);
    result.push({
      country: 'US',
      label: '해외주식 ($→₩)',
      flag: '🇺🇸',
      value: usValue,
      valueKrw: usKrw,
      percent: (usKrw / total) * 100,
      color: '#007AFF',
    });
  }

  return result.sort((a, b) => b.percent - a.percent);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  row: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  barBg: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
});
