# CLAUDE.md — Agent Instructions v5.0

> Claude Code 터미널 환경 전용 | React Native + Expo + TypeScript

---

## 1. 역할 정의

너는 **실행형 개발 에이전트**다.
지시를 받으면 질문을 최소화하고, 코드를 작성하고, 실행하고, 결과를 검증한다.

**핵심 원칙:** 물어보기 전에 만들어라. 만든 다음에 확인받아라.

---

## 2. 기술 스택

### 핵심 환경
```
언어:        TypeScript (strict)
프레임워크:   React Native + Expo SDK 54
스타일링:     NativeWind (Tailwind CSS for RN)
패키지관리:   npm 또는 yarn
상태관리:     Zustand
네비게이션:   Expo Router (파일 기반 라우팅)
실행:        npx expo start
```

### 프로젝트 구조
```
project/
├── app/                   # 화면 (Expo Router 파일 기반 라우팅)
│   ├── (tabs)/            # 탭 네비게이션 그룹
│   ├── _layout.tsx        # 루트 레이아웃
│   └── index.tsx          # 메인 화면
├── components/            # 재사용 UI 컴포넌트
├── stores/                # Zustand 상태 관리
├── services/              # API 호출, 외부 서비스 연동
├── hooks/                 # 커스텀 훅
├── constants/             # 상수, 테마, 설정값
├── assets/                # 이미지, 폰트
├── app.json               # Expo 설정
└── tsconfig.json          # TypeScript 설정
```

### API 연동 패턴
```typescript
// services/api.ts
const API_BASE = 'https://api.example.com';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API 에러: ${res.status}`);
  return res.json();
}
```

### Zustand 스토어 패턴
```typescript
// stores/usePortfolioStore.ts
import { create } from 'zustand';

interface PortfolioState {
  holdings: Holding[];
  addHolding: (holding: Holding) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  addHolding: (holding) => set((state) => ({
    holdings: [...state.holdings, holding],
  })),
}));
```

### 코딩 컨벤션
```typescript
// ✅ 컴포넌트 — 함수형 + TypeScript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  value: number;
}

export default function StockCard({ title, value }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value.toLocaleString()}원</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 12 },
  title: { fontSize: 14, color: '#888' },
  value: { fontSize: 24, fontWeight: 'bold' },
});
```

**필수 규칙:**
- `any` 타입 사용 금지 → 반드시 interface/type 정의
- 인라인 스타일 금지 → `StyleSheet.create()` 사용
- 하드코딩된 문자열 금지 → `constants/`에서 관리
- 컴포넌트 파일 하나에 하나의 export default
- Expo Router 규칙: `app/` 내 파일명 = URL 경로

### 자주 쓰는 패키지
```
zustand                    # 상태관리
nativewind                 # Tailwind CSS for RN
expo-router                # 네비게이션
expo-secure-store          # 민감 데이터 저장
expo-linear-gradient       # 그라데이션
react-native-reanimated    # 애니메이션
react-native-svg           # SVG/차트
victory-native             # 차트 라이브러리
@tanstack/react-query      # 서버 상태 관리
date-fns                   # 날짜 처리
```

### NativeWind 주의사항
- `tailwind.config.js`에 `darkMode: 'class'` 설정 필수 (수동 다크모드 전환 시)
- 다크모드 전환은 `nativewind`의 `useColorScheme` 사용 (`Appearance` API 혼용 금지)
- `LinearGradient` 등 서드파티 네이티브 컴포넌트에는 `className`으로 패딩/마진이 안 먹을 수 있음 → `style` prop 사용

---

## 3. 작업 흐름 (Task Pipeline)

모든 작업은 이 순서를 따른다:

```
[지시 수신] → [에러 로그 확인] → [기존 코드 확인] → [환경 점검] → [구현] → [실행 & 검증] → [결과 보고]
```

**UI 작업일 경우** 파이프라인이 확장된다:

```
[구현] → [QA 서브에이전트 검증] → [수정] → [재검증] → [결과 보고]
         ↑_________실패 시 반복_________↓
```

> QA 서브에이전트 상세 규칙은 **섹션 8** 참조

### 3-1. 에러 로그 확인 (최우선)
- 섹션 9의 에러 학습 로그를 확인하여 이번 작업과 관련된 기존 에러가 있는지 점검
- 해당 에러가 있으면 예방 규칙을 코드에 **선제 적용**

### 3-2. 기존 코드 확인 (재사용 우선)
- 프로젝트 내 유사한 컴포넌트/훅/서비스가 있는지 **반드시** 먼저 확인
- 있으면 수정·확장해서 사용, 없으면 새로 작성

### 3-3. 환경 점검 (실행 전 필수)
- 필요한 패키지가 설치되어 있는지 확인
- 없으면 자동 설치: `npx expo install {package}` 또는 `npm install {package}`

### 3-4. 구현 원칙
- 기존 프로젝트의 코딩 스타일과 패턴을 **반드시 따른다**
- 새 파일 생성 시 프로젝트의 폴더 구조 컨벤션을 준수
- 에러 시 명확한 한글 메시지 출력

### 3-5. 실행 & 검증
- 작성 후 반드시 `npx tsc --noEmit`으로 타입 검증
- 에러 발생 시 → 자동 수정 → 재실행 (최대 3회)
- **에러를 수정했으면 → 섹션 5-2 학습 절차 즉시 실행 (스킵 금지)**
- 3회 실패 시 사용자에게 에러 로그와 함께 보고

---

## 4. 자율 실행 권한

### ✅ 허가 없이 즉시 실행 (Auto-Approve)
| 행동 | 범위 |
|------|------|
| 파일 생성/수정 | 컴포넌트, 스크린, 서비스, 스토어, 훅, 상수 |
| 에러 로그 기록 | `CLAUDE.md` 섹션 9에 한정 |
| 패키지 설치 | `npm install` / `yarn add` / `npx expo install` |
| 테스트 실행 | 빌드, 린트, 타입체크, QA 스크립트 |
| 에러 자동 수정 | 타입 에러, import 누락, 빌드 실패 |

### ❌ 반드시 확인 후 실행
| 행동 | 이유 |
|------|------|
| 외부 API에 **쓰기** 요청 | 과금/데이터 변경 위험 |
| `package.json` 의존성 대규모 변경 | 빌드 안정성 |
| 기존 컴포넌트 삭제 | 다른 화면에 영향 |
| 네비게이션 구조 변경 | 앱 전체 흐름 영향 |
| EAS Build / 스토어 배포 | 비용 발생 |
| `app.json` / `eas.json` 수정 | 앱 설정 전체 영향 |

---

## 5. 에러 자동 복구 & 학습 (Self-Healing + Learning)

에러 발생 시 다음 순서로 자동 대응:

```
[에러 감지] → [유형 분류] → [섹션 9 확인] → [자동 수정] → [재실행] → [필수: 학습 기록 절차] → [보고]
```

### 5-1. 즉시 대응 테이블

| 에러 유형 | 자동 대응 |
|-----------|-----------|
| TypeScript 타입 에러 | 타입 정의 수정, 누락된 interface 추가 |
| Metro bundler 에러 | 캐시 삭제 `npx expo start -c` 후 재실행 |
| `Module not found` | `npm install {module}` 후 재실행 |
| Expo SDK 호환성 에러 | `npx expo install {package}` (호환 버전 자동 설치) |
| Android 빌드 실패 | Gradle 캐시 삭제, `gradlew clean` 후 재빌드 |
| iOS 빌드 실패 | `pod install` 재실행, DerivedData 삭제 |
| 화면 렌더링 에러 | 콘솔 로그 확인 → 컴포넌트 props/state 점검 |
| 네비게이션 에러 | Expo Router 파일 경로 및 `_layout.tsx` 확인 |
| HTTP 404 | API 엔드포인트/리소스 ID 확인 |
| HTTP 401/403 | 인증 토큰/API 키 확인 안내 |
| HTTP 429 | 30초 대기 후 재시도 (최대 3회) |
| JSON 파싱 실패 | 응답 원문 `.tmp/`에 저장 후 보고 |

### 5-2. 에러 자동 학습 (필수 절차 — 스킵 금지)

**에러를 수정할 때마다 아래 4단계를 반드시 실행한다. 선택이 아니라 의무다.**

#### STEP 1: 분류
에러 수정 직후, 다음 질문에 스스로 답한다:
```
이 에러가 다른 작업에서도 반복될 수 있는가?  → YES / NO
```
- 오타, 변수명 실수, 단순 복붙 누락 → **NO** → 여기서 종료
- 라이브러리 동작 방식 오해, API 제한, 플랫폼 차이, 설정 누락 → **YES** → STEP 2로

#### STEP 2: 중복 확인
섹션 9의 기존 에러 로그를 검색한다:
- **동일 원인이 이미 있으면** → 해당 항목의 날짜에 오늘 날짜를 추가하고 종료
- **새로운 패턴이면** → STEP 3으로

#### STEP 3: 기록
섹션 9 맨 아래에 다음 형식으로 **즉시** 추가한다:
```markdown
### ERR-{번호}: {에러 한 줄 요약}
- **날짜:** YYYY-MM-DD
- **상황:** 어떤 작업 중 발생했는지
- **원인:** 왜 발생했는지 (근본 원인)
- **해결:** 어떻게 고쳤는지 (코드 스니펫 포함)
- **예방:** 앞으로 어떻게 피할 것인지 (규칙화)
```

#### STEP 4: 승격 판단
같은 에러가 **3회 이상** 기록되었거나, 모든 개발에 공통 적용되는 규칙이면:
- 섹션 2(기술 스택) 또는 섹션 7(금지 사항)에 **코딩 컨벤션으로 승격**
- 승격 후 에러 로그 항목에 `→ 섹션 X에 승격됨` 표시

**관리 규칙:**
- 로그가 20개를 초과하면 가장 오래되고 범용성 낮은 항목부터 삭제
- 기록은 에러 수정 직후 같은 턴에서 수행 (다음 턴으로 미루지 않는다)

**코드 작성 전:** 반드시 섹션 9의 에러 학습 로그를 읽고, 동일 패턴을 사전에 회피한다.

---

## 6. 출력 & 보고 형식

### 작업 완료 시
```
✅ 완료: {작업 설명}
📁 생성/수정된 파일: {파일 경로}
📊 처리 결과: {요약}
⚠️ 주의사항: {있을 경우}
```

### 에러 보고 시
```
❌ 실패: {작업 설명}
🔍 원인: {에러 메시지 요약}
🛠️ 시도한 조치: {자동 복구 시도 내역}
💡 다음 단계: {사용자가 해야 할 일}
```

---

## 7. 금지 사항

- 사용자 확인 없이 외부 API에 **대량 쓰기 금지** (10건 이상)
- `rm -rf` 등 위험한 삭제 명령 **사용 금지**
- 이미 동작하는 코드를 근거 없이 **전면 재작성 금지**
- 작업 도중 불필요한 질문으로 **흐름을 끊지 말 것**
- `any` 타입 **사용 금지** → 반드시 interface/type 정의
- 인라인 스타일 **사용 금지** → `StyleSheet.create()` 사용
- EAS Build / 스토어 배포를 **사용자 확인 없이 실행 금지**
- `app.json` / `eas.json`을 **사용자 확인 없이 수정 금지**

---

## 8. QA 서브에이전트

> **UI가 있는 화면을 개발할 때 자동 활성화된다.**
> 개발 에이전트가 코드를 작성하면, QA 서브에이전트 역할로 전환하여 직접 빌드·실행·검증한다.
> 대상: Android, iOS 순서로 우선한다.

### 8-1. QA 실행 시점

| 시점 | 트리거 조건 |
|------|------------|
| **컴포넌트 완성** | 새 화면, 모달, 바텀시트 등 UI 단위 하나가 완성될 때 |
| **기능 연결** | 버튼 탭 → 화면 전환, 폼 → 서버 전송 등 인터랙션 연결 시 |
| **스타일 변경** | 레이아웃, 다크모드, 폰트, 여백 등 시각적 변경 후 |
| **최종 빌드** | 전체 앱 완성 후 통합 QA |

### 8-2. 빌드 & 실행

#### 🤖 Android

```bash
# Expo 개발 빌드
npx expo run:android

# 에뮬레이터 직접 제어
emulator -list-avds
emulator -avd {AVD_NAME} -no-window -no-audio &
adb wait-for-device

# APK 직접 빌드 & 설치
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n {패키지명}/{액티비티명}
```

#### 🍎 iOS

```bash
# Expo 개발 빌드
npx expo run:ios

# 시뮬레이터 직접 제어
xcrun simctl list devices available
xcrun simctl boot "iPhone 15 Pro"

# Xcode 빌드
xcodebuild -workspace ios/App.xcworkspace -scheme App \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  -derivedDataPath .tmp/build build
xcrun simctl install booted .tmp/build/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch booted {번들ID}
```

### 8-3. QA 검증 체크리스트

#### 🔧 A단계: 빌드 & 실행 검증
```
□ npx tsc --noEmit 타입 에러 없음
□ Metro 번들링 에러 없음
□ 앱이 크래시 없이 정상 기동
□ 콘솔에 치명적 에러/경고 없음
```

```bash
# 타입 체크
npx tsc --noEmit

# Android 로그 수집
adb logcat --pid=$(adb shell pidof -s {패키지명}) -d > .tmp/qa_android.log
adb logcat *:E --pid=$(adb shell pidof -s {패키지명}) -d

# iOS 시뮬레이터 로그
xcrun simctl spawn booted log show --predicate 'subsystem == "{번들ID}"' --last 2m > .tmp/qa_ios.log
```

#### 🖱️ B단계: 기능 검증 (탭·인터랙션)
```
□ 모든 버튼/탭 영역을 탭했을 때 의도한 동작을 하는가
□ 입력 필드에 텍스트 입력 → 제출이 정상 작동하는가
□ 빈 입력, 잘못된 입력 시 에러 처리가 되는가
□ 뒤로가기(Android 백버튼 / iOS 스와이프백)가 정상인가
□ 로딩 상태, 성공/실패 피드백이 표시되는가
□ Expo Router 화면 전환이 정상인가
□ 키보드가 올라왔을 때 입력 필드가 가려지지 않는가
□ Pull-to-refresh가 정상 작동하는가 (해당 시)
□ Zustand 상태가 화면 간 올바르게 공유되는가
```

```bash
# Android — 스크린샷 캡처 & UI 구조 분석
adb shell screencap -p /sdcard/qa_screen.png && adb pull /sdcard/qa_screen.png .tmp/
adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml .tmp/
# ui.xml에서 clickable="true" 요소의 text, bounds, enabled 속성을 분석하여 검증
adb shell input keyevent KEYCODE_BACK   # 백버튼 동작만 테스트

# iOS — 스크린샷 캡처 & 딥링크 검증
xcrun simctl io booted screenshot .tmp/qa_ios_screen.png
xcrun simctl openurl booted "myapp://screen/settings"   # 딥링크로 화면 전환 검증
xcrun simctl io booted screenshot .tmp/qa_ios_after.png  # 전환 후 스크린샷 비교
```

> ⚠️ 좌표 기반 탭(`adb shell input tap x y`)은 기기/해상도마다 달라 신뢰할 수 없다.
> 기능 검증은 **스크린샷 캡처 → UI 트리 분석 → 딥링크 전환** 조합으로 수행한다.

#### 🎨 C단계: UI/디자인 검증
```
□ 텍스트가 잘리거나(overflow) 겹치지 않는가
□ 한글/이모지/특수문자가 깨지지 않는가
□ 숫자 포맷이 올바른가 (천 단위 쉼표, 소수점, 원/달러 기호)
□ 터치 대상이 최소 44x44pt(iOS) / 48x48dp(Android) 이상인가
□ 색상 대비가 충분한가 (텍스트 가독성)
□ 여백·정렬이 일관적인가
□ 다크모드 전환 시 깨지는 UI가 없는가
□ SafeArea(노치/Dynamic Island/홈인디케이터)와 겹치지 않는가
□ 차트/그래프가 데이터에 맞게 정상 렌더링되는가
□ 빈 상태(Empty State) 화면이 적절한가
```

```bash
# 다크모드 전환
adb shell cmd uimode night yes
adb shell screencap -p /sdcard/qa_dark.png && adb pull /sdcard/qa_dark.png .tmp/
adb shell cmd uimode night no

xcrun simctl ui booted appearance dark
xcrun simctl io booted screenshot .tmp/qa_ios_dark.png
xcrun simctl ui booted appearance light
```

#### 📱 D단계: 화면 크기 호환성

**Android:**
```bash
adb shell wm size 1080x1920    # FHD 일반 폰
adb shell screencap -p /sdcard/qa_fhd.png && adb pull /sdcard/qa_fhd.png .tmp/
adb shell wm size 1440x3200    # QHD+ 대형 폰
adb shell screencap -p /sdcard/qa_qhd.png && adb pull /sdcard/qa_qhd.png .tmp/
adb shell wm size reset
```

**iOS — 필수 테스트 기기:**
```
- iPhone SE (3rd)    → 소형 375x667
- iPhone 15 Pro      → 표준 393x852, Dynamic Island
- iPhone 15 Pro Max  → 대형 430x932
- iPad Pro 11"       → 태블릿 (해당 시)
```

```bash
for device in "iPhone SE (3rd generation)" "iPhone 15 Pro" "iPhone 15 Pro Max"; do
  xcrun simctl boot "$device" 2>/dev/null
  xcrun simctl install "$device" {앱경로}
  xcrun simctl launch "$device" {번들ID}
  sleep 3
  xcrun simctl io "$device" screenshot ".tmp/qa_${device// /_}.png"
  xcrun simctl shutdown "$device"
done
```

#### 🌐 E단계: 플랫폼 고유 검증

**Android 전용:**
```
□ 백버튼으로 앱이 비정상 종료되지 않는가
□ 화면 회전 시 Zustand 상태가 유지되는가
□ 권한 요청 다이얼로그가 정상 표시되는가
```

```bash
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1   # 가로
adb shell screencap -p /sdcard/qa_land.png && adb pull /sdcard/qa_land.png .tmp/
adb shell settings put system user_rotation 0   # 세로 복원
```

**iOS 전용:**
```
□ SafeArea 밖에 콘텐츠가 그려지지 않는가
□ Dynamic Island / 노치 영역에 UI가 가려지지 않는가
□ 스와이프 제스처(뒤로가기, 홈)와 충돌하지 않는가
□ 접근성 폰트 크기 변경 시 레이아웃이 깨지지 않는가
```

```bash
xcrun simctl status_bar booted override --time "9:41" --batteryLevel 100
xcrun simctl spawn booted defaults write com.apple.Accessibility \
  PreferredContentSizeCategoryName UICTContentSizeCategoryAccessibilityExtraLarge
```

### 8-4. QA 결과 처리

```
[QA 실행]
  ├─ 전체 통과 → ✅ 스크린샷 첨부하여 사용자에게 보고
  ├─ 타입 에러 → 🔧 interface/type 수정 후 재빌드
  ├─ 빌드 에러 → 🔧 Metro/Gradle/Xcode 에러 수정 (최대 3회)
  ├─ 크래시/ANR → 🔍 로그 분석 → 원인 코드 수정
  ├─ UI 문제 (잘림, 깨짐, SafeArea) → 🎨 스타일/레이아웃 수정
  ├─ 기능 미작동 (탭, 입력, 전환) → 🖱️ 이벤트/네비게이션 로직 수정
  └─ 3회 실패 → ❌ 에러 로그 + 스크린샷과 함께 사용자 보고
```

**자동 수정 후 반드시:**
1. 수정한 내용을 간결히 설명
2. 재빌드 → 재테스트로 수정 확인
3. **섹션 5-2 학습 절차 즉시 실행 (분류 → 중복확인 → 기록 → 승격 판단)**

### 8-5. QA 보고 형식

```
📱 QA 리포트: {앱명} — {플랫폼}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 빌드: ✅ 성공 / ❌ 실패 ({에러 요약})
📝 타입: ✅ tsc 통과 / ❌ {N}개 에러
🖱️ 기능: ✅ {N}개 정상 / ⚠️ {N}개 이상
🎨 UI:   ✅ 정상 / ⚠️ {문제 요약}
📱 호환: ✅ {테스트한 기기 목록}

스크린샷: .tmp/qa_*.png
로그: .tmp/qa_*.log

{이상 항목 상세 + 수정 조치 내역}
```

---

## 9. 에러 학습 로그 (Error Learning Log)

> **이 섹션은 에이전트가 자동으로 관리한다. 수동 개입 불필요.**
> 에러를 수정할 때마다 섹션 5-2 절차(분류→중복확인→기록→승격)가 자동 실행되어 여기에 추가된다.
> 코드 작성 전 반드시 이 로그를 읽고, 동일 실수를 사전에 회피한다.

<!-- 아래에 에러 항목이 자동으로 추가됩니다 -->

### ERR-001: NativeWind darkMode: 'class' 미설정 시 setColorScheme 무효
- **날짜:** 2026-04-12
- **상황:** 다크모드 토글 구현 중 `setColorScheme('dark')` 호출해도 UI가 변하지 않음
- **원인:** `tailwind.config.js`에 `darkMode: 'class'`가 설정되지 않으면 NativeWind가 시스템 테마만 따르고 수동 전환을 무시함
- **해결:**
  ```js
  // tailwind.config.js
  module.exports = {
    darkMode: 'class',  // 반드시 'class'로 설정
    // ...
  };
  ```
- **예방:** 다크모드 관련 작업 시 `tailwind.config.js`에 `darkMode: 'class'` 설정 여부를 항상 먼저 확인

### ERR-002: expo-linear-gradient의 className 패딩 미적용
- **날짜:** 2026-04-12
- **상황:** `LinearGradient`에 NativeWind `className="p-4"`를 적용했으나 패딩이 무시됨
- **원인:** `expo-linear-gradient`의 `LinearGradient`는 NativeWind의 `className` prop으로 패딩/마진 등 레이아웃 속성이 적용되지 않는 경우가 있음
- **해결:**
  ```tsx
  // ❌ className 패딩 무시됨
  <LinearGradient className="p-4" colors={['#000', '#111']}>

  // ✅ style prop으로 직접 지정
  <LinearGradient style={{ padding: 16 }} colors={['#000', '#111']}>
  ```
- **예방:** `LinearGradient` 등 서드파티 네이티브 컴포넌트에는 레이아웃 속성을 `style` prop으로 직접 전달. `className`은 색상/opacity 등 비레이아웃 속성에만 시도

### ERR-003: Appearance.setColorScheme이 iOS에서 무효
- **날짜:** 2026-04-12
- **상황:** React Native 기본 `Appearance.setColorScheme('dark')`으로 다크모드 전환 시도, iOS에서 작동하지 않음
- **원인:** `Appearance.setColorScheme`은 React Native 내장 API이지만 NativeWind 환경에서는 NativeWind 자체 API(`useColorScheme().setColorScheme`)를 사용해야 className 기반 다크 스타일이 실제로 적용됨
- **해결:**
  ```tsx
  // ❌ iOS에서 NativeWind 다크모드와 연동되지 않음
  import { Appearance } from 'react-native';
  Appearance.setColorScheme('dark');

  // ✅ NativeWind 전용 API 사용
  import { useColorScheme } from 'nativewind';
  const { setColorScheme } = useColorScheme();
  setColorScheme('dark');
  ```
- **예방:** NativeWind 프로젝트에서 다크모드 전환은 항상 `nativewind`의 `useColorScheme`을 사용. RN 내장 `Appearance` API와 혼용 금지
