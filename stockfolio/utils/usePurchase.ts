import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import {
  checkProEntitlement,
  fetchOfferings,
  purchasePackage,
  restorePurchases,
} from '../services/revenueCat';
import { useSettingsStore } from '../stores/useSettingsStore';

export function usePurchase() {
  const { setIsPro } = useSettingsStore();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setIsLoadingPackages(true);
    const pkgs = await fetchOfferings();
    setPackages(pkgs);
    setIsLoadingPackages(false);
  }

  /** 구매 실행 */
  async function handlePurchase(pkg: PurchasesPackage) {
    setIsPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        setIsPro(true);
        Alert.alert('🎉 Pro 업그레이드 완료', '모든 Pro 기능이 잠금 해제되었습니다.');
      }
    } catch {
      Alert.alert('구매 실패', '결제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsPurchasing(false);
    }
  }

  /** 구매 복원 */
  async function handleRestore() {
    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setIsPro(true);
        Alert.alert('✅ 복원 완료', 'Pro 구독이 복원되었습니다.');
      } else {
        Alert.alert('복원 실패', '복원할 Pro 구독이 없습니다.');
      }
    } catch {
      Alert.alert('복원 실패', '오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsRestoring(false);
    }
  }

  /** 앱 시작 시 entitlement 동기화 */
  async function syncEntitlement() {
    const isPro = await checkProEntitlement();
    setIsPro(isPro);
  }

  return {
    packages,
    isPurchasing,
    isRestoring,
    isLoadingPackages,
    handlePurchase,
    handleRestore,
    syncEntitlement,
  };
}
