import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Plus, Search, Bell, Filter } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppTranslation } from '../../utils/useAppTranslation';
import { usePortfolioStore, StockHolding } from '../../stores/usePortfolioStore';
import { useExchangeStore } from '../../stores/useExchangeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import DataSourceFooter from '../../components/DataSourceFooter';
import CountryPieChart from '../../components/CountryPieChart';
import PremiumCard from '../../components/PremiumCard';
import ProLockedOverlay from '../../components/ProLockedOverlay';
import { useProGate } from '../../utils/useProGate';
import AdBanner from '../../components/AdBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mini Line Chart Component for Dashboard
const MiniLineChart = ({ color = "#38BDF8" }) => {
  const points = "0,40 10,35 20,45 30,25 40,30 50,15 60,25 70,10 80,20 90,5 100,10";
  return (
    <View className="h-10 w-24">
      <Svg height="100%" width="100%" viewBox="0 0 100 50">
        <Defs>
          <SvgGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.5" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <Path
          d="M0,40 Q10,35 20,45 T40,30 T60,25 T80,20 T100,10"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M0,40 Q10,35 20,45 T40,30 T60,25 T80,20 T100,10 L100,50 L0,50 Z"
          fill="url(#glow)"
        />
      </Svg>
    </View>
  );
};

export default function PortfolioScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    holdings,
    refreshPrices,
    getTotalValue,
    getKrHoldings,
    getUsHoldings,
  } = usePortfolioStore();
  const { fetchRate, convertToKrw, getRate } = useExchangeStore();
  const { currency } = useSettingsStore();
  const { isPro } = useProGate();

  useEffect(() => {
    fetchRate();
  }, []);

  useEffect(() => {
    if (holdings.length > 0) {
      refreshPrices();
    }
  }, [holdings.length]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchRate(), refreshPrices()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshPrices, fetchRate]);

  const totalValueUsd = getTotalValue();
  const showKrw = currency === 'KRW';

  const krHoldings = getKrHoldings();
  const usHoldings = getUsHoldings();

  const krTodayChange = krHoldings.reduce((s, h) => s + (h.currentPrice - h.previousClose) * h.shares, 0);
  const usTodayChange = usHoldings.reduce((s, h) => s + (h.currentPrice - h.previousClose) * h.shares, 0);

  const getTodayChangeDisplay = () => {
    if (showKrw) return formatCurrency(krTodayChange + convertToKrw(usTodayChange), 'KRW');
    return formatCurrency(usTodayChange);
  };

  const getTodayChangePct = () => {
    if (showKrw) {
      const prevKr = krHoldings.reduce((s, h) => s + h.previousClose * h.shares, 0);
      const prevUs = convertToKrw(usHoldings.reduce((s, h) => s + h.previousClose * h.shares, 0));
      const prev = prevKr + prevUs;
      return prev > 0 ? (krTodayChange + convertToKrw(usTodayChange)) / prev * 100 : 0;
    }
    const prev = usHoldings.reduce((s, h) => s + h.previousClose * h.shares, 0);
    return prev > 0 ? (usTodayChange / prev) * 100 : 0;
  };

  const getTodayChangeColor = () => (krTodayChange + usTodayChange) >= 0 ? 'text-emerald-400' : 'text-rose-500';

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

  const sections: Array<{ title: string; flag: string; data: StockHolding[] }> = [];
  if (krHoldings.length > 0) {
    sections.push({ title: t('portfolio.krStocks'), flag: '🇰🇷', data: krHoldings });
  }
  if (usHoldings.length > 0) {
    sections.push({
      title: t('portfolio.usStocks'),
      flag: '🇺🇸',
      data: usHoldings,
    });
  }

  const renderHeader = () => (
    <View className="px-5 pb-2" style={{ paddingTop: insets.top + 16 }}>
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[3px] mb-1">StockFolio</Text>
          <Text className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">{t('portfolio.title')}</Text>
        </View>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm">
            <Search size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm">
            <Bell size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-10 overflow-hidden rounded-[40px] shadow-2xl shadow-indigo-500/40">
        <LinearGradient
          colors={['#6366F1', '#3B82F6', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 32 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-white/80 text-[10px] font-bold mb-3" numberOfLines={1}>{t('portfolio.netWorthBalance')}</Text>
              <Text className="text-white text-5xl font-extrabold tracking-tight mb-4 shadow-xl shadow-black/20" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {getTotalValueDisplay()}
              </Text>
              <View className="flex-row items-center flex-wrap">
                <View className="bg-white/20 px-3 py-1.5 rounded-2xl border border-white/30 backdrop-blur-md">
                   <Text className="text-white font-black text-sm">
                     {(krTodayChange + usTodayChange) >= 0 ? '▲ ' : '▼ '}{getTodayChangeDisplay()}
                   </Text>
                </View>
                <View className="ml-3">
                  <Text className="text-white/90 text-[11px] font-bold uppercase tracking-wider">+{formatPercent(getTodayChangePct())}</Text>
                  <Text className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-0.5">{t('portfolio.sessionProfit')}</Text>
                </View>
              </View>
            </View>
            <View className="bg-white/10 p-3 rounded-3xl border border-white/20">
               <TrendingUp size={28} color="white" strokeWidth={2.5} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {showKrw && (
        <View className="flex-row items-center justify-between mb-8 px-2 bg-white dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
          <View className="flex-row items-center">
             <View className="w-2 h-2 rounded-full bg-sky-400 mr-2" />
             <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t('portfolio.exchangeRate')}</Text>
          </View>
          <Text className="text-slate-900 dark:text-white text-xs font-bold">₩{getRate().toLocaleString()}</Text>
        </View>
      )}

      {krHoldings.length > 0 && usHoldings.length > 0 && (
        <View className="mb-10">
          {isPro ? (
            <CountryPieChart />
          ) : (
            <ProLockedOverlay feature={t('pro.feature.countryBreakdown')} minHeight={200} />
          )}
        </View>
      )}

      <View className="flex-row justify-between items-end mb-5 px-1">
        <View>
          <Text className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{t('portfolio.holdingsTitle')}</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('portfolio.managedAssets')}</Text>
        </View>
        <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Filter size={14} color="#94A3B8" />
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold ml-1.5 uppercase">{t('common.filter')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStock = ({ item }: { item: StockHolding }) => {
    const gainPercent =
      item.avgCost > 0
        ? ((item.currentPrice - item.avgCost) / item.avgCost) * 100
        : 0;
    const isPositive = gainPercent >= 0;

    return (
      <TouchableOpacity
        className="flex-row items-center justify-between bg-white dark:bg-slate-900/50 mx-5 mb-3 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none"
        onPress={() => router.push(`/stock/${item.symbol}`)}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 items-center justify-center mr-4 border border-slate-100 dark:border-slate-800">
             <Text className="text-lg">{item.market === 'US' ? '🇺🇸' : '🇰🇷'}</Text>
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-slate-900 dark:text-white font-bold text-base tracking-tight">{item.symbol}</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider" numberOfLines={1}>{item.name}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-slate-900 dark:text-white font-bold text-base tracking-tight">{formatHoldingPrice(item, item.currentPrice)}</Text>
          <Text className={`text-[11px] font-bold mt-1 ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
            {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(gainPercent))}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center px-10 pt-20">
      <View className="w-24 h-24 rounded-[40px] bg-slate-900 items-center justify-center mb-6 border border-slate-800 shadow-2xl">
        <Text className="text-5xl">📈</Text>
      </View>
      <Text className="text-slate-900 dark:text-white text-xl font-bold mb-2">{t('portfolio.noStocks')}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-center text-sm">{t('portfolio.noStocksDesc')}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStock}
        renderSectionHeader={({ section }) => (
          <View className="px-6 py-3 mt-4">
            <View className="flex-row items-center">
               <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[2px]">{section.title}</Text>
               <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800/50 ml-4" />
            </View>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View className="pb-24"><AdBanner /><DataSourceFooter showKorean={krHoldings.length > 0} /></View>}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
        stickySectionHeadersEnabled={false}
      />
      
      <TouchableOpacity
        className="absolute bottom-10 right-8 w-16 h-16 rounded-3xl bg-sky-500 items-center justify-center shadow-2xl shadow-sky-500/60"
        onPress={() => router.push('/add-stock')}
        activeOpacity={0.8}
      >
        <Plus color="white" size={32} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
