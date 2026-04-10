import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { setApiKey } from '../../services/finnhubApi';
import { setPublicDataApiKey } from '../../services/publicDataApi';
import { setBokApiKey } from '../../services/bokApi';
import DataSourceFooter from '../../components/DataSourceFooter';
import i18n from '../../i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currency,
    language,
    priceAlertsEnabled,
    dividendAlertsEnabled,
    isPro,
    finnhubApiKey,
    setCurrency,
    setLanguage,
    togglePriceAlerts,
    toggleDividendAlerts,
    setFinnhubApiKey,
  } = useSettingsStore();

  const isKo = language === 'ko';

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ko' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    // Korean mode defaults to KRW
    if (newLang === 'ko') {
      setCurrency('KRW');
    }
  };

  const handleFinnhubKeyChange = (key: string) => {
    setFinnhubApiKey(key);
    if (key.length > 5) {
      setApiKey(key);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.plan')}</Text>
        <View style={styles.planCard}>
          <View>
            <Text style={styles.planName}>
              {isPro ? t('settings.pro') : t('settings.free')}
            </Text>
            <Text style={styles.planDesc}>
              {isPro
                ? isKo ? '모든 기능 잠금 해제' : 'All features unlocked'
                : isKo ? '무제한 종목, 광고 포함' : 'Unlimited stocks, ads included'}
            </Text>
          </View>
          {!isPro && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>{t('settings.upgradePro')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isKo ? '일반' : 'General'}
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => setCurrency(currency === 'USD' ? 'KRW' : 'USD')}
        >
          <Text style={styles.rowLabel}>{t('settings.currency')}</Text>
          <Text style={styles.rowValue}>
            {currency === 'KRW' ? '₩ KRW' : '$ USD'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleLanguageToggle}>
          <Text style={styles.rowLabel}>{t('settings.language')}</Text>
          <Text style={styles.rowValue}>
            {language === 'en' ? 'English' : '한국어'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.priceAlerts')}</Text>
          <Switch
            value={priceAlertsEnabled}
            onValueChange={togglePriceAlerts}
            trackColor={{ true: '#007AFF' }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.dividendAlerts')}</Text>
          <Switch
            value={dividendAlertsEnabled}
            onValueChange={toggleDividendAlerts}
            trackColor={{ true: '#007AFF' }}
          />
        </View>
      </View>

      {/* API Keys */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Keys</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Finnhub API Key</Text>
          <TextInput
            style={styles.input}
            value={finnhubApiKey}
            onChangeText={handleFinnhubKeyChange}
            placeholder="Enter Finnhub API key"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>
            {isKo
              ? 'finnhub.io에서 무료 키를 발급받으세요'
              : 'Get a free key at finnhub.io'}
          </Text>
        </View>
      </View>

      {/* Data Sources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.dataSources')}</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/data-sources')}
        >
          <Text style={styles.rowLabel}>
            {isKo ? '데이터 출처 및 저작권 안내' : 'Data Sources & Copyright'}
          </Text>
          <Text style={styles.rowValue}>→</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.version')}</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>

      <DataSourceFooter showKorean={isKo} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: { fontSize: 18, fontWeight: '700', color: '#000' },
  planDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  rowLabel: { fontSize: 15, color: '#000' },
  rowValue: { fontSize: 15, color: '#8E8E93' },
  inputGroup: { marginTop: 4 },
  inputLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  inputHint: { fontSize: 11, color: '#AEAEB2', marginTop: 4 },
});
