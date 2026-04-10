import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import { useDividendStore } from '../../stores/useDividendStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import DataSourceFooter from '../../components/DataSourceFooter';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DividendsScreen() {
  const { t } = useTranslation();
  const { holdings } = usePortfolioStore();
  const {
    dividendData,
    monthlyGoal,
    fetchAllDividends,
    getAnnualDividend,
    getMonthlySchedule,
    getYieldOnCost,
  } = useDividendStore();

  useEffect(() => {
    if (holdings.length > 0) {
      fetchAllDividends(
        holdings.map((h) => ({ symbol: h.symbol, currentPrice: h.currentPrice }))
      );
    }
  }, [holdings.length]);

  const { language } = useSettingsStore();
  const isKo = language === 'ko';

  const holdingSummary = holdings.map((h) => ({
    symbol: h.symbol,
    shares: h.shares,
    avgCost: h.avgCost,
  }));

  const annualDiv = getAnnualDividend(holdingSummary);
  const monthlyAvg = annualDiv / 12;
  const yieldOnCost = getYieldOnCost(holdingSummary);
  const monthlySchedule = getMonthlySchedule(holdingSummary);
  const maxMonthly = Math.max(...Object.values(monthlySchedule), 1);

  const goalProgress = monthlyGoal > 0 ? (monthlyAvg / monthlyGoal) * 100 : 0;

  if (holdings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={styles.emptyTitle}>{t('dividends.noDividends')}</Text>
        <Text style={styles.emptyDesc}>{t('dividends.noDividendsDesc')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('dividends.annualDividend')}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(annualDiv)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('dividends.monthlyAvg')}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(monthlyAvg)}</Text>
        </View>
      </View>
      <View style={styles.yieldCard}>
        <Text style={styles.summaryLabel}>{t('dividends.yieldOnCost')}</Text>
        <Text style={styles.yieldValue}>{yieldOnCost.toFixed(2)}%</Text>
      </View>

      {/* Monthly Calendar Bar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dividends.calendar')}</Text>
        <View style={styles.chartContainer}>
          {MONTHS.map((month, index) => {
            const value = monthlySchedule[index] || 0;
            const barHeight = maxMonthly > 0 ? (value / maxMonthly) * 120 : 0;
            return (
              <View key={month} style={styles.barCol}>
                <Text style={styles.barValue}>
                  {value > 0 ? `$${Math.round(value)}` : ''}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2),
                      backgroundColor: value > 0 ? '#007AFF' : '#E5E5EA',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Dividend Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dividends.goalTitle')}</Text>
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>
            {t('dividends.goalAmount')}: {formatCurrency(monthlyGoal)}/mo
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(goalProgress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.goalProgress}>
            {goalProgress.toFixed(1)}% — {formatCurrency(monthlyAvg)} / {formatCurrency(monthlyGoal)}
          </Text>
        </View>
      </View>

      {/* Upcoming Dividends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dividends.nextDividend')}</Text>
        {holdings.map((h) => {
          const info = dividendData[h.symbol];
          if (!info) return null;
          return (
            <View key={h.symbol} style={styles.dividendItem}>
              <View>
                <Text style={styles.divSymbol}>{h.symbol}</Text>
                <Text style={styles.divDate}>Ex: {info.exDate}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.divAmount}>
                  {formatCurrency(info.dividendPerShare)}/share
                </Text>
                <Text style={styles.divTotal}>
                  Total: {formatCurrency(info.dividendPerShare * h.shares)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <DataSourceFooter showKorean={isKo} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#000' },
  yieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  yieldValue: { fontSize: 22, fontWeight: '700', color: '#34C759' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 18,
    borderRadius: 4,
    minHeight: 2,
  },
  barValue: {
    fontSize: 8,
    color: '#8E8E93',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 6,
  },
  goalCard: { paddingTop: 4 },
  goalLabel: { fontSize: 14, color: '#000', marginBottom: 8 },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  goalProgress: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  dividendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  divSymbol: { fontSize: 15, fontWeight: '600', color: '#000' },
  divDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  divAmount: { fontSize: 14, fontWeight: '500', color: '#000' },
  divTotal: { fontSize: 12, color: '#34C759', marginTop: 2 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#000', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
});
