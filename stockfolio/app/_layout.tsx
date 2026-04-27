import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import '../global.css';
import { useSettingsStore } from '../stores/useSettingsStore';
import { usePortfolioStore } from '../stores/usePortfolioStore';
import { useDividendStore } from '../stores/useDividendStore';
import { initRevenueCat, checkProEntitlement } from '../services/revenueCat';
import {
  requestNotificationPermission,
  scheduleDividendNotifications,
  cancelAllDividendNotifications,
} from '../services/notifications';

export default function RootLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const { isPro, dividendAlertsEnabled, setIsPro } = useSettingsStore();
  const holdings = usePortfolioStore((s) => s.holdings);
  const dividendData = useDividendStore((s) => s.dividendData);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  // ATT 권한 요청 → RevenueCat 초기화 → Pro entitlement 동기화
  useEffect(() => {
    async function initApp() {
      await requestTrackingPermissionsAsync();
      initRevenueCat();
      const pro = await checkProEntitlement();
      setIsPro(pro);
    }
    initApp();
  }, []);

  // 알림 권한 요청 (앱 시작 시 1회)
  useEffect(() => {
    requestNotificationPermission();

    // 알림 탭 이벤트 리스너
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // 향후 알림 탭 시 특정 화면으로 이동하는 로직 추가 가능
      }
    );

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  // 배당 알림 재스케줄링 — 알림 설정 변경 또는 보유 종목/배당 데이터 변경 시
  useEffect(() => {
    async function reschedule() {
      if (!dividendAlertsEnabled) {
        await cancelAllDividendNotifications();
        return;
      }

      for (const holding of holdings) {
        const info = dividendData[holding.symbol.toUpperCase()];
        if (!info) continue;
        await scheduleDividendNotifications({
          symbol: holding.symbol,
          name: holding.name,
          dividendInfo: info,
          isPro,
          dividendAlertsEnabled,
        });
      }
    }

    reschedule();
  }, [dividendAlertsEnabled, isPro, holdings, dividendData]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-stock"
          options={{
            title: 'Add Asset',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#0F172A' },
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            title: 'New Transaction',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#0F172A' },
          }}
        />
        <Stack.Screen
          name="stock/[ticker]"
          options={{
            title: 'Market Analysis',
            headerBackTitle: 'Portfolio',
          }}
        />
        <Stack.Screen
          name="data-sources"
          options={{
            title: 'Data Reliability',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#0F172A' },
          }}
        />
      </Stack>
    </>
  );
}
