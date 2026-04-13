import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAppTranslation } from './useAppTranslation';

export const FREE_HOLDINGS_LIMIT = 5;

/**
 * 공용 Pro 게이트 훅.
 * - `isPro` 플래그 노출
 * - `requirePro()`: Pro가 아니면 업그레이드 유도 모달을 띄우고 false 반환
 */
export function useProGate() {
  const isPro = useSettingsStore((s) => s.isPro);
  const router = useRouter();
  const { t } = useAppTranslation();

  const requirePro = (options?: { title?: string; message?: string }) => {
    if (isPro) return true;
    Alert.alert(
      options?.title ?? t('pro.lockedTitle'),
      options?.message ?? t('pro.lockedMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('pro.upgrade'),
          onPress: () => router.push('/(tabs)/settings'),
        },
      ]
    );
    return false;
  };

  return { isPro, requirePro };
}
