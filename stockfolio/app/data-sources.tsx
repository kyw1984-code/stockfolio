import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';
import { DATA_SOURCES, DISCLAIMER_KO, DISCLAIMER_EN } from '../data/dataSources';

export default function DataSourcesScreen() {
  const { language } = useSettingsStore();
  const isKo = language === 'ko';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isKo ? '데이터 출처 및 저작권 안내' : 'Data Sources & Copyright'}
        </Text>
      </View>

      {DATA_SOURCES.map((source, index) => (
        <View key={source.id} style={styles.card}>
          <Text style={styles.sourceIndex}>{index + 1}.</Text>
          <Text style={styles.sourceName}>
            {isKo ? source.nameKo : source.nameEn}
          </Text>
          <Text style={styles.sourceDesc}>
            {isKo ? source.descriptionKo : source.descriptionEn}
          </Text>
          {source.disclaimer && isKo && (
            <Text style={styles.sourceDisclaimer}>
              ※ {source.disclaimer}
            </Text>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(source.url)}>
            <Text style={styles.sourceUrl}>{source.url}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>
          {isKo ? '면책조항' : 'Disclaimer'}
        </Text>
        <Text style={styles.disclaimerText}>
          {isKo ? DISCLAIMER_KO : DISCLAIMER_EN}
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  sourceIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sourceDesc: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 8,
  },
  sourceDisclaimer: {
    fontSize: 12,
    color: '#FF9500',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  sourceUrl: {
    fontSize: 13,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  disclaimerCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
});
