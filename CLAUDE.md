# 리포트 문서 편집기 (v2)

블록 기반 문서 에디터로 점검 보고서를 작성·편집하는 웹 애플리케이션.
v2에서는 기존 위젯 시스템을 전면 제거하고, 문서 편집 중심으로 재설계 중.

## 언어 및 프레임워크

- **TypeScript** (.tsx / .ts) — 모든 새 코드는 반드시 TypeScript로 작성
- **Next.js 16** + **React 19** + **Tailwind CSS v4**
- 빌드 시 타입체크는 `ignoreBuildErrors: true`로 점진적 도입 중
- 새 파일 작성 시 props에 타입/인터페이스를 명시할 것

## Figma MCP 연결 확인 (필수)

매 대화 시작 시 반드시 아래 방법으로 Figma MCP 연결 상태를 확인할 것.

1. `mcp__figma-desktop__get_metadata` 툴로 nodeId `104:1104` 조회
2. 캔버스명 "리포트 고도화" 응답이 오면 연결 정상
3. 오류 발생 시 사용자에게 피그마 데스크탑 앱 실행 여부 확인 요청

## Figma

- **File Key**: `cYW8LNIEG5VBh1XHZSn3Y9`
- **Node ID**: `104-1104` (캔버스명: "리포트 고도화")
- **URL**: `https://www.figma.com/design/cYW8LNIEG5VBh1XHZSn3Y9/%EB%A6%AC%ED%8F%AC%ED%8A%B8-%EA%B3%A0%EB%8F%84%ED%99%94--%EC%99%80%EC%9D%B4%EC%96%B4%ED%94%84%EB%A0%88%EC%9E%84?node-id=104-1104`

## 핵심 파일 구조

> **규칙**: 리팩토링으로 파일/디렉토리 구조가 변경된 경우, 반드시 이 섹션을 실제 구조에 맞게 업데이트할 것.

```
src/
  app/
    globals.css                          Tailwind v4 @theme 토큰 정의
    layout.tsx                           Next.js 레이아웃
    page.tsx                             루트 → /report 리다이렉트
    report/
      page.tsx                           /report 오버뷰 (초기 화면)
      create/
        page.tsx                         /report/create 생성 (에디터)
      [id]/
        page.tsx                         /report/:id 조회 (뷰어)
  lib/
    assets.ts                            이미지 import 모음 (로고·아이콘)
    inspReportTemplate.ts                인프라 점검 보고서 템플릿
    inspDetailTemplate.ts                점검결과 상세 리포트 템플릿
    inspDetailWordTemplate.ts            점검결과 상세 리포트 (Word ver) 템플릿
  components/
    WidgetDashboard.tsx                  메인 컨테이너 (상태 관리·좌측 템플릿·캔버스·우측 패널)
    AppHeader.tsx                        상단 헤더
    RightPanel.tsx                       우측 패널 진입점 (문서 설정 / 표 설정)
    canvas/
      WordCanvas.tsx                     블록 기반 문서 캔버스 오케스트레이터
    editor/                              블록 에디터 컴포넌트
      wordConstants.ts                   PAPER_SIZES, MM_TO_PX, BLOCK_FORMATS 등
      useDragBlocks.ts                   블록 드래그 재정렬 커스텀 훅
      text/                              텍스트 블록
        TextBlock.tsx                    일반/heading/bullet/numbered/callout/quote 블록
        TodoListBlock.tsx                할일 목록 블록 (다중 아이템)
      table/                             표 블록
        TableBlock.tsx                   표 블록 (셀 편집, 병합, 리사이즈, 복사/붙여넣기)
        TableSizePicker.tsx              표 크기 선택 UI
      layout/                            열 레이아웃
        WordBlockTypes.tsx               DragHandleIcon, LayoutBlock, TableBlock re-export
        LayoutColumnPicker.tsx           열 레이아웃 선택 UI
      menu/                              메뉴·툴바
        BlockPlusMenu.tsx                블록 + 버튼 팝업 메뉴
        SlashMenu.tsx                    / 명령어 팝업 메뉴
        FloatingToolbar.tsx              텍스트 선택 시 서식 플로팅 툴바
      html/                              HTML 블록
        HtmlBlock.tsx                    HTML 코드 블록
    panel/                               우측 패널 서브 컴포넌트
      shared.tsx                         공용 UI (Section, Toggle 등)
      TablePanel.tsx                     표 옵션 패널
      WordDocPanel.tsx                   문서 설정 패널 (용지·방향·여백·발행)
      DataLoadModal.tsx                  데이터 불러오기 모달
```

## 디자인 토큰 (Figma + Nutanix DS 참고)

- Primary: `#0056a4`, Nav bg: `#2d57ac`, Active menu bg: `#224895`
- Dark text: `#1a222b`, Gray text: `#5b646f`, Border: `#d9dfe5`, BG: `#f5f5f5`
- Success: `#00bc7d` / `#22c55e`, Warning: `#fd9a00` / `#f59e0b`, Danger: `#fb2c36` / `#ef4444`
- Font: Apple SD Gothic Neo

## 로컬 에셋 (public/assets/)

- 로고: `/assets/logo.png`
- 알림 아이콘: `/assets/icon-noti.png`
- 유저 아이콘: `/assets/icon-user.png`
- 설정 아이콘: `/assets/icon-settings.png`
- Datacenter 이미지: `/assets/icon-datacenter-img.png`

## 현재 UI 구조 (v2)

- **헤더**: 로고 영역(245px, #2d57ac) + 네비바(리포트만 활성)
- **Left 패널 (300px)**: 보고서 템플릿 목록 (클릭으로 문서 로드)
- **Center 캔버스**: 블록 기반 문��� 에디터 (서식 툴바, 블록 드래그, 엔터→새 블록)
- **Right 패널 (280px)**:
  - 기본: 문서 설정 (용지·방향·여백) + 발행 버튼
  - 표 포커스 시: 표 설정 (행/열 추가·삭제, 헤더, 데이터 불러오기)

## 점검 데이터 모델

```
데이터센터 (최상위)
  └ 업무 (점검들의 집합: 서버 점검, DB 점검 등)
      └ 점검 (점검항목들의 집합) ← 리포트는 이 단위로 작성
          └ 점검항목 (최소 단위 = 스크립트, 1시스템에 최소 1개 이상)
              └ 시스템 (점검 대상 서버/장비)
```

- **점검** = 점검항목들의 집합
- **점검항목** = 가장 작은 단위(스크립트), 1개의 시스템은 최소 1개의 점검항목을 가짐
- **수행 건수(n건)** = 시스템 수 × 점검항목 수 (예: 32대 × 11항목 = 223건은 실제 수행된 점검 건수)
- **리포트 = 하나의 점검에 대한 보고서**
- 위젯 블록 우측 패널에서 점검을 선택하면 해당 점검의 데이터가 위젯에 반영됨
- v2 위젯 = 텍스트(제목) + 콘텐츠(표 or HTML)를 하나로 묶은 블록

## 리포트 버전 구분

프로덕트에는 **위젯 블록 버전(정형화 리포트)**만 사용. 에디터 버전은 와이어프레임 비교용으로만 존재.

- **위젯 블록 버전** (정형화 리포트)
  - 리포트 유형 선택 → 데이터 바인딩 → 조회/편집은 위젯 설정으로만
  - 템플릿: `inspDetailTemplate.ts`
  - 이 버전을 기준으로 계속 디벨롭

- **에디터 버전** (Word ver) — 디벨롭 종료, 유지만
  - 블록 기반 자유 편집 (커서, 텍스트 수정, 블록 드래그 등)
  - 템플릿: `inspDetailWordTemplate.ts`
  - 용도: 와이어프레임으로서 두 가지 안을 비교하기 위해 존재
  - 추가 개발 없음, 현재 상태 그대로 보존

## 블록 데이터 모델

모든 블록은 `docBlocks` 배열에 저장되며 `WidgetDashboard`가 상태를 소유.

```js
// 일반 텍스트 / 헤딩
{ id: 'text-xxx', type: 'text', subtype: undefined | 'h1'~'h5', html: '...' }

// 글머리 기호 / 번호 목록
{ id: 'text-xxx', type: 'text', subtype: 'bullet' | 'numbered', html: '<li>...</li>' }

// 할일 목록 (다중 아이템)
{ id: 'text-xxx', type: 'text', subtype: 'todo',
  items: [{ id: 'ti-xxx', html: '...', checked: false }] }

// 콜아웃 / 인용
{ id: 'text-xxx', type: 'text', subtype: 'callout' | 'quote', html: '...' }

// 구분선
{ id: 'divider-xxx', type: 'divider' }

// 표
{ id: 'table-xxx', type: 'table', rows: 3, cols: 3, cells: { '0,0': '<html>' } }

// 열 레이아웃
{ id: 'layout-xxx', type: 'layout', cols: 2, colWidths: [50, 50] }

// HTML 코드 블록
{ id: 'html-xxx', type: 'html', code: '<div>...</div>' }
```

## + 메뉴 동작 규칙

- `textSize`, `bullet`, `numbered`, `todo`, `callout`, `quote` → **현재 블록 변환**
- `table`, `divider`, `layout`, `html` → **새 블록 삽입**

## 포커스 관리 패턴

- `pendingFocusRef.current = { id, position: 'start' | 'end' | 'offset', charOffset? }`
- `TodoListBlock` 내부: `pendingItemFocus` ref → `{ itemId, position }`
- `data-text-id` 어트리뷰트로 DOM 노드 조회
- `data-init` 어트리뷰트로 contentEditable 초기화 중복 방지

## 주요 UX 동작 규칙

- **블록 편집**: 엔터 → 새 블록, 쉬프트+엔터 → 줄바꿈, 한글 IME 조합 중 엔터 무시
- **목록 Backspace**: 내용 있는 상태에서 행 시작 Backspace → 목록 마커 제거 (일반 텍스트 변환)
- **Ctrl+A**: 모든 블록 전체 선택, Backspace로 일괄 삭제
- **Ctrl+Z**: 구조적 변경 원복 (블록 추가/삭제/재정렬, 표 행/열 조작)
- **표 셀 Ctrl+Z**: 테이블 구조 변경 원복 (행/열 추가삭제)
- **발행**: 우측 패널 최하단 발행 버튼

## 기능 구현 후 자체 테크리스트

- [ ] 새 블록 생성 후 커서가 올바른 위치에 있는가
- [ ] ��� 블록에서 텍스트 입력이 되는가
- [ ] `/` 슬래시 메뉴가 트리거되는가
- [ ] 기존 블록 흐름(엔터, 백스페이스, 화살표 이동)이 깨지지 않았는가

## 개발 서버

매 대화 시작 시 `http://localhost:3000` 접속이 가능한지 확인하고, 서버가 꺼져 있으면 자동으로 시작할 것.

```bash
lsof -ti:3000 || (cd /Users/sehun/Documents/mantech/mdrm-ui && npm run dev &)
```

- 서버 시작 후 `open http://localhost:3000` 으로 브라우저도 자동으로 열 것

## Git 커밋 컨벤션 (Google Style)

```
<type>: <subject>

<body> (선택)
```

### Type
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 포맷팅, 코드 스타일 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등 기타

### 규칙
- subject와 body는 **반드시 한국어**로만 작성 (영어 혼용 금지)
- 마침표 없음
- 한 줄 72자 이내
- **커밋 단위**: 기능 하나 또는 버그 하나당 커밋 하나
- **자동 커밋**: 사용자가 새 작업을 요청하면 이전 작업 완료로 간주, 자동 커밋
