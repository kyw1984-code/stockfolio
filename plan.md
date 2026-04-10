# StockFolio — Portfolio & Dividend Tracker

### 앱 개발 기획서 v4.0 | Google Play Store Launch Plan (글로벌 + 한국 버전)

> **"흩어진 내 주식을 한 곳에서. 배당 수익까지 한눈에."**
> **"All your investments in one place. Dividends at a glance."**

**Version 4.0 | April 2026**
**Prepared by: 김영욱 (쿠팡박사 훈프로)**
**Tech Stack: React Native (Expo) + TypeScript + Claude Code**

---

## 1. 시장 분석 (Market Analysis)

### 1-1. 글로벌 시장 규모

| 항목 | 수치 |
|------|------|
| 글로벌 주식 거래 앱 시장 (2030) | $1,400억 (CAGR 18.3%) |
| 미국 성인 투자자 비율 (2024) | 62% (약 1.6억 명) |
| 미국 배당 투자 커뮤니티 (Reddit r/dividends) | 100만+ 멤버 |
| FIRE 커뮤니티 (Reddit r/financialindependence) | 200만+ 멤버 |
| 금융 카테고리 광고 eCPM (미국) | $15~30 (최고 수준) |

### 1-2. 한국 시장 규모

| 항목 | 수치 |
|------|------|
| 한국 주식 투자 인구 (2025) | 약 1,400만 명 (인구의 27%) |
| 해외주식 투자자 (2025) | 약 800만 명+ |
| 한국 개인투자자 해외주식 보유 | $700억+ (역대 최대) |
| "국장+미장 통합 관리" 수요 | 클리앙/디시 등 커뮤니티에서 지속적 요청 |
| 한국 금융 광고 eCPM | $5~15 (한국 기준 상위) |

### 1-3. 경쟁앱 분석

#### 글로벌 경쟁앱

| 앱명 | 가격 | 다운로드 | 사용자 불만 (= 우리의 기회) |
|------|------|----------|---------------------------|
| Delta by eToro | $100/년 | 5M+ | "무료는 자산 10개 제한" "구독 없이 기본기능 안 됨" |
| My Stocks Portfolio | $6.49 일회성 | 1M+ | "UI가 오래됨" "위젯 글자 너무 작음" |
| Yahoo Finance | 무료+구독 | 50M+ | "광고 너무 많음" "배당 추적 안 됨" |

#### 한국 경쟁앱

| 앱명 | 가격 | 다운로드 | 사용자 불만 (= 우리의 기회) |
|------|------|----------|---------------------------|
| 더리치 (The Rich) | 무료+구독 | 500K+ | "미국주식 종가 부정확" "버그 수정 느림" |
| 도미노 | 무료 | 100K+ | "배당 내역 부정확" "종목별 배당금 안내 없음" |
| 증권플러스 | 무료 | 1M+ | "매매 중심이라 포트폴리오 관리 약함" |
| 토스 투자모아보기 | 무료 | N/A | "마이데이터만 가능" "수동 입력 불가" |

### 1-4. StockFolio 포지셔닝

**글로벌:** "무료로 자산 무제한 + 배당 자동 계산 + 깨끗한 UI"

**한국:** "국장+미장 통합 관리 + 원화 환산 자동 + 배당 캘린더 + 배당세 계산"

---

## 2. 앱 컨셉 (App Concept)

### 2-1. 기본 정보

| 항목 | 글로벌 버전 | 한국 버전 |
|------|------------|----------|
| 앱명 | StockFolio — Portfolio & Dividend Tracker | StockFolio — 주식 포트폴리오 & 배당 관리 |
| 서브타이틀 | Track Stocks, ETFs & Dividend Income | 국내주식·미국주식·배당금 통합 관리 |
| 타겟 | 미국/글로벌 개인투자자 (25-55세) | 한국 개인투자자 (25-55세) |
| UI 언어 | 영어 | 한국어 |
| 통화 | USD (기본) + 멀티 통화 | KRW (기본) + USD 원화 환산 |
| 수익 모델 | 무료 + 광고 + Pro $29.99/년 | 무료 + 광고 + Pro ₩29,900/년 |

### 2-2. 핵심 차별화

**공통:**
1. 자산 무제한 무료 (Delta처럼 10개 제한 없음)
2. 배당 계산기 내장 (연간/월간 예상 배당 자동 계산)
3. 초간단 수동 입력 (계정 연동 없이 티커+수량+매수가만)

**한국 버전 추가:**
4. 국장+미장 통합 (삼성전자와 AAPL을 한 포트폴리오에서)
5. 원화 환산 자동 (한국은행 공식 환율 기반)
6. 한국 배당세 계산 (국내 15.4%, 해외 15% 원천징수 반영)
7. KOSPI/KOSDAQ 지원 (한국 종목코드 검색 + 시세)

---

## 3. 핵심 기능 상세 (Core Features)

### 3-1. 포트폴리오 대시보드

| 요소 | 한국 추가사항 | Free/Pro |
|------|-------------|----------|
| 총 자산 가치 + 일일 변동 | 원화(₩) 환산 (한국은행 환율) | Free |
| 종목별 현재가, 수익률, 비중 | 국내(₩)+해외($→₩) 혼합 | Free |
| 섹터/자산별 파이차트 | 국내/해외 비중 구분 | Free |
| 통화별 자산 비중 | KRW vs USD | Free |
| 총 수익률 (CAGR 포함) | 환차익/환손실 별도 | Free |
| 포트폴리오 가치 그래프 | — | Pro |
| 멀티 포트폴리오 | "국내" "미국" "은퇴연금" | Pro |

### 3-2. 배당 트래커 — 핵심 차별화

| 요소 | 한국 추가사항 | Free/Pro |
|------|-------------|----------|
| 연간 예상 배당금 | 세후 실수령액 반영 | Free |
| 월별 배당 캘린더 | 배당락일+지급일 구분 | Free |
| 배당 수익률 (Yield on Cost) | — | Free |
| 배당 목표 계산기 | 원화 설정 가능 | Free |
| 다음 배당 알림 | — | Free |
| 배당 히스토리 + 성장률 | — | Pro |
| 배당세 계산기 | 국내/해외 원천징수+종합소득세 | Pro |

### 3-3. 투자 계산기

| 계산기 | Free/Pro |
|--------|----------|
| 배당 목표 (월배당 → 필요 투자금) | Free |
| 복리 (초기투자+월적립+수익률) | Free |
| DCA (적립식 투자 시뮬레이션) | Free |
| 환율 (한국은행 공식 USD/KRW) — 한국 | Free |
| FIRE (조기은퇴 가능 연도) | Pro |
| 양도소득세 (250만원 공제) — 한국 | Pro |
| 배당소득세 — 한국 | Pro |

### 3-4. 알림 & 위젯

| 기능 | Free/Pro |
|------|----------|
| 가격 알림 (목표가 도달) | Free 3개 / Pro 무제한 |
| 배당 알림 (지급일/배당락일) | Free |
| 환율 알림 (USD/KRW) — 한국 | Free |
| 홈 위젯 | Pro |
| 실적 발표 알림 | Pro |

---

## 4. 화면 설계

### 4-1. 탭 구조 (4탭)

| 탭 | 이름 | 핵심 기능 |
|----|------|----------|
| 1 | Portfolio | 총 자산 + 종목 리스트 + 비중 + 손익 |
| 2 | Dividends | 배당 캘린더 + 연간 배당 + 목표 |
| 3 | Calculator | 복리/DCA/환율/FIRE 계산기 |
| 4 | Settings | 알림 + Pro구독 + 통화/언어 |

### 4-2. 한국 버전 메인 화면 (출처 표시 포함)

```
┌─────────────────────────────┐
│  총 자산        ₩63,450,000 │
│  오늘           +₩524,000 ↑ │
│  환율 ₩1,372.50 (한국은행)   │
│  ───────────────────────── │
│  [파이차트: 국내42% 해외58%] │
│  ───────────────────────── │
│  🇰🇷 국내주식                │
│  삼성전자  100주  +12.3%     │
│  SK하이닉스 50주  +8.7%      │
│  ───────────────────────── │
│  🇺🇸 해외주식 ($→₩)          │
│  AAPL   30주  +23.4% ₩8.1M  │
│  SCHD   50주  +8.5%  ₩4.2M  │
│  ───────────────────────── │
│  연간 배당: ₩2,340,000       │
│  (세후: ₩1,989,000)          │
│  ───────────────────────── │
│  [+ 종목 추가]               │
│         [배너 광고]           │
│  ───────────────────────── │
│  📌 데이터 출처               │
│  주식시세: 금융위원회          │
│  환율: 한국은행               │
│  미국주식: Finnhub            │
└─────────────────────────────┘
```

> ⚠️ **필수:** 모든 화면 하단에 데이터 출처 표기 영역을 고정 배치합니다.
> 한국은행 저작권 방침에 따라 "출처: 한국은행" 표기가 반드시 필요하며,
> 공공데이터포털(금융위원회) 역시 출처 표시가 의무입니다.

### 4-3. 배당 화면

```
┌─────────────────────────────┐
│  연간 배당     ₩2,340,000   │
│  세후 실수령   ₩1,989,000   │
│  배당 수익률      3.69%     │
│  ───────────────────────── │
│  [월별 배당 바 차트]          │
│  ───────────────────────── │
│  📅 다음 배당:               │
│  삼성전자 ₩361/주  5/15      │
│  SCHD $0.72/주  6/3         │
│  ───────────────────────── │
│  🎯 월50만원 목표:           │
│  ████████░░░ 33.2%          │
│  ───────────────────────── │
│  📌 출처: 금융위원회, 한국은행│
└─────────────────────────────┘
```

### 4-4. 출처 표시 가이드 (전 화면 공통)

모든 데이터 관련 화면 하단에 아래 형식으로 출처를 고정 표시합니다:

```
📌 데이터 출처
• 국내 주식시세: 금융위원회 (공공데이터포털)
• 환율 정보: 한국은행 경제통계시스템 (ECOS)
• 해외 주식시세: Finnhub
※ 본 앱은 투자 조언을 제공하지 않습니다.
```

**구현 방식:** `components/DataSourceFooter.tsx` 공통 컴포넌트로 제작하여 모든 탭 화면 하단에 삽입. 광고 배너 아래, 스크롤 최하단에 위치시킵니다.

---

## 5. 수익화 전략

### 5-1. Free vs Pro

| 기능 | Free | Pro $29.99/년 (₩29,900) |
|------|------|-------------------------|
| 종목 추가 무제한 | ✅ | ✅ |
| 국내+해외 통합 | ✅ | ✅ |
| 원화 환산 (한국은행 환율) | ✅ | ✅ |
| 시세 (15분 지연/전일종가) | ✅ | ✅ |
| 배당 자동 계산 | ✅ | ✅ |
| 배당 캘린더 | ✅ | ✅ |
| 배당 목표 계산기 | ✅ | ✅ |
| 비중 차트 | ✅ | ✅ |
| 복리/DCA/환율 계산기 | ✅ | ✅ |
| 가격 알림 3종목 | ✅ | ✅ 무제한 |
| 광고 | ✅ 배너+전면+보상형 | ❌ 제거 |
| 포트폴리오 그래프 | ❌ | ✅ |
| 멀티 포트폴리오 | ❌ | ✅ |
| 배당 성장률 분석 | ❌ | ✅ |
| FIRE/세금 계산기 | ❌ | ✅ |
| 홈 위젯 | ❌ | ✅ |
| CSV 내보내기 | ❌ | ✅ |
| 테마 변경 | ❌ | ✅ |

### 5-2. 수익 예측 (12개월)

| 항목 | 3개월 | 6개월 | 9개월 | 12개월 |
|------|-------|-------|-------|--------|
| MAU 합계 | 5,000 | 23,000 | 55,000 | 110,000 |
| 광고 수익/월 | $500 | $3,500 | $11,000 | $28,000 |
| Pro 구독/월 | $200 | $1,700 | $5,500 | $13,750 |
| **월 총수익** | **$700** | **$5,200** | **$16,500** | **$41,750** |

---

## 6. API 전략 (상업적 이용 검증)

### ✅ 확정 API

| 용도 | API | 비용 | 상업이용 | 출처 표시 의무 |
|------|-----|------|---------|--------------|
| 미국주식 시세 | **Finnhub** | 무료 60회/분 | ✅ MVP OK, 수익 시 유료 $12/월 | "Finnhub" 표기 |
| 한국주식 시세 | **공공데이터포털 (금융위원회_주식시세정보)** | 무료 10만건/일 | ✅ 공공데이터법 법적 보장 | **"출처: 금융위원회" 필수** |
| 한국 종목정보 | **공공데이터포털 (금융위원회_KRX상장종목정보)** | 무료 | ✅ 법적 보장 | **"출처: 금융위원회" 필수** |
| 환율 | **한국은행 ECOS API** | 무료 | ✅ 공공데이터법 적용, 출처 표시 조건 | **"출처: 한국은행" 필수** |
| 배당 데이터 | **Finnhub 배당 엔드포인트** | 무료 | ✅ 위 동일 | "Finnhub" 표기 |
| 광고 | **Google AdMob** | 무료 | ✅ | — |
| 결제 | **RevenueCat** | 무료 (~$2.5K매출) | ✅ | — |
| 분석 | **Firebase Analytics** | 무료 Spark | ✅ | — |

### ❌ 사용 금지 API

| API | 사유 |
|-----|------|
| ~~KRX Open API~~ | 이용약관에 "상업적 이익 추구 금지" 명시 |
| ~~Yahoo Finance 비공식~~ | 비공식, 언제든 차단 가능 |

### 한국은행 ECOS API 사용 조건

한국은행 저작권 방침에 따라 다음을 반드시 준수합니다:

1. **출처 표시:** 앱 내 환율 데이터가 표시되는 모든 화면에 "출처: 한국은행" 명기
2. **변경 사실 명시:** 환율 데이터를 가공(원화 환산 등)할 경우 가공 사실을 명시
3. **오인 금지:** 한국은행이 앱을 후원하거나 특수한 관계인 것처럼 오인하게 하는 표시 금지

**앱 내 구현:**
- 모든 화면 하단 `DataSourceFooter` 컴포넌트에 출처 표기
- Settings > 데이터 출처 페이지에 상세 출처 정보 + 링크 제공
- 환율 표시 옆에 "(한국은행)" 소스 라벨 표시

### API 비용 로드맵

| 단계 | API 비용 |
|------|---------|
| MVP ~ 출시 초기 (MAU ~5K) | **$0 (전부 무료)** |
| 수익 발생 시작 | Finnhub 유료 **$12/월** |
| 대규모 성장 (MAU 50K+) | Finnhub 상위 **$50~100/월** |

> 💡 공공데이터포털 + 한국은행 ECOS는 규모에 관계없이 무료 유지 (출처 표시만 준수)

---

## 7. 기술 스택

| 구분 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | React Native (Expo) | Claude Code 최적화 |
| 언어 | TypeScript | 타입안전성 |
| 스타일링 | NativeWind | AI 최적 생성 |
| 네비게이션 | Expo Router | 파일 기반 4탭 |
| 상태관리 | Zustand + MMKV | 경량 + 초고속 |
| 차트 | Victory Native | 그래프/파이차트 |
| 다국어 | i18next | 한/영 |
| 알림 | expo-notifications | 푸시 |
| 광고 | Google AdMob | 배너+전면+보상형 |
| 결제 | RevenueCat | 구독 관리 |
| 분석 | Firebase Analytics | 국가별 세그먼트 |

### 폴더 구조

```
stockfolio/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Portfolio 대시보드
│   │   ├── dividends.tsx      # 배당 트래커
│   │   ├── calculator.tsx     # 계산기 모음
│   │   └── settings.tsx       # 설정
│   ├── stock/[ticker].tsx     # 개별 종목 상세
│   ├── add-stock.tsx          # 종목 추가
│   ├── add-transaction.tsx    # 거래 기록
│   ├── data-sources.tsx       # 데이터 출처 상세 페이지
│   └── _layout.tsx
├── components/
│   ├── PortfolioSummary.tsx   # 총 자산 (원화 환산)
│   ├── StockListItem.tsx      # 종목 아이템
│   ├── SectorPieChart.tsx     # 섹터 파이차트
│   ├── CountryPieChart.tsx    # 국내/해외 비중
│   ├── DividendCalendar.tsx   # 배당 캘린더
│   ├── DividendGoal.tsx       # 배당 목표 계산기
│   ├── CompoundCalculator.tsx # 복리 계산기
│   ├── DCACalculator.tsx      # DCA 계산기
│   ├── ExchangeRateCard.tsx   # 환율 카드 (한국은행)
│   ├── TaxCalculator.tsx      # 세금 계산기
│   └── DataSourceFooter.tsx   # ⭐ 출처 표시 공통 컴포넌트
├── stores/
│   ├── usePortfolioStore.ts
│   ├── useDividendStore.ts
│   ├── useExchangeStore.ts    # 한국은행 환율
│   └── useSettingsStore.ts
├── services/
│   ├── finnhubApi.ts          # Finnhub (미국주식)
│   ├── publicDataApi.ts       # 공공데이터포털 (한국주식)
│   ├── bokApi.ts              # ⭐ 한국은행 ECOS API (환율)
│   ├── dividendApi.ts         # 배당 데이터
│   └── priceCache.ts          # 시세 캐싱
├── i18n/
│   ├── ko.json
│   └── en.json
├── data/
│   ├── sectorMapping.ts
│   ├── popularStocks.ts
│   ├── taxRates.ts
│   └── dataSources.ts        # ⭐ 출처 정보 상수
├── utils/
│   ├── calculations.ts
│   ├── formatters.ts
│   ├── currency.ts
│   └── notifications.ts
└── assets/flags/
```

---

## 8. 개발 로드맵

### Phase 1: MVP 글로벌 버전 (Week 1~3)

**Week 1: 프로젝트 세팅 + 포트폴리오 화면**
1. Expo 프로젝트 생성 + CLAUDE.md 설정
2. 4탭 네비게이션 + i18next 다국어 세팅
3. Finnhub API 연동 (미국주식 시세)
4. 종목 추가 화면 (티커 검색 + 수량/매수가)
5. 포트폴리오 대시보드 (총 자산, 종목 리스트, 일일 손익)

**Week 2: 배당 트래커 + 계산기**
1. 배당 데이터 조회 + 연간 배당 자동 계산
2. 월별 배당 캘린더 (바 차트)
3. 배당 목표 계산기
4. 복리 계산기 + DCA 계산기
5. 섹터별 파이차트

**Week 3: 기록 + 알림**
1. 거래 기록 (매수/매도/배당 수령)
2. 가격 알림 (목표가 푸시)
3. 배당 지급일 알림
4. MMKV 로컬 저장 + 시세 캐싱
5. 설정 화면 (알림, 단위, 플랜)

### Phase 2: 한국 버전 추가 (Week 4~7)

1. 공공데이터포털 API 연동 (한국주식 시세)
2. **한국은행 ECOS API 연동 (USD/KRW 환율)**
3. 원화 환산 자동 표시 (한국은행 환율 기반)
4. 국내/해외 비중 차트
5. 한국어 UI 번역 (i18n/ko.json)
6. 한국주식 종목 검색 (종목코드+종목명)
7. 한국 배당세 계산기 (15.4%)
8. 해외주식 양도소득세 계산기 (250만원 공제)
9. 환율 알림 기능
10. **`DataSourceFooter.tsx` 출처 표시 컴포넌트 제작 → 전 화면 적용**
11. **`data-sources.tsx` 데이터 출처 상세 페이지 제작**
12. 한국 스크린샷 준비

### Phase 3: 수익화 강화 (Week 8~11)

1. RevenueCat Pro 구독 시스템
2. 보상형 광고 최적화
3. Firebase Analytics 국가별 세그먼트
4. ASO 최적화 (한/영 A/B 테스트)
5. 사용자 리뷰 기반 개선

### Phase 4: 확장 (Week 12~20)

1. 홈 스크린 위젯 (Pro)
2. 포트폴리오 가치 히스토리 그래프 (Pro)
3. 배당 성장률 분석 (Pro)
4. FIRE 계산기 (Pro)
5. iOS 버전 출시 (EAS Build)
6. 추가 언어 (일본어, 독일어)
7. CSV 데이터 내보내기

### Phase 5: 광고 연동 + 스토어 배포 (Week 21~22)

1. Google AdMob 연동 (배너 + 전면 + 보상형)
2. 앱 아이콘 + 스크린샷 디자인
3. 스토어 리스팅 작성 (영어 + 한국어)
4. EAS Build → AAB 빌드 + QA 테스트
5. 출처 표시 최종 점검 (금융위원회 + 한국은행 + Finnhub)
6. 투자 면책조항 최종 확인
7. Google Play Console 등록
8. **🚀 글로벌 + 한국 동시 출시!**

---

## 9. 마케팅 & ASO

### 스토어 리스팅

| 항목 | 영어 | 한국어 |
|------|------|--------|
| 제목 | StockFolio — Portfolio & Dividend Tracker | StockFolio — 주식 포트폴리오 & 배당 관리 |
| 부제목 | Track Stocks, ETFs & Dividend Income Free | 국내·미국주식·배당금 무료 통합 관리 |
| 키워드 | portfolio tracker, dividend, FIRE | 주식 포트폴리오, 배당금, 배당 캘린더 |

### 유입 채널

**글로벌:** Reddit, YouTube, TikTok, Product Hunt, X FinTwit

**한국:** 네이버 카페, 클리앙/디시, 투자 유튜브, 에브리타임/블라인드, 네이버 블로그 SEO

---

## 10. 비용 계획

| 항목 | 비용 | 비고 |
|------|------|------|
| Google Play 개발자 | $25 (1회) | 필수 |
| Claude Code Max | $100/월 | 개발 2~3개월 |
| Finnhub | $0 → $12/월 | MVP 무료, 수익 시 유료 |
| 공공데이터포털 | $0 | 영구 무료, 법적 보장 |
| 한국은행 ECOS | $0 | 영구 무료, 출처 표시 조건 |
| Expo/Firebase/RevenueCat/AdMob | $0 | 전부 무료 |
| **총 초기비용** | **~$125 + 월$100** | **약 17만원 시작** |

---

## 11. 출처 표시 & 법적 준수사항

### 11-1. 앱 내 출처 표시 (필수)

모든 데이터 화면 하단에 `DataSourceFooter` 컴포넌트로 다음을 표시합니다:

```
────────────────────────────
📌 데이터 출처
• 국내 주식시세: 금융위원회 (공공데이터포털)
• 환율 정보: 한국은행 경제통계시스템(ECOS)
• 해외 주식시세: Finnhub
※ 본 앱은 투자 조언을 제공하지 않습니다.
────────────────────────────
```

### 11-2. 데이터 출처 상세 페이지 (Settings 내)

Settings > "데이터 출처 및 저작권" 메뉴에서 아래 내용을 표시합니다:

```
[데이터 출처 및 저작권 안내]

1. 국내 주식시세 정보
   출처: 금융위원회 (공공데이터포털 data.go.kr)
   본 앱은 공공데이터포털에서 제공하는 '금융위원회_주식시세정보'
   및 '금융위원회_KRX상장종목정보' API를 활용하고 있습니다.
   「공공데이터의 제공 및 이용 활성화에 관한 법률」에 따라 이용합니다.

2. 환율 정보
   출처: 한국은행 경제통계시스템 (ECOS, ecos.bok.or.kr)
   본 앱은 한국은행이 제공하는 환율 통계 데이터를 활용하고 있습니다.
   한국은행 저작권 방침에 따라 출처를 표시하며,
   데이터 가공 시 가공 사실을 명시합니다.

3. 해외 주식시세 및 배당 데이터
   출처: Finnhub (finnhub.io)
   미국 주식 시세는 15분 지연된 데이터입니다.

[면책조항]
본 앱은 투자 조언을 제공하지 않습니다.
표시되는 데이터는 참고용이며, 실제 거래 시에는
증권사 등 공식 채널의 데이터를 확인하시기 바랍니다.
투자 판단에 따른 손실에 대해 본 앱은 책임을 지지 않습니다.
```

### 11-3. 환율 표시 시 출처 라벨

환율이 표시되는 모든 위치에 소스 라벨을 함께 표시합니다:

```
환율 ₩1,372.50 (한국은행)        ← Portfolio 화면 상단
USD/KRW ₩1,372.50 출처:한국은행   ← 환율 계산기 내
```

### 11-4. 준수사항 체크리스트

| 항목 | 대상 | 필수 조치 |
|------|------|----------|
| 출처 표시 | 금융위원회 데이터 | 앱 화면 하단 + 상세 페이지 |
| 출처 표시 | 한국은행 환율 | 환율 표시 옆 + 화면 하단 + 상세 페이지 |
| 가공 사실 명시 | 한국은행 환율 가공 시 | "환율을 기반으로 원화 환산한 값입니다" 표기 |
| 오인 금지 | 한국은행/금융위 | 후원 또는 특수 관계 암시 금지 |
| 투자 면책조항 | 전체 앱 | 앱 하단 + 상세 페이지 + 스토어 설명 |
| Finnhub 표기 | 해외 주식 데이터 | 출처 표시에 포함 |

---

## 12. Claude Code 개발 가이드

### CLAUDE.md 핵심 내용

```
# StockFolio Project

## Overview
Stock portfolio & dividend tracker. React Native (Expo) + TypeScript.
Supports US stocks (Finnhub) + Korean stocks (공공데이터포털) + exchange rates (한국은행 ECOS).

## Architecture
- Expo Router with 4 tabs (Portfolio, Dividends, Calculator, Settings)
- Zustand for state, MMKV for persistence
- NativeWind (Tailwind) for styling
- i18next for Korean/English localization

## API Rules
- US stocks: Finnhub (free tier, 60 calls/min)
- Korean stocks: 공공데이터포털 금융위원회 API (free, commercial OK)
- Exchange rate: 한국은행 ECOS API (free, source attribution REQUIRED)
- NEVER use KRX Open API (commercial use prohibited)
- NEVER use Yahoo Finance unofficial API (unreliable)
- Cache all API responses in MMKV (min 5min TTL)

## CRITICAL: Source Attribution
- EVERY screen must include DataSourceFooter component at bottom
- Exchange rate display must always show "(한국은행)" label
- Settings must include full data-sources page with legal text
- Investment disclaimer must appear on footer and settings

## Coding Conventions
- Functional components with TypeScript interfaces
- NativeWind for all styling (no StyleSheet)
- All API calls in services/ directory
- All calculations in utils/calculations.ts
- Currency: Intl.NumberFormat with user locale (₩ or $)
- All user-facing strings through i18next (never hardcode)
```

---

## 13. 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| Finnhub 무료 API 제한 | 캐싱 + 수익 시 유료 $12/월 |
| 공공데이터포털 서버 불안정 | 캐싱 + 수동 입력 대안 |
| 한국은행 API 제한 | 하루 1~2회만 갱신 (환율은 자주 안 바뀜) |
| 출처 표시 누락 | DataSourceFooter 필수 삽입 + QA 체크리스트 |
| 경쟁앱 가격 인하 | 무료 핵심기능 유지 + 광고 모델 |
| 금융 규제 이슈 | 매매 기능 없음 + 면책조항 필수 |

---

## 14. 핵심 요약

| 항목 | 내용 |
|------|------|
| 앱명 | StockFolio — Portfolio & Dividend Tracker |
| 핵심 | 무료 무제한 포트폴리오 + 배당 자동계산 + 국장/미장 통합 |
| 수익 | 광고 ($15~30 eCPM) + Pro $29.99/년 |
| 타겟 | 글로벌 + 한국 개인투자자 |
| 개발 | 5 Phase, 약 22주 |
| 비용 | 초기 ~$125 (17만원) |
| 12개월 목표 | MAU 110K / 월 $41,750 |
| API | Finnhub + 공공데이터포털 + 한국은행 ECOS (전부 무료) |
| 출처 표시 | ✅ 전 화면 하단 필수 표기 (금융위원회 + 한국은행 + Finnhub) |

---

> **StockFolio — 국장도 미장도 한 곳에서. 배당금까지 자동으로.** 🚀
> **데이터 출처: 금융위원회 · 한국은행 · Finnhub**
