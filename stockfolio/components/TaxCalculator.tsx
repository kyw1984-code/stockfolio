import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useExchangeStore } from '../stores/useExchangeStore';
import {
  calculateKrDividendTax,
  calculateUsDividendTax,
  calculateOverseasCapitalGainsTax,
} from '../data/taxRates';
import { formatCurrency } from '../utils/formatters';

type TaxType = 'krDividend' | 'usDividend' | 'capitalGains';

export default function TaxCalculatorComponent() {
  const { getRate } = useExchangeStore();
  const [taxType, setTaxType] = useState<TaxType>('krDividend');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<React.ReactNode>(null);

  const calculate = () => {
    const value = parseFloat(amount) || 0;
    if (value <= 0) return;

    const rate = getRate();

    if (taxType === 'krDividend') {
      const r = calculateKrDividendTax(value);
      setResult(
        <View>
          <ResultRow label="배당금 (세전)" value={formatCurrency(value, 'KRW')} />
          <ResultRow label="배당소득세 (15.4%)" value={`-${formatCurrency(r.tax, 'KRW')}`} color="#FF3B30" />
          <ResultRow label="실수령액" value={formatCurrency(r.netDividend, 'KRW')} highlight />
        </View>
      );
    } else if (taxType === 'usDividend') {
      const r = calculateUsDividendTax(value, rate);
      setResult(
        <View>
          <ResultRow label="배당금 (세전)" value={formatCurrency(value)} />
          <ResultRow label="원천징수세 (15%)" value={`-${formatCurrency(r.taxUsd)}`} color="#FF3B30" />
          <ResultRow label="실수령액 (USD)" value={formatCurrency(r.netDividendUsd)} highlight />
          <ResultRow label="실수령액 (KRW)" value={formatCurrency(r.netDividendKrw, 'KRW')} highlight />
          <Text style={styles.rateNote}>환율 ₩{rate.toLocaleString()} (한국은행) 기준 환산</Text>
        </View>
      );
    } else {
      const r = calculateOverseasCapitalGainsTax(value);
      setResult(
        <View>
          <ResultRow label="총 양도차익" value={formatCurrency(value, 'KRW')} />
          <ResultRow label="기본공제" value={`-${formatCurrency(r.deduction, 'KRW')}`} />
          <ResultRow label="과세대상" value={formatCurrency(r.taxableGain, 'KRW')} />
          <ResultRow label="양도소득세 (22%)" value={`-${formatCurrency(r.tax, 'KRW')}`} color="#FF3B30" />
          <ResultRow label="세후 순이익" value={formatCurrency(r.netGain, 'KRW')} highlight />
        </View>
      );
    }
  };

  const tabs: { key: TaxType; label: string }[] = [
    { key: 'krDividend', label: '국내 배당세' },
    { key: 'usDividend', label: '해외 배당세' },
    { key: 'capitalGains', label: '양도소득세' },
  ];

  return (
    <View style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, taxType === tab.key && styles.tabActive]}
            onPress={() => { setTaxType(tab.key); setResult(null); }}
          >
            <Text style={[styles.tabText, taxType === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {taxType === 'capitalGains'
            ? '연간 양도차익 (₩)'
            : taxType === 'krDividend'
            ? '배당금 (₩)'
            : '배당금 ($)'}
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.prefix}>
            {taxType === 'usDividend' ? '$' : '₩'}
          </Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#C7C7CC"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.calcButton} onPress={calculate}>
        <Text style={styles.calcButtonText}>계산하기</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>계산 결과</Text>
          {result}
        </View>
      )}
    </View>
  );
}

function ResultRow({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <View style={resultStyles.row}>
      <Text style={resultStyles.label}>{label}</Text>
      <Text
        style={[
          resultStyles.value,
          highlight && { fontSize: 18, fontWeight: '700' },
          color ? { color } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const resultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: { fontSize: 13, color: '#8E8E93' },
  value: { fontSize: 14, fontWeight: '600', color: '#000' },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
  tabTextActive: { color: '#FFFFFF' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, color: '#8E8E93', marginRight: 4 },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000',
  },
  calcButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calcButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resultCard: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  rateNote: {
    fontSize: 10,
    color: '#AEAEB2',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
