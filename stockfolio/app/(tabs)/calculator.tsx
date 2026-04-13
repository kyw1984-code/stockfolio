import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { useAppTranslation } from '../../utils/useAppTranslation';
import {
  calculateCompoundInterest,
  calculateDividendGoal,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useProGate } from '../../utils/useProGate';
import TaxCalculatorComponent from '../../components/TaxCalculator';
import DataSourceFooter from '../../components/DataSourceFooter';
import AdBanner from '../../components/AdBanner';

type CalculatorType = 'compound' | 'dca' | 'dividendGoal' | 'tax';

export default function CalculatorScreen() {
  const { t } = useAppTranslation();
  const { isPro, requirePro } = useProGate();
  const insets = useSafeAreaInsets();
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

  const tabs: { key: CalculatorType; label: string; proOnly: boolean }[] = [
    { key: 'compound', label: t('calculator.compound'), proOnly: false },
    { key: 'dca', label: t('calculator.dca'), proOnly: false },
    { key: 'dividendGoal', label: t('calculator.dividendGoal'), proOnly: true },
    { key: 'tax', label: t('calculator.tax'), proOnly: true },
  ];

  const handleTabPress = (tab: { key: CalculatorType; proOnly: boolean }) => {
    if (tab.proOnly && !isPro) {
      requirePro();
      return;
    }
    setActiveCalc(tab.key);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" showsVerticalScrollIndicator={false}>
      {/* Tab Selector */}
      <View className="px-5" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-6">{t('calculator.title')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row space-x-2">
            {tabs.map((tab) => {
              const locked = tab.proOnly && !isPro;
              const active = activeCalc === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabPress(tab)}
                  className={`flex-row items-center px-5 py-2.5 rounded-full border ${active ? 'bg-sky-500 border-sky-500' : locked ? 'bg-white dark:bg-slate-900 border-amber-400/60 dark:border-amber-500/40' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                  {locked && (
                    <Lock size={11} color="#F59E0B" style={{ marginRight: 6 }} />
                  )}
                  <Text className={`text-xs font-bold ${active ? 'text-white' : locked ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'}`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Compound Interest Calculator */}
      {activeCalc === 'compound' && (
        <View className="bg-white dark:bg-slate-900 mx-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <InputField label={t('calculator.initialInvestment')} value={principal} onChangeText={setPrincipal} prefix="$" />
          <InputField label={t('calculator.monthlyContribution')} value={monthly} onChangeText={setMonthly} prefix="$" />
          <InputField label={t('calculator.annualReturn')} value={rate} onChangeText={setRate} suffix="%" />
          <InputField label={t('calculator.years')} value={years} onChangeText={setYears} />

          <TouchableOpacity
            className="bg-sky-500 py-4 rounded-2xl items-center mt-4 shadow-lg shadow-sky-500/30"
            onPress={calculateCompound}
          >
            <Text className="text-white font-bold text-base">{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {compoundResult && (
            <View className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4">{t('calculator.result')}</Text>
              <ResultRow label={t('calculator.finalValue')} value={formatCurrency(compoundResult.finalValue)} highlight />
              <ResultRow label={t('calculator.totalInvested')} value={formatCurrency(compoundResult.totalInvested)} />
              <ResultRow label={t('calculator.totalReturn')} value={formatCurrency(compoundResult.totalReturn)} isProfit />
            </View>
          )}
        </View>
      )}

      {/* DCA Calculator */}
      {activeCalc === 'dca' && (
        <View className="bg-white dark:bg-slate-900 mx-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <InputField label={t('calculator.monthlyInvestment')} value={dcaMonthly} onChangeText={setDcaMonthly} prefix="$" />
          <InputField label={t('calculator.periods')} value={dcaPeriods} onChangeText={setDcaPeriods} />
          <InputField label={t('calculator.startPrice')} value={dcaStart} onChangeText={setDcaStart} prefix="$" />
          <InputField label={t('calculator.targetPrice')} value={dcaEnd} onChangeText={setDcaEnd} prefix="$" />

          <TouchableOpacity
            className="bg-sky-500 py-4 rounded-2xl items-center mt-4 shadow-lg shadow-sky-500/30"
            onPress={calculateDca}
          >
            <Text className="text-white font-bold text-base">{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {dcaResult && (
            <View className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4">{t('calculator.result')}</Text>
              <ResultRow label={t('calculator.avgCost')} value={formatCurrency(dcaResult.avgCost)} />
              <ResultRow label={t('calculator.totalShares')} value={dcaResult.totalShares.toFixed(2)} />
              <ResultRow label={t('calculator.totalInvested')} value={formatCurrency(dcaResult.totalInvested)} />
              <ResultRow label={t('calculator.finalValue')} value={formatCurrency(dcaResult.finalValue)} highlight />
            </View>
          )}
        </View>
      )}

      {/* Dividend Goal Calculator */}
      {activeCalc === 'dividendGoal' && (
        <View className="bg-white dark:bg-slate-900 mx-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <InputField label={t('calculator.targetMonthly')} value={targetMonthly} onChangeText={setTargetMonthly} prefix="$" />
          <InputField label={t('calculator.avgYield')} value={avgYield} onChangeText={setAvgYield} suffix="%" />

          <TouchableOpacity
            className="bg-sky-500 py-4 rounded-2xl items-center mt-4 shadow-lg shadow-sky-500/30"
            onPress={calculateDivGoal}
          >
            <Text className="text-white font-bold text-base">{t('calculator.calculate')}</Text>
          </TouchableOpacity>

          {dividendResult !== null && (
            <View className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4">{t('calculator.result')}</Text>
              <ResultRow label={t('calculator.requiredInvestment')} value={formatCurrency(dividendResult)} highlight />
              <ResultRow label={t('calculator.targetMonthly')} value={formatCurrency(parseFloat(targetMonthly) || 0)} />
            </View>
          )}
        </View>
      )}

      {/* Tax Calculator */}
      {activeCalc === 'tax' && (
        <View className="mx-5">
          <TaxCalculatorComponent />
        </View>
      )}

      <View className="mt-10">
        <AdBanner />
        <DataSourceFooter showKorean={isKo} />
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, prefix, suffix }: any) {
  return (
    <View className="mb-5">
      <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2 ml-1">{label}</Text>
      <View className="flex-row items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 h-14">
        {prefix && <Text className="text-slate-400 dark:text-slate-500 font-bold mr-2">{prefix}</Text>}
        <TextInput
          className="flex-1 text-slate-900 dark:text-white font-bold text-base h-full"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94A3B8"
        />
        {suffix && <Text className="text-slate-400 dark:text-slate-500 font-bold ml-2">{suffix}</Text>}
      </View>
    </View>
  );
}

function ResultRow({ label, value, highlight, isProfit }: any) {
  return (
    <View className="flex-row justify-between items-center py-3">
      <Text className="text-slate-500 dark:text-slate-400 text-sm">{label}</Text>
      <Text className={`font-bold ${highlight ? 'text-slate-900 dark:text-white text-xl' : isProfit ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
        {value}
      </Text>
    </View>
  );
}
