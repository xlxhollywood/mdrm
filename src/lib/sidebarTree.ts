/* ── 사이드바 트리 데이터 (단일 소스) ── */
/* 모든 화면(오버뷰/뷰어/생성)에서 이 데이터를 공유한다. */

export const SIDEBAR_TREE = [
  { id: 'folder-server', label: '서버 점검', icon: 'folder' as const, children: [
    { id: '3', label: 'WAS 서버 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
    { id: '4', label: 'Linux 보안 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-db', label: 'DB 점검', icon: 'folder' as const, children: [
    { id: '2', label: 'DB 정기 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
    { id: '6', label: 'DB 백업 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
  ]},
  { id: 'folder-network', label: '네트워크 점검', icon: 'folder' as const, children: [
    { id: '5', label: '네트워크 장비 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
  ]},
  // 폴더 미소속 리포트
  { id: '8', label: 'DR 훈련 결과 리포트', icon: 'report' as const, status: 'published' as const },
  { id: '9', label: 'IPL 실행 내역 리포트', icon: 'report' as const, status: 'published' as const },
];
