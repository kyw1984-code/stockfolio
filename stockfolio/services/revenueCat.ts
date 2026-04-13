import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// RevenueCat에서 생성한 Offering 식별자 (RC 콘솔 > Offerings에서 설정)
export const RC_OFFERING_ID = 'default';

// RevenueCat에서 생성한 Entitlement 식별자 (RC 콘솔 > Entitlements에서 설정)
export const RC_ENTITLEMENT_ID = 'pro';

export function initRevenueCat(userId?: string) {
  const apiKey =
    Platform.OS === 'ios'
      ? (Constants.expoConfig?.extra?.revenueCatIosKey as string) ?? ''
      : ''; // Android 지원 시 추가

  if (!apiKey) {
    console.warn('[RevenueCat] API 키가 설정되지 않았습니다. .env의 REVENUECAT_IOS_API_KEY를 확인하세요.');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey, appUserID: userId ?? null });
}

/** 현재 사용자가 Pro entitlement를 보유하고 있는지 확인 */
export async function checkProEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[RC_ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('[RevenueCat] entitlement 확인 실패:', e);
    return false;
  }
}

/** 현재 Offering의 패키지 목록 조회 */
export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current ?? offerings.all[RC_OFFERING_ID];
    return current?.availablePackages ?? [];
  } catch (e) {
    console.error('[RevenueCat] offerings 조회 실패:', e);
    return [];
  }
}

/** 패키지 구매 — 성공 시 true 반환 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[RC_ENTITLEMENT_ID] !== undefined;
  } catch (e: unknown) {
    // 사용자가 직접 취소한 경우 조용히 무시
    if (
      e &&
      typeof e === 'object' &&
      'userCancelled' in e &&
      (e as { userCancelled: boolean }).userCancelled
    ) {
      return false;
    }
    console.error('[RevenueCat] 구매 실패:', e);
    throw e;
  }
}

/** 이전 구매 복원 — 성공 시 true 반환 */
export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[RC_ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('[RevenueCat] 구매 복원 실패:', e);
    return false;
  }
}
