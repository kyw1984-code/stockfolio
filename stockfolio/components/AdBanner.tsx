import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTrackingStore } from '../stores/useTrackingStore';

// 개발 환경에서는 테스트 ID 사용, 프로덕션에서는 실제 ID 사용
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: Constants.expoConfig?.extra?.admobIosBannerId ?? TestIds.BANNER,
      android: Constants.expoConfig?.extra?.admobAndroidBannerId ?? TestIds.BANNER,
      default: TestIds.BANNER,
    }) ?? TestIds.BANNER;

interface AdBannerProps {
  size?: BannerAdSize;
}

export default function AdBanner({ size = BannerAdSize.BANNER }: AdBannerProps) {
  const isPro = useSettingsStore((s) => s.isPro);
  const { isInitialized, isAuthorized } = useTrackingStore();

  // Pro 사용자는 광고 비표시
  if (isPro) return null;

  // ATT 초기화 전에는 광고를 로드하지 않아 동의 전 추적 데이터 수집 방지
  if (!isInitialized) return null;

  return (
    <View className="items-center my-2">
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: Platform.OS === 'ios' ? !isAuthorized : false,
        }}
      />
    </View>
  );
}
