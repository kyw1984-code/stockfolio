import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useExchangeStore } from '../stores/useExchangeStore';

export default function ExchangeRateCard() {
  const { usdKrw, isLoading } = useExchangeStore();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>USD/KRW</Text>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.rate}>
            ₩{usdKrw?.rate?.toLocaleString() || '—'}
          </Text>
        )}
      </View>
      <Text style={styles.source}>
        출처: 한국은행{usdKrw?.date ? ` (${formatBokDate(usdKrw.date)})` : ''}
      </Text>
    </View>
  );
}

function formatBokDate(date: string): string {
  if (date.length === 8) {
    return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
  }
  return date;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  rate: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  source: {
    fontSize: 10,
    color: '#AEAEB2',
    marginTop: 6,
  },
});
