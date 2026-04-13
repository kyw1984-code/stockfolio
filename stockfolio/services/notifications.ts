import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DividendInfo } from './dividendApi';

// 포그라운드에서도 배너 + 소리로 표시
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** 알림 권한 요청 — 허용 여부 반환 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** 현재 권한 상태 확인 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

interface SchedulePayload {
  symbol: string;
  name: string;
  dividendInfo: DividendInfo;
  isPro: boolean;
  dividendAlertsEnabled: boolean;
}

/**
 * 단일 종목의 배당 알림 예약
 * - Ex-date 전날 오전 9시: "내일이 {symbol} 배당 기준일입니다"
 * - Pay-date 당일 오전 9시: "{symbol} 배당금 지급일입니다" (Pro 전용)
 */
export async function scheduleDividendNotifications({
  symbol,
  name,
  dividendInfo,
  isPro,
  dividendAlertsEnabled,
}: SchedulePayload): Promise<void> {
  if (!dividendAlertsEnabled) return;

  // 기존 해당 종목 알림 취소 후 재등록
  await cancelDividendNotifications(symbol);

  const { exDate, payDate, dividendPerShare } = dividendInfo;
  if (!exDate) return;

  const now = new Date();

  // --- Ex-date 전날 알림 ---
  const exDateObj = new Date(exDate);
  const exNotifyDate = new Date(exDateObj);
  exNotifyDate.setDate(exDateObj.getDate() - 1); // 하루 전
  exNotifyDate.setHours(9, 0, 0, 0);             // 오전 9시

  if (exNotifyDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `ex_${symbol}`,
      content: {
        title: `📅 배당 기준일 D-1 — ${symbol}`,
        body: `내일(${exDate})이 ${name || symbol}의 배당 기준일입니다. 주당 $${dividendPerShare?.toFixed(2) ?? '-'} 예정`,
        data: { symbol, type: 'ex_date' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: exNotifyDate,
      },
    });
  }

  // --- Pay-date 당일 알림 (Pro 전용) ---
  if (isPro && payDate) {
    const payDateObj = new Date(payDate);
    payDateObj.setHours(9, 0, 0, 0);

    if (payDateObj > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `pay_${symbol}`,
        content: {
          title: `💰 배당금 지급일 — ${symbol}`,
          body: `오늘 ${name || symbol} 배당금이 지급됩니다. 주당 $${dividendPerShare?.toFixed(2) ?? '-'}`,
          data: { symbol, type: 'pay_date' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: payDateObj,
        },
      });
    }
  }
}

/** 특정 종목의 배당 알림 모두 취소 */
export async function cancelDividendNotifications(symbol: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`ex_${symbol}`).catch(() => null);
  await Notifications.cancelScheduledNotificationAsync(`pay_${symbol}`).catch(() => null);
}

/** 모든 배당 알림 취소 */
export async function cancelAllDividendNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** 현재 예약된 알림 목록 조회 (디버그용) */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Android 전용 알림 채널 설정
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('dividends', {
    name: '배당 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}
