import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  calculateCompoundInterest,
  calculateDividendGoal,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../stores/useSettingsStore';
import TaxCalculatorComponent from '../../components/TaxCalculator';
import DataSourceFooter from '../../components/DataSourceFooter';

type CalculatorType = 'compound' | 'dca' | 'dividendGoal' | 'tax';

export default function CalculatorScreen() {
  const { t } = useTranslation();
  const [activeCalc, setActiveCalc] = useState<CalculatorType>('compound');

  // Compound
  const [principal, setPrincipal] = useState('10000');
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('10');
  const [years, setYears] = useState('20');
  const [compoundResult, setCompoundResult] = useState<{
    finalValue: number;
    totalInvested: number;
    totalReturn: number;
  } | null>(null);

  // DCA
  const [dcaMonthly, setDcaMonthly] = useState('500');
  const [dcaPeriods, setDcaPeriods] = useState('24');
  const [dcaStart, setDcaStart] = useState('100');
  const [dcaEnd, setDcaEnd] = useState('150');
  const [dcaResult, setDcaResult] = useState<{
    avgCost: number;
    totalShares: number;
    totalInvested: number;
    finalValue: number;
  } | null>(null);

  // Dividend Goal
  const [targetMonthly, setTargetMonthly] = useState('1000');
  const [avgYield, setAvgYield] = useState('4');
  const [dividendResult, setDividendResult] = useState<number | null>(null);

  const calculateCompound = () => {
    const result = calculateCompoundInterest(
      parseFloat(principal) || 0,
      parseFloat(monthly) || 0,
      parseFloat(rate) || 0,
      parseFloat(years) || 0
    );
    setCompoundResult(result);
  };

  const calculateDca = () => {
    const m = parseFloat(dcaMonthly) || 0;
    const p = parseInt(dcaPeriods) || 0;
    const start = parseFloat(dcaStart) || 100;
    const end = parseFloat(dcaEnd) || 100;
    const totalInvested = m * p;
    // Simulate linear price movement
    let totalShares = 0;
    for (let i = 0; i < p; i++) {
      const price = start + ((end - start) * i) / Math.max(p - 1, 1);
      if (price > 0) totalShares += m / price;
    }
    const avgCost = totalShares > 0 ? totalInvested / totalShares : 0;
    setDcaResult({
      avgCost,
      totalShares,
      totalInvested,
      finalValue: totalShares * end,
    });
  };

  const calculateDivGoal = () => {
    const result = calculateDividendGoal(
      parseFloat(targetMonthly) || 0,
      parseFloat(avgYield) || 0
    );
    setDividendResult(result);
  };

  const { language } = useSettingsStore();
  const isKo = language === 'ko';

  const tabs: { key: CalculatorType; label: string }[] = [
    { key: 'compound', label: t('calculator.compound') },
    { key: 'dca', label: t('calculator.dca') },
    { key: 'dividendGoal', label: t('calculator.dividendGoal') },
    { key: 'tax', label: isKo ? '세금 계산기' : 'Tax Calculator' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeCalc === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveCalc(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeCalc === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Compound Interest Calculator */}
      {activeCalc === 'compound' && (
        <View style={styles.card}>
          <InputField
            label={t('calculator.initialInvestment')}
            value={principal}
            onChangeText={setPrincipal}
            prefix="$"
          />
          <InputField
            label={t('calculator.monthlyContribution')}
            value={monthly}
            onChangeText={setMonthly}
            prefix="$"
          />
          <InputField
            label={t('calculator.annualReturn')}
            value={rate}
            onChangeText={setRate}
            suffix="%"
          />
          <InputField
            label={t('calculator.years')}
            value={years}
            onChangeText={setYears}
          />
          <TouchableOpacity style={styles.calcButton} onPress={calculateCompound}>
            <Text style={styles.calcButtonText}>{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {compoundResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t('calculator.result')}</Text>
              <ResultRow
                label={t('calculator.finalValue')}
                value={formatCurrency(compoundResult.finalValue)}
                highlight
              />
              <ResultRow
                label={t('calculator.totalInvested')}
                value={formatCurrency(compoundResult.totalInvested)}
              />
              <ResultRow
                label={t('calculator.totalReturn')}
                value={formatCurrency(compoundResult.totalReturn)}
                color="#34C759"
              />
            </View>
          )}
        </View>
      )}

      {/* DCA Calculator */}
      {activeCalc === 'dca' && (
        <View style={styles.card}>
          <InputField
            label={t('calculator.monthlyInvestment')}
            value={dcaMonthly}
            onChangeText={setDcaMonthly}
            prefix="$"
          />
          <InputField
            label={t('calculator.periods')}
            value={dcaPeriods}
            onChangeText={setDcaPeriods}
          />
          <InputField
            label="Start Price"
            value={dcaStart}
            onChangeText={setDcaStart}
            prefix="$"
          />
          <InputField
            label={t('calculator.targetPrice')}
            value={dcaEnd}
            onChangeText={setDcaEnd}
            prefix="$"
          />
          <TouchableOpacity style={styles.calcButton} onPress={calculateDca}>
            <Text style={styles.calcButtonText}>{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {dcaResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t('calculator.result')}</Text>
              <ResultRow
                label={t('calculator.avgCost')}
                value={formatCurrency(dcaResult.avgCost)}
              />
              <ResultRow
                label={t('calculator.totalShares')}
                value={dcaResult.totalShares.toFixed(2)}
              />
              <ResultRow
                label={t('calculator.totalInvested')}
                value={formatCurrency(dcaResult.totalInvested)}
              />
              <ResultRow
                label={t('calculator.finalValue')}
                value={formatCurrency(dcaResult.finalValue)}
                highlight
              />
            </View>
          )}
        </View>
      )}

      {/* Dividend Goal Calculator */}
      {activeCalc === 'dividendGoal' && (
        <View style={styles.card}>
          <InputField
            label={t('calculator.targetMonthly')}
            value={targetMonthly}
            onChangeText={setTargetMonthly}
            prefix="$"
          />
          <InputField
            label={t('calculator.avgYield')}
            value={avgYield}
            onChangeText={setAvgYield}
            suffix="%"
          />
          <TouchableOpacity style={styles.calcButton} onPress={calculateDivGoal}>
            <Text style={styles.calcButtonText}>{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {dividendResult !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t('calculator.result')}</Text>
              <ResultRow
                label={t('calculator.requiredInvestment')}
                value={formatCurrency(dividendResult)}
                highlight
              />
              <ResultRow
                label={t('calculator.targetMonthly')}
                value={formatCurrency(parseFloat(targetMonthly) || 0)}
              />
            </View>
          )}
        </View>
      )}

      {/* Tax Calculator */}
      {activeCalc === 'tax' && <TaxCalculatorComponent />}

      <DataSourceFooter showKorean={isKo} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#C7C7CC"
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
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
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text
        style={[
          styles.resultValue,
          highlight && { fontSize: 20, fontWeight: '700' },
          color ? { color } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  tabRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputPrefix: { fontSize: 16, color: '#8E8E93', marginRight: 4 },
  inputSuffix: { fontSize: 16, color: '#8E8E93', marginLeft: 4 },
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
    marginTop: 8,
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: { fontSize: 14, color: '#8E8E93' },
  resultValue: { fontSize: 15, fontWeight: '600', color: '#000' },
});
