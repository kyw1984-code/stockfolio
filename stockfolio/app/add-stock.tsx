import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTranslation } from '../utils/useAppTranslation';
import { searchSymbol, getQuote } from '../services/finnhubApi';
import { loadKrxStockList, searchKrxLocal, getKrxStockPrice } from '../services/publicDataApi';
import { usePortfolioStore, MarketType } from '../stores/usePortfolioStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { setCachedPrice } from '../services/priceCache';
import { useProGate, FREE_HOLDINGS_LIMIT } from '../utils/useProGate';

interface UnifiedSearchResult {
  symbol: string;
  displaySymbol: string;
  description: string;
  market: MarketType;
  marketLabel: string;
}

export default function AddStockScreen() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const { addHolding } = usePortfolioStore();
  const holdingsCount = usePortfolioStore((s) => s.holdings.length);
  const { language } = useSettingsStore();
  const { isPro, requirePro } = useProGate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<UnifiedSearchResult | null>(null);
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);

  const handleSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      if (text.length < 1) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const isWeb = Platform.OS === 'web';

        if (!isWeb) await loadKrxStockList();

        const [usResults] = await Promise.allSettled([searchSymbol(text)]);

        const unified: UnifiedSearchResult[] = [];

        if (!isWeb) {
          const krLocal = searchKrxLocal(text);
          krLocal.forEach((kr) => {
            unified.push({
              symbol: kr.srtnCd,
              displaySymbol: kr.srtnCd,
              description: kr.itmsNm,
              market: 'KR',
              marketLabel: `🇰🇷 ${kr.mrktCtg || 'KRX'}`,
            });
          });
        }

        // 2) Finnhub 결과 — .KS/.KQ 심볼은 한국 주식으로 분류, US는 그대로
        if (usResults.status === 'fulfilled') {
          usResults.value.slice(0, 10).forEach((us) => {
            const isKr = us.symbol.endsWith('.KS') || us.symbol.endsWith('.KQ');
            const krCode = isKr ? us.symbol.replace(/\.(KS|KQ)$/, '') : null;
            if (krCode && unified.some((u) => u.symbol === krCode)) return;
            unified.push({
              symbol: us.symbol,
              displaySymbol: us.displaySymbol,
              description: us.description,
              market: isKr ? 'KR' : 'US',
              marketLabel: isKr
                ? `🇰🇷 ${us.symbol.endsWith('.KS') ? 'KOSPI' : 'KOSDAQ'}`
                : '🇺🇸 US',
            });
          });
        }

        setResults(unified.slice(0, 15));
      } catch {
        setResults([]);
      }
      setSearching(false);
    },
    []
  );

  const handleSelect = async (item: UnifiedSearchResult) => {
    setSelected(item);
    setQuery(item.displaySymbol);
    setResults([]);

    // Auto-fill current price
    setLoadingPrice(true);
    try {
      if (item.market === 'KR') {
        const krData = await getKrxStockPrice(item.symbol, item.description);
        if (krData) {
          setAvgPrice(krData.clpr);
        }
      } else {
        const quote = await getQuote(item.symbol);
        if (quote && quote.c > 0) {
          setAvgPrice(quote.c.toFixed(2));
          // refreshPrices가 곧 재호출하지 않도록 캐시에 저장
          setCachedPrice(item.symbol, quote.c, quote.d, quote.dp);
        }
      }
    } catch {
      // Ignore
    }
    setLoadingPrice(false);
  };

  const handleAdd = () => {
    if (!selected) {
      Alert.alert('Error', 'Please select a stock first');
      return;
    }

    // Free plan: 5개 종목 제한
    if (!isPro && holdingsCount >= FREE_HOLDINGS_LIMIT) {
      requirePro({
        title: t('pro.holdingsLimitTitle'),
        message: t('pro.holdingsLimitMsg'),
      });
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(avgPrice);

    if (!sharesNum || sharesNum <= 0) {
      Alert.alert('Error', 'Please enter valid number of shares');
      return;
    }
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Error', 'Please enter valid average price');
      return;
    }

    addHolding(selected.symbol, selected.description, sharesNum, priceNum, selected.market);
    router.back();
  };

  const currencySymbol = selected?.market === 'KR' ? '₩' : '$';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder={
            language === 'ko'
              ? '티커, 종목코드 또는 회사명 검색'
              : t('addStock.searchPlaceholder')
          }
          placeholderTextColor="#C7C7CC"
          autoFocus
        />
        {searching && <ActivityIndicator style={styles.searchLoader} />}
      </View>

      {/* Search Results */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.market}-${item.symbol}`}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.resultRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultSymbol}>{item.displaySymbol}</Text>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <View style={styles.marketBadge}>
                  <Text style={styles.marketLabel}>{item.marketLabel}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Input Form (shown after selection) */}
      {selected && (
        <View style={styles.form}>
          <View style={styles.selectedCard}>
            <View style={styles.selectedRow}>
              <Text style={styles.selectedSymbol}>{selected.symbol}</Text>
              <Text style={styles.selectedMarket}>{selected.marketLabel}</Text>
            </View>
            <Text style={styles.selectedName}>{selected.description}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('addStock.shares')}</Text>
            <TextInput
              style={styles.input}
              value={shares}
              onChangeText={setShares}
              keyboardType="numeric"
              placeholder="e.g. 10"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('addStock.avgPrice')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.prefix}>{currencySymbol}</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={avgPrice}
                onChangeText={setAvgPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#C7C7CC"
              />
              {loadingPrice && <ActivityIndicator size="small" />}
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>{t('addStock.add')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  searchLoader: { marginLeft: 8 },
  resultsList: {
    backgroundColor: '#FFFFFF',
    maxHeight: 350,
  },
  resultItem: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultSymbol: { fontSize: 16, fontWeight: '700', color: '#000' },
  resultName: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  marketBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  marketLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
  form: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  selectedCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSymbol: { fontSize: 18, fontWeight: '700', color: '#007AFF' },
  selectedMarket: { fontSize: 12, color: '#8E8E93' },
  selectedName: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, color: '#8E8E93', marginRight: 4 },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
