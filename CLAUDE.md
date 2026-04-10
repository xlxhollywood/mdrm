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

## 핵심 파일

- 메인 컴포넌트: `src/WidgetDashboard.jsx`
- 스타일: `src/WidgetDashboard.css`
- 진입점: `src/App.js` → `<WidgetDashboard />` 렌더링

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

- **헤더**: 로고 영역(245px, #2d57ac) + 네비바(대시보드/시스템/워크플로우/점검작업/리포트, 리포트만 활성)
- **Left 패널 (260px)**: 시스템·워크플로우·점검작업 탭 + 위젯 목록 (드래그 가능)
- **Center 캔버스**: 위젯 드래그&드롭 배치, 3열 그리드
- **Right 패널 (280px)**: 선택 위젯의 표시 형태 + 기간 설정 옵션

## 위젯 목록

- **시스템**: 시스템 상태(심플/도넛/막대), 시스템 유형(심플/도넛/막대), 시스템 변경이력(심플/테이블)
- **워크플로우**: 워크플로우 절차(테이블/플로우차트, 기간), 실행결과(심플/테이블/플로우차트, 기간), 실행이력(기간)
- **점검작업**: 점검결과(기간), 점검작업스케줄(기간)

## 개발 서버

매 대화 시작 시 `http://localhost:3000` 접속이 가능한지 확인하고, 서버가 꺼져 있으면 자동으로 시작할 것.

```bash
# 서버 실행 여부 확인 후 미실행 시 백그라운드로 시작
lsof -ti:3000 || (cd /Users/sehun/Documents/mantech/mdrm-ui && npm start &)
```

- 서버가 이미 실행 중이면 그대로 사용
- 새로 시작한 경우 수 초 후 `http://localhost:3000` 에서 확인 가능
- 서버 시작 후 `open http://localhost:3000` 으로 브라우저도 자동으로 열 것

## Git 커밋 컨벤션 (Google Style)

모든 커밋 메시지는 아래 형식을 따를 것.

```
<type>(<scope>): <subject>

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

### Scope 예시
- `dashboard`, `table`, `panel`, `header`, `widget`, `assets`, `canvas`

### 규칙
- subject는 소문자로 시작, 마침표 없음
- 영어 또는 한국어 혼용 가능
- 한 줄 72자 이내
