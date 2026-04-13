import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTranslation } from '../../utils/useAppTranslation';
import { usePortfolioStore, StockHolding } from '../../stores/usePortfolioStore';
import { useDividendStore } from '../../stores/useDividendStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useExchangeStore } from '../../stores/useExchangeStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function StockDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const { t } = useAppTranslation();
  const router = useRouter();
  const { holdings, transactions, removeHolding } = usePortfolioStore();
  const { dividendData, fetchDividendInfo } = useDividendStore();
  const { currency } = useSettingsStore();
  const { convertToKrw } = useExchangeStore();

  const holding = holdings.find(
    (h) => h.symbol === ticker?.toUpperCase()
  );

  const stockTxs = transactions.filter(
    (tx) => tx.symbol === ticker?.toUpperCase()
  );

  const divInfo = dividendData[ticker?.toUpperCase() || ''];

  useEffect(() => {
    if (holding && !divInfo) {
      fetchDividendInfo(holding.symbol, holding.currentPrice, holding.market, holding.name);
    }
  }, [holding?.symbol]);

  if (!holding) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('stockDetail.notFound')}</Text>
      </View>
    );
  }

  const showKrw = currency === 'KRW';

  const formatPrice = (h: StockHolding, value: number) => {
    if (h.market === 'KR') return formatCurrency(value, 'KRW');
    if (showKrw) return formatCurrency(convertToKrw(value), 'KRW');
    return formatCurrency(value);
  };

  const marketValue = holding.currentPrice * holding.shares;
  const totalCost = holding.avgCost * holding.shares;
  const gain = marketValue - totalCost;
  const gainPercent =
    totalCost > 0 ? ((marketValue - totalCost) / totalCost) * 100 : 0;
  const dayChange =
    (holding.currentPrice - holding.previousClose) * holding.shares;

  const handleDelete = () => {
    Alert.alert(
      t('stockDetail.deleteTitle'),
      t('stockDetail.deleteMsg').replace('{symbol}', holding.symbol),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            removeHolding(holding.symbol);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.symbol}>{holding.symbol}</Text>
        <Text style={styles.name}>{holding.name}</Text>
        <Text style={styles.price}>{formatPrice(holding, holding.currentPrice)}</Text>
        <Text
          style={[
            styles.change,
            {
              color:
                holding.currentPrice >= holding.previousClose
                  ? '#34C759'
                  : '#FF3B30',
            },
          ]}
        >
          {formatPrice(holding, holding.currentPrice - holding.previousClose)} (
          {formatPercent(
            holding.previousClose > 0
              ? ((holding.currentPrice - holding.previousClose) /
                  holding.previousClose) *
                  100
              : 0
          )}
          )
        </Text>
      </View>

      {/* Holdings Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('stockDetail.holdings')}</Text>
        <InfoRow
          label={t('portfolio.shares')}
          value={holding.shares.toString()}
        />
        <InfoRow
          label={t('portfolio.avgCost')}
          value={formatPrice(holding, holding.avgCost)}
        />
        <InfoRow
          label={t('portfolio.marketValue')}
          value={formatPrice(holding, marketValue)}
        />
        <InfoRow
          label={t('portfolio.gain')}
          value={`${formatPrice(holding, gain)} (${formatPercent(gainPercent)})`}
          color={gain >= 0 ? '#34C759' : '#FF3B30'}
        />
        <InfoRow
          label={t('portfolio.todayChange')}
          value={formatPrice(holding, dayChange)}
          color={dayChange >= 0 ? '#34C759' : '#FF3B30'}
        />
        <InfoRow label={t('portfolio.sector')} value={holding.sector} />
      </View>

      {/* Dividend Info */}
      {divInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dividends.title')}</Text>
          <InfoRow
            label={t('stockDetail.dividendPerShare')}
            value={formatPrice(holding, divInfo.dividendPerShare)}
          />
          <InfoRow
            label={t('dividends.annualDividend')}
            value={formatPrice(holding, divInfo.annualDividend * holding.shares)}
          />
          <InfoRow
            label={t('stockDetail.yield')}
            value={`${divInfo.yieldPercent.toFixed(2)}%`}
            color="#34C759"
          />
          <InfoRow label={t('stockDetail.frequency')} value={`${divInfo.frequency}x/year`} />
          <InfoRow label={t('stockDetail.exDate')} value={divInfo.exDate} />
        </View>
      )}

      {/* Transaction History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('transaction.history')}</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/add-transaction?symbol=${holding.symbol}`)
            }
          >
            <Text style={styles.addLink}>{t('stockDetail.addTransaction')}</Text>
          </TouchableOpacity>
        </View>
        {stockTxs.length === 0 ? (
          <Text style={styles.emptyTx}>{t('stockDetail.noTransactions')}</Text>
        ) : (
          stockTxs
            .slice()
            .reverse()
            .map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View>
                  <Text
                    style={[
                      styles.txType,
                      {
                        color:
                          tx.type === 'buy'
                            ? '#34C759'
                            : tx.type === 'sell'
                            ? '#FF3B30'
                            : '#007AFF',
                      },
                    ]}
                  >
                    {tx.type.toUpperCase()}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {tx.type !== 'dividend' && (
                    <Text style={styles.txDetail}>
                      {tx.shares} shares @ {formatPrice(holding, tx.price)}
                    </Text>
                  )}
                  <Text style={styles.txAmount}>
                    {formatPrice(holding, tx.amount)}
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.txButton}
          onPress={() =>
            router.push(`/add-transaction?symbol=${holding.symbol}`)
          }
        >
          <Text style={styles.txButtonText}>{t('transaction.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, color ? { color } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  label: { fontSize: 14, color: '#8E8E93' },
  value: { fontSize: 14, fontWeight: '600', color: '#000' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF3B30' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  symbol: { fontSize: 24, fontWeight: '800', color: '#000' },
  name: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  price: { fontSize: 32, fontWeight: '700', color: '#000', marginTop: 12 },
  change: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  addLink: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  emptyTx: { fontSize: 13, color: '#AEAEB2', textAlign: 'center', paddingVertical: 16 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  txType: { fontSize: 13, fontWeight: '700' },
  txDate: { fontSize: 11, color: '#AEAEB2', marginTop: 2 },
  txDetail: { fontSize: 13, color: '#8E8E93' },
  txAmount: { fontSize: 14, fontWeight: '600', color: '#000', marginTop: 2 },
  actions: {
    padding: 16,
    gap: 12,
  },
  txButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  txButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});
