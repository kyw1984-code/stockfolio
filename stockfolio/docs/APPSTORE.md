# App Store Connect — StockFolio 등록 정보

---

## 기본 정보

| 항목 | 내용 |
|------|------|
| **앱 이름** (30자) | StockFolio |
| **부제목** (30자) | Portfolio & Dividend Tracker |
| **카테고리** | Finance (금융) |
| **2차 카테고리** | Productivity (생산성) |
| **언어** | 한국어 (기본), English |
| **연령 등급** | 4+ |

---

## 키워드 (100자, 영문)

```
stocks,portfolio,dividend,investment,KRX,KOSPI,NYSE,tracker,finance,주식,배당,포트폴리오
```

> 쉼표 사이 공백 없음. Apple은 공백도 글자 수로 계산.

---

## 홍보 문구 Promotional Text (170자 — 업데이트 없이 수시 변경 가능)

**영문:**
```
Track US & Korean stocks in one place. Real-time prices, dividend tracking, and KRW/USD conversion — all stored privately on your device.
```

**한국어:**
```
미국·한국 주식을 한 곳에서. 실시간 시세, 배당 추적, 원/달러 환율 변환까지. 모든 데이터는 내 기기에만 저장됩니다.
```

---

## 설명 Description (4000자)

### 영문 (메인)

```
StockFolio is a clean, privacy-first portfolio tracker for US and Korean stocks.

PORTFOLIO MANAGEMENT
• Add US stocks (NYSE, NASDAQ) and Korean stocks (KOSPI, KOSDAQ)
• Track real-time prices with automatic refresh
• View total portfolio value, today's change, and total return
• See your holdings split by country with an interactive pie chart
• Sector breakdown to understand your portfolio concentration

DIVIDEND TRACKING
• Automatic dividend data for US stocks
• Korean stock dividend data powered by the Financial Services Commission API
• Monthly dividend calendar to visualize income streams
• Set a monthly dividend income goal and track your progress
• Yield on cost calculation

CURRENCY & EXCHANGE RATE
• Switch between USD and KRW display at any time
• Real-time USD/KRW exchange rate from the Bank of Korea (한국은행)
• All US stock values automatically converted to KRW when needed

CALCULATORS
• Compound interest calculator
• DCA (Dollar-Cost Averaging) simulator
• Dividend goal planner
• Korean capital gains tax calculator

TRANSACTION HISTORY
• Log buy, sell, and dividend transactions
• Automatic average cost calculation when adding to existing positions
• Full transaction history per stock

PRIVACY FIRST
• No account or sign-up required
• All portfolio data stored locally on your device
• No ads, no tracking
```

### 한국어

```
StockFolio는 미국·한국 주식을 함께 관리할 수 있는 깔끔한 포트폴리오 앱입니다.

포트폴리오 관리
• 미국 주식(NYSE, NASDAQ)과 한국 주식(KOSPI, KOSDAQ) 동시 보유
• 자동 새로고침으로 실시간 시세 반영
• 총 자산, 오늘의 변동, 총 수익률 한눈에 확인
• 국내·해외 비중 파이 차트로 자산 배분 시각화
• 섹터별 비중 분석

배당금 관리
• 미국 주식 배당 데이터 자동 조회
• 금융위원회 공공데이터 기반 한국 주식 배당 정보
• 월별 배당 캘린더로 수입 흐름 파악
• 월 배당 목표 설정 및 달성률 추적
• 투자 원금 대비 배당수익률(YOC) 계산

환율 & 통화 전환
• USD/KRW 언제든 전환
• 한국은행 기준 실시간 원/달러 환율 반영
• 미국 주식 평가액 원화 자동 환산

계산기
• 복리 계산기
• 적립식 투자(DCA) 시뮬레이터
• 배당 목표 계산기
• 한국 주식 양도소득세 계산기

거래 내역
• 매수·매도·배당 거래 기록
• 동일 종목 추가 매수 시 평균 단가 자동 계산
• 종목별 전체 거래 내역 조회

개인정보 보호
• 회원가입·로그인 불필요
• 모든 포트폴리오 데이터는 내 기기에만 저장
• 광고 없음, 행동 추적 없음
```

---

## 개인정보처리방침 URL

GitHub Pages 설정 후 아래 형식으로 등록:

```
https://[your-github-username].github.io/stockfolio/privacy
```

### GitHub Pages 설정 방법

1. GitHub에 `stockfolio` 저장소 생성 (또는 기존 repo 사용)
2. `docs/` 폴더를 push
3. 저장소 Settings → Pages → Source: `main` 브랜치, `/docs` 폴더 선택
4. 저장 후 `https://[username].github.io/[repo-name]/privacy` 접속 확인
5. App Store Connect에 해당 URL 입력

---

## 스크린샷 권장 순서

1. 포트폴리오 메인 화면 (총 자산·수익 표시)
2. 미국+한국 주식 혼합 보유 화면
3. 종목 상세 (시세·배당 정보)
4. 배당 탭 (월별 캘린더)
5. 계산기 탭

---

## App Store Connect 체크리스트

- [ ] 앱 아이콘 1024×1024 PNG (투명 배경 불가)
- [ ] iPhone 스크린샷 (6.9인치 필수, 6.5인치 권장)
- [ ] iPad 스크린샷 (선택, supportsTablet: true이므로 권장)
- [ ] 개인정보처리방침 URL 입력
- [ ] 앱 리뷰 연락처 이메일
- [ ] 데이터 수집 항목: "데이터를 수집하지 않음" 선택 가능
