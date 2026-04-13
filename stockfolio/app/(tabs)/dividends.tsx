import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DollarSign, Calendar, TrendingUp, Target, ArrowUpRight } from 'lucide-react-native';
import { useAppTranslation } from '../../utils/useAppTranslation';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import { useDividendStore } from '../../stores/useDividendStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useExchangeStore } from '../../stores/useExchangeStore';
import { formatCurrency } from '../../utils/formatters';
import DataSourceFooter from '../../components/DataSourceFooter';
import PremiumCard from '../../components/PremiumCard';
import ProLockedOverlay from '../../components/ProLockedOverlay';
import { useProGate } from '../../utils/useProGate';
import AdBanner from '../../components/AdBanner';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DividendsScreen() {
  const { t } = useAppTranslation();
  const { isPro } = useProGate();
  const insets = useSafeAreaInsets();
  const { holdings } = usePortfolioStore();
  const {
    dividendData,
    monthlyGoal,
    fetchAllDividends,
    getMonthlySchedule,
    getYieldOnCost,
  } = useDividendStore();

  useEffect(() => {
    if (holdings.length > 0) {
      fetchAllDividends(
        holdings.map((h) => ({ symbol: h.symbol, currentPrice: h.currentPrice, market: h.market, name: h.name }))
      );
    }
  }, [holdings.length]);

  const { language, currency } = useSettingsStore();
  const { convertToKrw } = useExchangeStore();
  const isKo = language === 'ko';

  const holdingSummary = holdings.map((h) => ({
    symbol: h.symbol,
    shares: h.shares,
    avgCost: h.avgCost,
  }));

  const showKrw = currency === 'KRW';

  const krHoldings = holdings.filter((h) => h.market === 'KR');
  const usHoldings = holdings.filter((h) => h.market !== 'KR');

  const krAnnualDiv = krHoldings.reduce((sum, h) => {
    const info = dividendData[h.symbol];
    return sum + (info ? info.annualDividend * h.shares : 0);
  }, 0);
  const usAnnualDiv = usHoldings.reduce((sum, h) => {
    const info = dividendData[h.symbol];
    return sum + (info ? info.annualDividend * h.shares : 0);
  }, 0);

  const annualDivDisplay = showKrw
    ? krAnnualDiv + convertToKrw(usAnnualDiv)
    : usAnnualDiv;
  const monthlyAvgDisplay = annualDivDisplay / 12;

  const yieldOnCost = getYieldOnCost(holdingSummary);
  const monthlySchedule = getMonthlySchedule(holdingSummary);
  const maxMonthly = Math.max(...Object.values(monthlySchedule), 1);

  const goalProgress = monthlyGoal > 0 ? (monthlyAvgDisplay / monthlyGoal) * 100 : 0;

  const formatDivCurrency = (value: number) =>
    showKrw ? formatCurrency(value, 'KRW') : formatCurrency(value);

  const formatHoldingDiv = (h: typeof holdings[number], value: number) => {
    if (h.market === 'KR') return formatCurrency(value, 'KRW');
    if (showKrw) return formatCurrency(convertToKrw(value), 'KRW');
    return formatCurrency(value);
  };

  if (holdings.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-950 px-10">
        <View className="w-24 h-24 rounded-[40px] bg-slate-900 items-center justify-center mb-6 border border-slate-800 shadow-2xl">
          <Text className="text-5xl">💰</Text>
        </View>
        <Text className="text-white text-xl font-bold mb-2">{t('dividends.noDividends')}</Text>
        <Text className="text-slate-400 text-center text-sm">{t('dividends.noDividendsDesc')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-10" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[3px] mb-1">{t('dividends.title')}</Text>
            <Text className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">{t('dividends.analytics')}</Text>
          </View>
          <TouchableOpacity className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm">
             <Calendar size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Main Dividend Card */}
        <PremiumCard className="mb-8" intensity={30}>
          <View className="items-center justify-center py-4">
            <View className="bg-emerald-500/10 p-4 rounded-3xl mb-4 border border-emerald-500/20">
              <DollarSign size={32} color="#10B981" />
            </View>
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[3px] mb-3">{t('dividends.annualPassiveIncome')}</Text>
            <Text className="text-emerald-500 dark:text-emerald-400 text-5xl font-extrabold tracking-tighter mb-4">
              {formatDivCurrency(annualDivDisplay)}
            </Text>
            <View className="bg-slate-100 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
               <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">{t('dividends.fiscalYearNote')}</Text>
            </View>
          </View>
        </PremiumCard>

        {/* Stats Row */}
        <View className="flex-row space-x-4 mb-8">
          <View className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-slate-900 shadow-sm dark:shadow-none">
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">{t('dividends.monthlyAvg')}</Text>
            <Text className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">{formatDivCurrency(monthlyAvgDisplay)}</Text>
          </View>
          {isPro ? (
            <View className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-slate-900 shadow-sm dark:shadow-none">
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">{t('dividends.yieldOnCost')}</Text>
              <Text className="text-sky-500 dark:text-sky-400 text-xl font-extrabold tracking-tight">{yieldOnCost.toFixed(2)}%</Text>
            </View>
          ) : (
            <ProLockedOverlay feature={t('pro.feature.yoc')} compact />
          )}
        </View>

        {/* Chart Section */}
        {!isPro && (
          <View className="mb-8">
            <ProLockedOverlay feature={t('pro.feature.dividendSchedule')} minHeight={260} />
          </View>
        )}
        {isPro && (
        <View className="bg-white dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-200 dark:border-slate-900 mb-8 shadow-sm dark:shadow-none">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
               <TrendingUp size={18} color="#38BDF8" />
               <Text className="text-slate-900 dark:text-white font-bold ml-2.5 text-base tracking-tight">{t('dividends.scheduleTitle')}</Text>
            </View>
            <View className="bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
               <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">{t('dividends.annual')}</Text>
            </View>
          </View>
          
          <View className="flex-row items-end justify-between h-40 px-1">
            {MONTHS.map((month, index) => {
              const value = monthlySchedule[index] || 0;
              const barHeight = maxMonthly > 0 ? (value / maxMonthly) * 100 : 0;
              return (
                <View key={month} className="items-center flex-1">
                  {value > 0 && <View className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mb-2 shadow-lg" />}
                  <View 
                    style={{ height: Math.max(barHeight, 6) }}
                    className={`w-3 rounded-t-full ${value > 0 ? 'bg-emerald-500 dark:bg-emerald-400 shadow-xl' : 'bg-slate-200 dark:bg-slate-800/50'}`}
                  />
                  <Text className="text-slate-400 dark:text-slate-600 text-[10px] mt-4 font-bold uppercase tracking-tighter">{month[0]}</Text>
                </View>
              );
            })}
          </View>
        </View>
        )}

        {/* Goal Section */}
        {!isPro && (
          <View className="mb-10">
            <ProLockedOverlay feature={t('pro.feature.dividendGoal')} minHeight={180} />
          </View>
        )}
        {isPro && (
        <PremiumCard className="mb-10" intensity={15}>
           <View className="flex-row justify-between items-center mb-6">
             <View className="flex-row items-center">
               <View className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/20 mr-3">
                 <Target size={18} color="#FBBF24" />
               </View>
               <View>
                 <Text className="text-slate-900 dark:text-white font-bold text-base tracking-tight">{t('dividends.goalTitle')}</Text>
                 <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mt-0.5">{t('dividends.financialFreedom')}</Text>
               </View>
             </View>
             <View className="items-end">
               <Text className="text-amber-500 dark:text-amber-400 text-lg font-extrabold">{goalProgress.toFixed(0)}%</Text>
             </View>
           </View>
           
           <View className="h-3 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
             <View 
               style={{ width: `${Math.min(goalProgress, 100)}%` }}
               className="h-full bg-amber-400 rounded-full"
             />
           </View>
           <View className="flex-row justify-between">
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">{formatDivCurrency(monthlyAvgDisplay)} {t('common.current')}</Text>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">{formatDivCurrency(monthlyGoal)} {t('dividends.goal')}</Text>
           </View>
        </PremiumCard>
        )}

        {/* Upcoming List */}
        <View className="flex-row justify-between items-end mb-6 px-1">
          <View>
            <Text className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{t('dividends.upcomingPayouts')}</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('dividends.nextDividends')}</Text>
          </View>
          <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <ArrowUpRight size={14} color="#38BDF8" />
            <Text className="text-sky-500 dark:text-sky-400 text-[10px] font-bold ml-1 uppercase">{t('common.calendar')}</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {holdings.map((h) => {
            const info = dividendData[h.symbol];
            if (!info) return null;
            return (
              <TouchableOpacity key={h.symbol} className="flex-row justify-between items-center p-5 bg-white dark:bg-slate-900/30 rounded-[28px] border border-slate-100 dark:border-slate-900 shadow-sm dark:shadow-none">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 items-center justify-center mr-4 border border-slate-100 dark:border-slate-800">
                    <Text className="text-lg">{h.market === 'US' ? '🇺🇸' : '🇰🇷'}</Text>
                  </View>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-base tracking-tight">{h.symbol}</Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t('dividends.exDateLabel')}: {info.exDate}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-slate-900 dark:text-white font-extrabold text-base">{formatHoldingDiv(h, info.dividendPerShare * h.shares)}</Text>
                  <Text className="text-emerald-500 dark:text-emerald-400 text-[10px] font-bold tracking-widest">+{formatHoldingDiv(h, info.dividendPerShare)} {t('dividends.perShare')}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-14">
          <AdBanner />
          <DataSourceFooter showKorean={isKo} />
        </View>
      </View>
    </ScrollView>
  );
}
