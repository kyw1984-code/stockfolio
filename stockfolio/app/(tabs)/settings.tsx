import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Modal, Alert, Linking, Pressable } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Globe,
  CreditCard,
  Bell,
  Database,
  Info,
  ShieldCheck,
  Moon,
  Sun,
  ShieldAlert,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTranslation } from '../../utils/useAppTranslation';
import { useSettingsStore } from '../../stores/useSettingsStore';
import DataSourceFooter from '../../components/DataSourceFooter';
import { usePurchase } from '../../utils/usePurchase';

export default function SettingsScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currency,
    language,
    theme,
    priceAlertsEnabled,
    dividendAlertsEnabled,
    isPro,
    setCurrency,
    setLanguage,
    setTheme,
    togglePriceAlerts,
    toggleDividendAlerts,
  } = useSettingsStore();

  const { packages, isPurchasing, isRestoring, isLoadingPackages, handlePurchase, handleRestore } = usePurchase();

  const [showPlanModal, setShowPlanModal] = useState(false);

  const isKo = language === 'ko';
  const isDark = theme === 'dark';

  const monthlyPkg = packages.find((p) => p.packageType === 'MONTHLY');
  const annualPkg = packages.find((p) => p.packageType === 'ANNUAL');

  const openPurchaseFlow = () => {
    if (packages.length === 0) {
      Alert.alert(
        isKo ? '연결 오류' : 'Connection Error',
        isKo
          ? '구독 정보를 불러올 수 없습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.'
          : 'Unable to load subscription info. Please check your connection and try again.'
      );
      return;
    }
    setShowPlanModal(true);
  };

  const selectPackage = async (pkg: PurchasesPackage) => {
    setShowPlanModal(false);
    await handlePurchase(pkg);
  };

  const openManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions').catch(() => {
      Alert.alert(
        isKo ? '오류' : 'Error',
        isKo ? 'App Store를 열 수 없습니다.' : 'Unable to open App Store.'
      );
    });
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ko' : 'en';
    setLanguage(newLang);
    if (newLang === 'ko') setCurrency('KRW');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <>
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" showsVerticalScrollIndicator={false}>
      <View className="px-5" style={{ paddingTop: Math.max(insets.top, 44) + 16 }}>
        <View className="mb-8">
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[3px] mb-1">StockFolio</Text>
          <Text className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">{t('settings.title')}</Text>
        </View>

        {/* Luxury Plan Section */}
        <View className="mb-10 overflow-hidden rounded-[40px] shadow-2xl shadow-purple-500/30">
          <LinearGradient
            colors={isPro ? ['#4F46E5', '#7C3AED'] : ['#EC4899', '#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 32 }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <View className="bg-white/20 p-2 rounded-xl mr-3 border border-white/30" style={{ minWidth: 40 }}>
                    <ShieldCheck size={20} color="white" />
                  </View>
                  <Text className="text-white text-2xl font-black italic tracking-tighter uppercase flex-1" numberOfLines={1} adjustsFontSizeToFit>
                    {isPro ? t('settings.proMember') : t('settings.eliteStatus')}
                  </Text>
                </View>
                <Text className="text-white/80 text-xs font-bold tracking-widest uppercase mt-1" numberOfLines={1} adjustsFontSizeToFit>
                  {isPro
                    ? isKo ? '프리미엄 무제한 이용 중' : 'Unlimited Premium Access'
                    : isKo ? '업그레이드하고 모든 혜택을 누리세요' : 'Unlock Professional Power'}
                </Text>
              </View>
              {isPro && (
                <View className="bg-amber-400/90 px-3 py-1 rounded-full shadow-lg">
                  <Text className="text-black font-black text-[10px] uppercase">VIP</Text>
                </View>
              )}
            </View>

            <View className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md mb-6">
              <Text className="text-white/70 text-[10px] font-black uppercase tracking-[2px] mb-3">
                {t('pro.benefitsTitle')}
              </Text>
              <ProBenefit text={t('pro.benefits.unlimitedStocks')} />
              <ProBenefit text={t('pro.benefits.taxCalc')} />
              <ProBenefit text={t('pro.benefits.dividendGoal')} />
              <ProBenefit text={t('pro.benefits.countryBreakdown')} />
              <ProBenefit text={t('pro.benefits.dividendChart')} last />
            </View>

            {!isPro ? (
              <>
                <TouchableOpacity
                  className="rounded-2xl overflow-hidden shadow-2xl shadow-amber-400/50 mb-3"
                  activeOpacity={0.85}
                  disabled={isPurchasing || isLoadingPackages}
                  onPress={openPurchaseFlow}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#FBBF24', '#FCD34D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ padding: 18, alignItems: 'center' }}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <>
                        <Text className="text-black font-black text-lg tracking-tight mb-0.5">
                          {isKo ? '🔓 지금 Pro로 업그레이드' : '🔓 Upgrade to Pro Now'}
                        </Text>
                        <Text className="text-black/70 font-bold text-[11px] uppercase tracking-widest">
                          {isLoadingPackages
                            ? (isKo ? '가격 불러오는 중...' : 'Loading price...')
                            : packages.length > 0
                              ? packages[0].product.priceString
                              : (isKo ? '모든 기능 무제한 잠금 해제' : 'Unlock all features')}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white/10 py-3 rounded-2xl items-center border border-white/20"
                  activeOpacity={0.8}
                  disabled={isRestoring}
                  onPress={handleRestore}
                >
                  {isRestoring ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white/70 font-bold text-xs uppercase tracking-[2px]">
                      {isKo ? '구매 복원' : 'Restore Purchases'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="bg-white/15 py-4 rounded-2xl items-center border border-white/30"
                activeOpacity={0.9}
                onPress={openManageSubscription}
              >
                <Text className="text-white font-black text-xs uppercase tracking-[2px]">
                  {isKo ? '구독 관리' : 'Manage Subscription'}
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* General Settings */}
        <Section title={t('settings.general')}>
          <SettingRow
            icon={isDark ? <Moon size={18} color="#94A3B8" /> : <Sun size={18} color="#64748B" />}
            label={t('settings.darkMode')}
            override={
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ true: '#38BDF8', false: '#CBD5E1' }}
                thumbColor="white"
              />
            }
          />
          <SettingRow 
            icon={<CreditCard size={18} color="#94A3B8" />}
            label={t('settings.currency')} 
            value={currency === 'KRW' ? '₩ KRW' : '$ USD'} 
            onPress={() => setCurrency(currency === 'USD' ? 'KRW' : 'USD')}
          />
          <SettingRow 
            icon={<Globe size={18} color="#94A3B8" />}
            label={t('settings.language')} 
            value={language === 'en' ? 'English' : '한국어'} 
            onPress={handleLanguageToggle}
            last
          />
        </Section>

        {/* Notifications */}
        <Section title={t('settings.notifications')}>
          <View className="flex-row justify-between items-center py-4 border-b border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center">
              <Bell size={18} color="#94A3B8" />
              <Text className="text-slate-600 dark:text-slate-300 ml-3">{t('settings.priceAlerts')}</Text>
            </View>
            <Switch
              value={priceAlertsEnabled}
              onValueChange={togglePriceAlerts}
              trackColor={{ true: '#38BDF8', false: '#E2E8F0' }}
              thumbColor="white"
            />
          </View>
          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center">
              <ShieldAlert size={18} color="#94A3B8" />
              <Text className="text-slate-600 dark:text-slate-300 ml-3">{t('settings.dividendAlerts')}</Text>
            </View>
            <Switch
              value={dividendAlertsEnabled}
              onValueChange={toggleDividendAlerts}
              trackColor={{ true: '#38BDF8', false: '#E2E8F0' }}
              thumbColor="white"
            />
          </View>
        </Section>

        {/* Resources */}
        <Section title={t('settings.resources')}>
          <SettingRow
            icon={<Database size={18} color="#94A3B8" />}
            label={t('settings.dataSources')}
            onPress={() => router.push('/data-sources')}
          />
          <SettingRow
            icon={<Info size={18} color="#94A3B8" />}
            label={t('settings.version')}
            value="1.0.0"
            last
          />
        </Section>
      </View>

      <View className="mt-10 pb-20">
        <DataSourceFooter showKorean={isKo} />
      </View>
    </ScrollView>

    <Modal
      visible={showPlanModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPlanModal(false)}
    >
      <Pressable
        className="flex-1 justify-end bg-black/60"
        onPress={() => setShowPlanModal(false)}
      >
        <Pressable
          className="bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-6"
          style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center mb-5">
            <View className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-5" />
            <Text className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight mb-1">
              {isKo ? '플랜 선택' : 'Choose Your Plan'}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              {isKo ? '언제든지 취소할 수 있습니다' : 'Cancel anytime'}
            </Text>
          </View>

          {annualPkg && (
            <TouchableOpacity
              className="rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-500/10 p-5 mb-3"
              activeOpacity={0.8}
              disabled={isPurchasing}
              onPress={() => selectPackage(annualPkg)}
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-slate-900 dark:text-white font-extrabold text-base">
                  {isKo ? '연간 플랜' : 'Annual Plan'}
                </Text>
                <View className="bg-amber-400 px-2 py-0.5 rounded-full">
                  <Text className="text-black font-black text-[10px] uppercase tracking-wider">
                    {isKo ? '최고 가치' : 'Best Value'}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-900 dark:text-white text-2xl font-black mb-1">
                {annualPkg.product.priceString}
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  {isKo ? ' / 년' : ' / year'}
                </Text>
              </Text>
              {monthlyPkg && (
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {isKo
                    ? `월 결제 대비 ${Math.round((1 - annualPkg.product.price / (monthlyPkg.product.price * 12)) * 100)}% 절약`
                    : `Save ${Math.round((1 - annualPkg.product.price / (monthlyPkg.product.price * 12)) * 100)}% vs monthly`}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {monthlyPkg && (
            <TouchableOpacity
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 mb-5"
              activeOpacity={0.8}
              disabled={isPurchasing}
              onPress={() => selectPackage(monthlyPkg)}
            >
              <Text className="text-slate-900 dark:text-white font-extrabold text-base mb-1">
                {isKo ? '월간 플랜' : 'Monthly Plan'}
              </Text>
              <Text className="text-slate-900 dark:text-white text-2xl font-black">
                {monthlyPkg.product.priceString}
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  {isKo ? ' / 월' : ' / month'}
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="py-3 items-center"
            activeOpacity={0.7}
            onPress={() => setShowPlanModal(false)}
          >
            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
              {isKo ? '취소' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-3 pb-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://kyw1984-code.github.io/stockfolio/privacy.html')}
            >
              <Text className="text-slate-400 dark:text-slate-500 text-xs underline">
                {isKo ? '개인정보처리방침' : 'Privacy Policy'}
              </Text>
            </TouchableOpacity>
            <Text className="text-slate-300 dark:text-slate-600 text-xs">·</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://kyw1984-code.github.io/stockfolio/terms.html')}
            >
              <Text className="text-slate-400 dark:text-slate-500 text-xs underline">
                {isKo ? '이용약관' : 'Terms of Use'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
}

function Section({ title, children }: any) {
  return (
    <View className="mb-8">
      <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3 ml-1">{title}</Text>
      <View className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 px-5 overflow-hidden shadow-sm dark:shadow-none">
        {children}
      </View>
    </View>
  );
}

function ProBenefit({ text, last }: { text: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center ${last ? '' : 'mb-2'}`}>
      <View className="w-5 h-5 rounded-full bg-white/25 items-center justify-center mr-2.5">
        <Check size={12} color="white" strokeWidth={3} />
      </View>
      <Text className="text-white text-[13px] font-bold flex-1" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, last, override }: any) {
  return (
    <TouchableOpacity 
      className={`flex-row justify-between items-center py-4 ${last ? '' : 'border-b border-slate-100 dark:border-slate-800/50'}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-slate-600 dark:text-slate-300 ml-3">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {override ? override : (
          <>
            {value && <Text className="text-slate-400 dark:text-slate-500 text-sm mr-2">{value}</Text>}
            {onPress && <ChevronRight size={16} color="#94A3B8" />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
