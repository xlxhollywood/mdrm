# 리포트 대시보드 위젯 편집 페이지

Figma 파일을 디자인 시스템으로 사용해 리포트 대시보드 편집 페이지를 구현 중.
피그마 와이어프레임 기반으로 실제 웹 UI를 만드는 작업이므로, 항상 Figma 파일을 디자인 레퍼런스로 참조할 것.

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

```
src/
  App.js                                 진입점 → <WidgetDashboard />
  app/globals.css                        Tailwind v4 @theme 토큰 정의
  lib/
    constants.js                         WIDGET_CATEGORIES, 날짜 상수
    assets.js                            이미지 import 모음
  components/
    WidgetDashboard.jsx                  메인 컨테이너 (상태·좌측 패널·모드 전환)
    AppHeader.jsx                        상단 헤더
    RightPanel.jsx                       우측 옵션 패널 (위젯 옵션 / 문서 설정)
    canvas/
      GridCanvas.jsx                     Grid 모드 캔버스 + PlacedCard + 드래그 재정렬
      WordCanvas.jsx                     Word 모드 캔버스 오케스트레이터 (약 390줄)
      WidgetPlaceholder.jsx              시스템 미선택 시 플레이스홀더 (공용)
      word/                              Word 모드 전용 서브 컴포넌트들
        wordConstants.js                 PAPER_SIZES, MM_TO_PX, BLOCK_FORMATS,
                                         PLUS_MENU_ITEMS, HEADING_FORMATS
        TextBlock.jsx                    일반/heading/bullet/numbered/callout/quote 블록
        TodoListBlock.jsx                할일 목록 블록 (다중 아이템, items[] 구조)
        FloatingToolbar.jsx              텍스트 선택 시 뜨는 서식 플로팅 툴바
        BlockPlusMenu.jsx                블록 왼쪽 + 버튼 클릭 시 나오는 팝업 메뉴
        WordBlockTypes.jsx               DragHandleIcon, WidgetBlock, TableBlock
        useDragBlocks.js                 블록 드래그 재정렬 커스텀 훅
    widgets/
      WidgetPreview.jsx                  위젯 ID + viewType → 실제 미리보기 라우팅
      SystemStatusWidgets.jsx            시스템 상태 심플/도넛/막대 컴포넌트
      SystemTypeWidgets.jsx              시스템 유형 심플/도넛/막대 컴포넌트
```

## 디자인 토큰 (Figma에서 추출)

- Primary: `#0056a4`, Nav bg: `#2d57ac`, Active menu bg: `#224895`
- Dark text: `#1a222b`, Gray text: `#5b646f`, Border: `#d9dfe5`, BG: `#f5f5f5`
- Success: `#00bc7d`, Warning: `#fd9a00`, Danger: `#fb2c36`
- Font: Apple SD Gothic Neo

## 로컬 에셋 (public/assets/ — Figma에서 추출해 저장)

- 로고: `/assets/logo.png` (Figma node 104:1395)
- 알림 아이콘: `/assets/icon-noti.png` (104:1411)
- 유저 아이콘: `/assets/icon-user.png` (104:1413)
- 설정 아이콘: `/assets/icon-settings.png` (104:1416)
- 시스템상태 위젯 이미지: `/assets/widget-status.png` (104:1111)
- Datacenter 텍스트: `/assets/widget-datacenter.png` (104:1132)
- 드래그 핸들: `/assets/icon-drag.png` (104:1134)
- 정상 아이콘: `/assets/icon-ok.png` (104:1114)
- 경고 아이콘: `/assets/icon-warn.png` (104:1119)
- 오프라인 아이콘: `/assets/icon-offline.png` (104:1125)

> Figma 디자인이 변경된 경우 위 node ID로 MCP `get_screenshot`을 재호출하고 `public/assets/`에 덮어쓸 것.

## 현재 UI 구조

- **헤더**: 로고 영역(245px, #2d57ac) + 네비바(리포트만 활성)
- **Left 패널 (300px)**: 전체·시스템·워크플로우·점검작업 탭 + 위젯 목록 (클릭으로 추가)
- **Center 캔버스**: Grid / Word 모드 전환
  - Grid: 위젯 배치 + 드래그 재정렬
  - Word: 블록 기반 문서 에디터 (서식 툴바, 블록 드래그 재정렬, 엔터→새 블록)
- **Right 패널 (280px)**:
  - Grid 모드 + 위젯 선택: 시스템 선택 트리 → 표시 형태 → 기간 설정 → 위젯 삭제
  - Word 모드 + 위젯 미선택: 페이지 설정(용지·방향·여백) + 발행 버튼
  - Word 모드 + 위젯 선택: 위젯 옵션 (Grid와 동일)

## Word 블록 데이터 모델

모든 블록은 `docBlocks` 배열에 저장되며 `WidgetDashboard`가 상태를 소유.

```js
// 일반 텍스트 / 헤딩
{ id: 'text-xxx', type: 'text', subtype: undefined | 'h1'~'h5', html: '...' }

// 글머리 기호 / 번호 목록 (단일 블록, <li> 태그로 관리)
{ id: 'text-xxx', type: 'text', subtype: 'bullet' | 'numbered', html: '<li>...</li>' }

// 할일 목록 (단일 블록, 다중 아이템)
{ id: 'text-xxx', type: 'text', subtype: 'todo',
  items: [{ id: 'ti-xxx', html: '...', checked: false }] }

// 콜아웃 / 인용
{ id: 'text-xxx', type: 'text', subtype: 'callout' | 'quote', html: '...' }

// 구분선
{ id: 'divider-xxx', type: 'divider' }

// 표
{ id: 'table-xxx', type: 'table', rows: 3, cols: 3, cells: { '0,0': '<html>' } }

// 위젯
{ id: 'widget-xxx', type: 'widget', widgetId: '...', instanceId: '...' }
```

## + 메뉴 동작 규칙 (handleInsertBlockFromMenu)

- `textSize`, `bullet`, `numbered`, `todo`, `callout`, `quote` → **현재 블록 변환** (새 블록 삽입 안 함)
- `table`, `divider` → **새 블록 삽입** (현재 블록 뒤에)

## Word 포커스 관리 패턴

- `pendingFocusRef.current = { id, position: 'start' | 'end' | 'offset', charOffset? }`
  → 다음 렌더 사이클에서 `useEffect`가 읽어 DOM 포커스 + 커서 세팅
- `TodoListBlock` 내부는 별도 `pendingItemFocus` ref 사용
  → `{ itemId, position: 'start' | 'end' }`
- `data-text-id` 어트리뷰트로 DOM 노드 조회 (`[data-text-id="${id}"]`)
- `data-init` 어트리뷰트로 `contentEditable` innerHTML 초기화 중복 방지

## 주요 UX 동작 규칙

- **위젯 추가**: 좌측 목록 클릭 → 캔버스에 즉시 추가 + 우측 패널 오픈
- **플레이스홀더**: `hasSystemSelect: true` 위젯은 시스템 선택 전 플레이스홀더 표시, 선택 후 실시간 프리뷰
- **Word 블록**: 엔터 → 새 블록, 쉬프트+엔터 → 줄바꿈, 한글 IME 조합 중 엔터 무시
- **Word 목록 Backspace**: 내용 있는 상태에서 행 시작 Backspace → 내용 유지하고 목록 마커만 제거 (일반 텍스트로 변환)
- **Word Ctrl+A**: 모든 블록 전체 선택, 이후 Backspace로 일괄 삭제 가능
- **Word 발행**: 우측 패널 최하단 발행 버튼 (3초 후 복귀)

## 위젯 목록

- **시스템**: 시스템 상태(심플/도넛/막대), 시스템 유형(심플/도넛/막대), 시스템 변경이력(심플/테이블)
- **워크플로우**: 워크플로우 절차(테이블/플로우차트, 기간), 실행결과(심플/테이블/플로우차트, 기간), 실행이력(기간)
- **점검작업**: 점검결과(기간), 점검작업스케줄(기간)

## 개발 서버

매 대화 시작 시 `http://localhost:3000` 접속이 가능한지 확인하고, 서버가 꺼져 있으면 자동으로 시작할 것.

```bash
# 서버 실행 여부 확인 후 미실행 시 백그라운드로 시작
lsof -ti:3000 || (cd /Users/sehun/Documents/mantech/mdrm-ui && npm run dev &)
```

- 서버가 이미 실행 중이면 그대로 사용
- 새로 시작한 경우 수 초 후 `http://localhost:3000` 에서 확인 가능
- 서버 시작 후 `open http://localhost:3000` 으로 브라우저도 자동으로 열 것

## Git 커밋 컨벤션 (Google Style)

모든 커밋 메시지는 아래 형식을 따를 것.

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
- **커밋 단위**: 기능 하나 또는 버그 하나당 커밋 하나. 여러 기능/버그를 하나의 커밋에 묶지 말 것
  - feat과 fix를 같은 커밋에 섞지 말 것
  - 무관한 변경사항을 한 커밋에 합치지 말 것
