import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/useSettingsStore';

interface DataSourceFooterProps {
  showKorean?: boolean; // 한국 데이터 출처 표시 여부
}

export default function DataSourceFooter({ showKorean }: DataSourceFooterProps) {
  const { language } = useSettingsStore();
  const isKo = language === 'ko' || showKorean;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.title}>
        {isKo ? '📌 데이터 출처' : '📌 Data Sources'}
      </Text>
      {isKo && (
        <>
          <Text style={styles.source}>
            • 국내 주식시세: 금융위원회 (공공데이터포털)
          </Text>
          <Text style={styles.source}>
            • 환율 정보: 한국은행 경제통계시스템(ECOS)
          </Text>
        </>
      )}
      <Text style={styles.source}>
        {isKo
          ? '• 해외 주식시세: Finnhub'
          : '• Stock Quotes: Finnhub (15-min delay)'}
      </Text>
      <Text style={styles.disclaimer}>
        {isKo
          ? '※ 본 앱은 투자 조언을 제공하지 않습니다.'
          : '※ This app does not provide investment advice.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  source: {
    fontSize: 11,
    color: '#AEAEB2',
    marginBottom: 2,
    lineHeight: 16,
  },
  disclaimer: {
    fontSize: 10,
    color: '#C7C7CC',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
