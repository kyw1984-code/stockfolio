import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePortfolioStore, StockHolding } from '../../stores/usePortfolioStore';
import { useExchangeStore } from '../../stores/useExchangeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import DataSourceFooter from '../../components/DataSourceFooter';
import CountryPieChart from '../../components/CountryPieChart';
import ExchangeRateCard from '../../components/ExchangeRateCard';

export default function PortfolioScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    holdings,
    isLoading,
    refreshPrices,
    getTotalValue,
    getTodayChange,
    getTotalReturn,
    getKrHoldings,
    getUsHoldings,
  } = usePortfolioStore();
  const { fetchRate, convertToKrw, getRate } = useExchangeStore();
  const { currency, language } = useSettingsStore();

  useEffect(() => {
    fetchRate();
    if (holdings.length > 0) {
      refreshPrices();
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchRate();
    refreshPrices();
  }, [refreshPrices, fetchRate]);

  const totalValueUsd = getTotalValue();
  const todayChange = getTodayChange();
  const totalReturn = getTotalReturn();
  const isKo = language === 'ko';
  const showKrw = currency === 'KRW';

  const krHoldings = getKrHoldings();
  const usHoldings = getUsHoldings();

  // For KRW display: KR stocks are already in KRW, US stocks need conversion
  const getTotalValueDisplay = () => {
    if (!showKrw) return formatCurrency(totalValueUsd);
    const krValue = krHoldings.reduce((s, h) => s + h.currentPrice * h.shares, 0);
    const usValue = usHoldings.reduce((s, h) => s + h.currentPrice * h.shares, 0);
    return formatCurrency(krValue + convertToKrw(usValue), 'KRW');
  };

  const formatHoldingPrice = (holding: StockHolding, value: number) => {
    if (holding.market === 'KR') return formatCurrency(value, 'KRW');
    if (showKrw) return formatCurrency(convertToKrw(value), 'KRW');
    return formatCurrency(value);
  };

  // Build sections for SectionList
  const sections: Array<{ title: string; flag: string; data: StockHolding[] }> = [];
  if (krHoldings.length > 0) {
    sections.push({ title: isKo ? '🇰🇷 국내주식' : '🇰🇷 Korean Stocks', flag: '🇰🇷', data: krHoldings });
  }
  if (usHoldings.length > 0) {
    sections.push({
      title: isKo ? '🇺🇸 해외주식' + (showKrw ? ' ($→₩)' : '') : '🇺🇸 US Stocks',
      flag: '🇺🇸',
      data: usHoldings,
    });
  }

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{t('portfolio.totalValue')}</Text>
        <Text style={styles.totalValue}>{getTotalValueDisplay()}</Text>
        {showKrw && (
          <Text style={styles.exchangeRate}>
            환율 ₩{getRate().toLocaleString()} (한국은행)
          </Text>
        )}

        <View style={styles.changeRow}>
          <View style={styles.changeItem}>
            <Text style={styles.changeLabel}>{t('portfolio.todayChange')}</Text>
            <Text
              style={[
                styles.changeValue,
                { color: todayChange.value >= 0 ? '#34C759' : '#FF3B30' },
              ]}
            >
              {showKrw
                ? formatCurrency(convertToKrw(todayChange.value), 'KRW')
                : formatCurrency(todayChange.value)}{' '}
              ({formatPercent(todayChange.percent)})
            </Text>
          </View>
          <View style={styles.changeItem}>
            <Text style={styles.changeLabel}>{t('portfolio.totalReturn')}</Text>
            <Text
              style={[
                styles.changeValue,
                { color: totalReturn.value >= 0 ? '#34C759' : '#FF3B30' },
              ]}
            >
              {showKrw
                ? formatCurrency(convertToKrw(totalReturn.value), 'KRW')
                : formatCurrency(totalReturn.value)}{' '}
              ({formatPercent(totalReturn.percent)})
            </Text>
          </View>
        </View>
      </View>

      {/* Exchange Rate Card — Korean mode */}
      {showKrw && <ExchangeRateCard />}

      {/* Country Pie Chart — when both markets exist */}
      {krHoldings.length > 0 && usHoldings.length > 0 && <CountryPieChart />}
    </View>
  );

  const renderStock = ({ item }: { item: StockHolding }) => {
    const marketValue = item.currentPrice * item.shares;
    const gain = (item.currentPrice - item.avgCost) * item.shares;
    const gainPercent =
      item.avgCost > 0
        ? ((item.currentPrice - item.avgCost) / item.avgCost) * 100
        : 0;

    return (
      <TouchableOpacity
        style={styles.stockItem}
        onPress={() => router.push(`/stock/${item.symbol}`)}
      >
        <View style={styles.stockLeft}>
          <Text style={styles.stockSymbol}>{item.symbol}</Text>
          <Text style={styles.stockName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.stockShares}>
            {item.shares} {t('portfolio.shares')} · {t('portfolio.avgCost')}{' '}
            {formatHoldingPrice(item, item.avgCost)}
          </Text>
        </View>
        <View style={styles.stockRight}>
          <Text style={styles.stockPrice}>
            {formatHoldingPrice(item, item.currentPrice)}
          </Text>
          <Text
            style={[
              styles.stockGain,
              { color: gain >= 0 ? '#34C759' : '#FF3B30' },
            ]}
          >
            {formatHoldingPrice(item, gain)} ({formatPercent(gainPercent)})
          </Text>
          {/* Show KRW converted value for US stocks */}
          {showKrw && item.market === 'US' && (
            <Text style={styles.stockKrw}>
              {formatCurrency(convertToKrw(marketValue), 'KRW')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📈</Text>
      <Text style={styles.emptyTitle}>{t('portfolio.noStocks')}</Text>
      <Text style={styles.emptyDesc}>{t('portfolio.noStocksDesc')}</Text>
    </View>
  );

  if (holdings.length === 0) {
    return (
      <View style={styles.container}>
        {renderEmpty()}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-stock')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStock}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<DataSourceFooter showKorean={isKo || krHoldings.length > 0} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-stock')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: '700', color: '#000000' },
  exchangeRate: { fontSize: 12, color: '#AEAEB2', marginTop: 4 },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  changeItem: { flex: 1 },
  changeLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 2 },
  changeValue: { fontSize: 14, fontWeight: '600' },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#8E8E93' },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  stockLeft: { flex: 1, marginRight: 12 },
  stockSymbol: { fontSize: 16, fontWeight: '700', color: '#000000' },
  stockName: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  stockShares: { fontSize: 12, color: '#AEAEB2', marginTop: 4 },
  stockRight: { alignItems: 'flex-end' },
  stockPrice: { fontSize: 16, fontWeight: '600', color: '#000000' },
  stockGain: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  stockKrw: { fontSize: 11, color: '#AEAEB2', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 28, color: '#FFFFFF', fontWeight: '300' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#000', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
});
