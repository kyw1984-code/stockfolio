import { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { useProGate } from '../utils/useProGate';
import { useAppTranslation } from '../utils/useAppTranslation';

interface ProLockedOverlayProps {
  /** 잠긴 기능 이름 */
  feature: string;
  /** 자식을 흐리게 표시하고 위에 잠금 오버레이를 올릴 때 */
  children?: ReactNode;
  /** 자식 없이 플레이스홀더로 사용할 때 최소 높이 */
  minHeight?: number;
  /**
   * compact=true: 반쪽(50%) 너비 칸에 맞는 간소한 스타일.
   * 버튼 없이 카드 전체를 탭하면 설정으로 이동.
   */
  compact?: boolean;
}

export default function ProLockedOverlay({
  feature,
  children,
  minHeight = 140,
  compact = false,
}: ProLockedOverlayProps) {
  const { isPro } = useProGate();
  const { t } = useAppTranslation();
  const router = useRouter();

  if (isPro) return <>{children}</>;

  const goUpgrade = () => router.push('/(tabs)/settings');

  // ─── compact: 반쪽 너비 카드용 ───────────────────────────────────────
  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={goUpgrade}
        className="flex-1 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-300 dark:border-amber-500/40 p-5 items-center justify-center"
        style={{ minHeight: 110 }}
      >
        <Crown size={18} color="#F59E0B" />
        <Text className="text-amber-500 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider mt-1.5 mb-2">
          Pro
        </Text>
        <Text className="text-slate-700 dark:text-slate-300 text-[11px] font-bold text-center leading-4">
          {feature}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── full-width 플레이스홀더 ──────────────────────────────────────────
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={goUpgrade}
      className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-[32px] border border-amber-300/60 dark:border-amber-500/30 items-center justify-center"
      style={{ minHeight }}
    >
      {/* 잠금 배지 */}
      <View className="bg-amber-400/15 dark:bg-amber-400/10 rounded-full px-3 py-1 flex-row items-center mb-3 border border-amber-400/30">
        <Crown size={12} color="#F59E0B" />
        <Text className="text-amber-500 dark:text-amber-400 text-[10px] font-black ml-1.5 uppercase tracking-wider">
          Pro
        </Text>
      </View>

      <Text className="text-slate-700 dark:text-slate-200 font-bold text-base mb-4 text-center px-4">
        {feature}
      </Text>

      <View className="flex-row items-center bg-amber-400 px-5 py-2.5 rounded-2xl">
        <Text className="text-black font-black text-[11px] tracking-wide">
          {t('pro.unlockCta')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
