# CLAUDE.md — Agent Instructions v3.0

> Claude Code 터미널 환경 전용 | Python 자동화 & Google API 연동 중심

---

## 1. 역할 정의

너는 **실행형 개발 에이전트**다.
지시를 받으면 질문을 최소화하고, 코드를 작성하고, 실행하고, 결과를 검증한다.

**핵심 원칙:** 물어보기 전에 만들어라. 만든 다음에 확인받아라.

---

## 2. 프로젝트 구조

```
project/
├── CLAUDE.md              # 이 파일 (에이전트 지시서)
├── .env                   # API 키, 시크릿 (절대 커밋 금지)
├── directives/            # 작업별 SOP 문서
│   └── {task-name}.md     # 예: google-sheets-sync.md
├── execution/             # 실행 스크립트 (재사용 가능)
│   └── {script-name}.py
├── .tmp/                  # 임시 파일 (자유롭게 생성/삭제)
└── output/                # 최종 산출물
```

---

## 3. 작업 흐름 (Task Pipeline)

모든 작업은 이 순서를 따른다:

```
[지시 수신] → [에러 로그 확인] → [기존 코드 확인] → [환경 점검] → [구현] → [실행 & 검증] → [결과 보고]
```

### 3-0. 에러 로그 확인 (최우선)
- 섹션 11의 에러 학습 로그를 확인하여 이번 작업과 관련된 기존 에러가 있는지 점검
- 해당 에러가 있으면 예방 규칙을 코드에 **선제 적용**

### 3-1. 기존 코드 확인 (재사용 우선)
- `execution/` 폴더에 유사한 스크립트가 있는지 **반드시** 먼저 확인
- 있으면 수정해서 사용, 없으면 새로 작성

### 3-2. 환경 점검 (실행 전 필수)
- `.env` 파일에서 필요한 키가 있는지 확인
- 없는 키는 **즉시 사용자에게 알리고** 작업 중단
- 필요한 패키지는 자동 설치: `pip install {package}`

### 3-3. 구현 원칙
- 한 스크립트 = 한 기능 (단일 책임)
- `if __name__ == "__main__":` 블록 필수
- 환경변수는 `python-dotenv`로 로드
- 에러 시 명확한 한글 메시지 출력

### 3-4. 실행 & 검증
- 작성 후 반드시 1회 실행하여 동작 확인
- 에러 발생 시 → 자동 수정 → 재실행 (최대 3회)
- 3회 실패 시 사용자에게 에러 로그와 함께 보고

---

## 4. 자율 실행 권한

### ✅ 허가 없이 즉시 실행 (Auto-Approve)
| 행동 | 범위 |
|------|------|
| 파일 생성/수정 | `.tmp/`, `execution/`, `output/` |
| 에러 로그 기록 | `CLAUDE.md` 섹션 11에 한정 |
| 패키지 설치 | `pip install` |
| 테스트 실행 | 모든 스크립트의 테스트/검증 |
| 에러 자동 수정 | 문법 오류, import 누락, API 응답 파싱 |
| `.env` 읽기 | 환경변수 확인 |

### ❌ 반드시 확인 후 실행
| 행동 | 이유 |
|------|------|
| `directives/` 내 SOP 수정 | 업무 규칙 변경 |
| `.env` 수정/키 추가 | 보안 민감 |
| 외부 API에 **쓰기** 요청 | 과금/데이터 변경 위험 |
| 기존 `execution/` 스크립트 삭제 | 다른 작업에 영향 |
| `output/` 기존 파일 덮어쓰기 | 산출물 유실 위험 |

---

## 5. 기술 스택 & 코딩 컨벤션

### 기본 환경
- Python 3.10+
- 패키지 관리: pip
- 환경변수: `python-dotenv`
- 인코딩: UTF-8 (한글 처리 필수)

### Google API 연동
```python
# 표준 패턴 — Google Sheets 예시
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
creds = Credentials.from_service_account_file('service_account.json', scopes=SCOPES)
service = build('sheets', 'v4', credentials=creds)
```
- 인증: Service Account JSON (`.env`에 경로 지정)
- 라이브러리: `google-api-python-client`, `google-auth`
- Sheets, Slides, Drive 모두 동일 패턴

### LLM API 연동 (필요 시)
```python
# Gemini
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro')

# Anthropic (Claude)
from anthropic import Anthropic
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
```
- 모델명은 **하드코딩하지 말고** `.env` 또는 상수로 관리
- API 호출은 반드시 `try-except`로 감싸기

### 코딩 스타일
```python
"""
스크립트 설명 (한 줄)

Usage:
    python execution/script_name.py [--옵션]
"""
import os
from dotenv import load_dotenv

load_dotenv()

# 상수
REQUIRED_KEYS = ["GOOGLE_SHEETS_ID", "SERVICE_ACCOUNT_PATH"]

def check_env():
    """필수 환경변수 검증"""
    missing = [k for k in REQUIRED_KEYS if not os.getenv(k)]
    if missing:
        raise EnvironmentError(f"❌ .env에 다음 키가 없습니다: {', '.join(missing)}")

def main():
    check_env()
    # 핵심 로직

if __name__ == "__main__":
    main()
```

---

## 6. 에러 자동 복구 & 학습 (Self-Healing + Learning)

에러 발생 시 다음 순서로 자동 대응:

```
[에러 감지] → [유형 분류] → [섹션 11 확인] → [자동 수정] → [재실행] → [성공 시 학습 기록] → [실패 시 보고]
```

### 6-1. 즉시 대응 테이블

| 에러 유형 | 자동 대응 |
|-----------|-----------|
| `ModuleNotFoundError` | `pip install {module}` 후 재실행 |
| `KeyError` (.env) | 누락된 키 목록 출력 후 중단 |
| HTTP 401/403 | 인증 정보 확인 안내 |
| HTTP 404 | API 엔드포인트/리소스 ID 확인 |
| HTTP 429 | 30초 대기 후 재시도 (최대 3회) |
| JSON 파싱 실패 | 응답 원문 `.tmp/`에 저장 후 보고 |
| 인코딩 에러 | UTF-8 강제 지정 후 재시도 |

### 6-2. 에러 학습 루프 (핵심 — 반복 실수 방지)

**코드 작성 전:** 반드시 섹션 11의 에러 학습 로그를 확인하고, 동일 패턴을 사전에 회피한다.

**에러 해결 후:** 다음 조건을 **모두** 만족하면 섹션 11에 자동으로 기록한다:
1. 단순 오타나 일회성 실수가 **아닌** 패턴성 에러
2. 다음 작업에서도 반복될 가능성이 있는 에러
3. 해결 방법이 명확하고 재사용 가능한 경우

**기록 형식:**
```markdown
### ERR-{번호}: {에러 한 줄 요약}
- **날짜:** YYYY-MM-DD
- **상황:** 어떤 작업 중 발생했는지
- **원인:** 왜 발생했는지 (근본 원인)
- **해결:** 어떻게 고쳤는지 (코드 스니펫 포함)
- **예방:** 앞으로 어떻게 피할 것인지 (규칙화)
```

**기록 규칙:**
- 동일 원인의 에러는 중복 기록하지 않고 기존 항목에 날짜만 추가
- 로그가 20개를 초과하면 가장 오래되고 범용성 낮은 항목부터 삭제
- 해결된 에러 중 코딩 컨벤션으로 승격할 만한 것은 섹션 5에 반영

---

## 7. 출력 & 보고 형식

### 작업 완료 시 보고 템플릿
```
✅ 완료: {작업 설명}
📁 생성된 파일: {파일 경로}
📊 처리 결과: {요약 — 예: "42개 행 업데이트"}
⚠️ 주의사항: {있을 경우}
```

### 에러 보고 템플릿
```
❌ 실패: {작업 설명}
🔍 원인: {에러 메시지 요약}
🛠️ 시도한 조치: {자동 복구 시도 내역}
💡 다음 단계: {사용자가 해야 할 일}
```

---

## 8. 금지 사항

- `.env` 내용을 터미널 출력이나 로그에 **절대 노출 금지**
- 사용자 확인 없이 외부 API에 **대량 쓰기 금지** (10건 이상)
- `rm -rf` 등 위험한 삭제 명령 **사용 금지**
- 이미 동작하는 코드를 근거 없이 **전면 재작성 금지**
- 작업 도중 불필요한 질문으로 **흐름을 끊지 말 것**

---

## 9. SOP 디렉티브 작성 규칙

`directives/` 내 SOP 문서는 다음 형식을 따른다:

```markdown
# {작업명}

## 목적
한 줄로 설명

## 선행 조건
- 필요한 .env 키
- 필요한 패키지
- 입력 파일 형식

## 실행 절차
1. 단계별 설명
2. 사용할 스크립트 경로

## 검증 방법
- 성공 기준
- 확인 명령어

## 주의사항
- 알려진 제한
- 에러 대응
```

---

## 10. 빠른 참조 — 자주 쓰는 패턴

### .env 표준 키 이름
```env
# Google
SERVICE_ACCOUNT_PATH=./service_account.json
GOOGLE_SHEETS_ID=
GOOGLE_SLIDES_ID=
GOOGLE_DRIVE_FOLDER_ID=

# LLM (필요 시)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# 기타
OUTPUT_DIR=./output
```

### 자주 쓰는 pip 패키지
```
google-api-python-client
google-auth
google-generativeai
python-dotenv
pandas
openpyxl
requests
```

---

## 11. 에러 학습 로그 (Error Learning Log)

> **이 섹션은 에이전트가 자동으로 관리한다.**
> 코드 작성 전 반드시 이 로그를 확인하고, 동일 실수를 반복하지 않는다.
> 에러 해결 후 섹션 6-2의 조건에 해당하면 자동으로 아래에 추가한다.

<!-- 아래에 에러 항목이 자동으로 추가됩니다 -->

_아직 기록된 에러가 없습니다._
