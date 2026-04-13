import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTranslation } from '../utils/useAppTranslation';
import { usePortfolioStore } from '../stores/usePortfolioStore';

type TxType = 'buy' | 'sell' | 'dividend';

export default function AddTransactionScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string }>();
  const { addTransaction, holdings, updateHolding, removeHolding } = usePortfolioStore();

  const [txType, setTxType] = useState<TxType>('buy');
  const [symbol, setSymbol] = useState(params.symbol || '');
  const holdingForSymbol = holdings.find((h) => h.symbol === symbol.toUpperCase().trim());
  const currencySymbol = holdingForSymbol?.market === 'KR' ? '₩' : '$';
  const [sharesInput, setSharesInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const handleSave = () => {
    const sym = symbol.toUpperCase().trim();
    if (!sym) {
      Alert.alert(t('common.error'), t('transaction.ticker'));
      return;
    }

    if (txType === 'dividend') {
      const amount = parseFloat(priceInput);
      if (!amount || amount <= 0) {
        Alert.alert(t('common.error'), t('transaction.amount'));
        return;
      }
      addTransaction({
        symbol: sym,
        type: 'dividend',
        shares: 0,
        price: 0,
        amount,
        date: new Date().toISOString(),
      });
    } else {
      const shares = parseFloat(sharesInput);
      const price = parseFloat(priceInput);
      if (!shares || shares <= 0 || !price || price <= 0) {
        Alert.alert(t('common.error'), t('transaction.shares'));
        return;
      }

      addTransaction({
        symbol: sym,
        type: txType,
        shares,
        price,
        amount: shares * price,
        date: new Date().toISOString(),
      });

      // Update holding if selling
      if (txType === 'sell') {
        const holding = holdings.find((h) => h.symbol === sym);
        if (holding) {
          const newShares = holding.shares - shares;
          if (newShares <= 0) {
            removeHolding(sym);
          } else {
            updateHolding(sym, { shares: newShares });
          }
        }
      }
    }

    router.back();
  };

  const types: { key: TxType; label: string; color: string }[] = [
    { key: 'buy', label: t('transaction.buy'), color: '#34C759' },
    { key: 'sell', label: t('transaction.sell'), color: '#FF3B30' },
    { key: 'dividend', label: t('transaction.dividend'), color: '#007AFF' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Transaction Type */}
        <View style={styles.typeRow}>
          {types.map((tp) => (
            <TouchableOpacity
              key={tp.key}
              style={[
                styles.typeButton,
                txType === tp.key && { backgroundColor: tp.color },
              ]}
              onPress={() => setTxType(tp.key)}
            >
              <Text
                style={[
                  styles.typeText,
                  txType === tp.key && { color: '#FFF' },
                ]}
              >
                {tp.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Symbol */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('transaction.ticker')}</Text>
          <TextInput
            style={styles.input}
            value={symbol}
            onChangeText={setSymbol}
            placeholder="AAPL"
            autoCapitalize="characters"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        {/* Shares (not for dividend) */}
        {txType !== 'dividend' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('transaction.shares')}</Text>
            <TextInput
              style={styles.input}
              value={sharesInput}
              onChangeText={setSharesInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        )}

        {/* Price / Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {txType === 'dividend'
              ? t('transaction.amount')
              : t('transaction.price')}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.prefix}>{currencySymbol}</Text>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        {/* Total display */}
        {txType !== 'dividend' &&
          sharesInput &&
          priceInput && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('transaction.total')}</Text>
              <Text style={styles.totalValue}>
                {currencySymbol}
                {(
                  (parseFloat(sharesInput) || 0) *
                  (parseFloat(priceInput) || 0)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{t('transaction.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  typeText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, color: '#8E8E93', marginRight: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
