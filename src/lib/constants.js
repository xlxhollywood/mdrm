export const WIDGET_CATEGORIES = {
  system: {
    label: '시스템',
    widgets: [
      {
        id: 'sys-status',
        name: '시스템 상태',
        desc: '정상·경고·오프라인 현황 요약',
        icon: '📊',
        viewTypes: [
          { id: 'simple',  label: '심플형',    icon: '▦' },
          { id: 'donut',   label: '도넛 차트', icon: '◎' },
          { id: 'bar',     label: '막대 차트', icon: '▬' },
        ],
        hasPeriod: false,
        hasSystemSelect: true,
      },
      {
        id: 'sys-type',
        name: '시스템 유형',
        desc: '유형별 자원 분포 현황',
        icon: '🗂',
        viewTypes: [
          { id: 'simple',  label: '심플형',    icon: '▦' },
          { id: 'donut',   label: '도넛 차트', icon: '◎' },
          { id: 'bar',     label: '막대 차트', icon: '▬' },
        ],
        hasPeriod: false,
        hasSystemSelect: true,
      },
      {
        id: 'sys-history',
        name: '시스템 변경 이력',
        desc: '시스템 변경 내역 이력 조회',
        icon: '📋',
        viewTypes: [
          { id: 'simple', label: '심플형',  icon: '▦' },
          { id: 'table',  label: '테이블형', icon: '☰' },
        ],
        hasPeriod: false,
        hasSystemSelect: true,
      },
    ],
  },
  workflow: {
    label: '워크플로우',
    widgets: [
      {
        id: 'wf-process',
        name: '워크플로우 절차',
        desc: '단계별 절차 흐름 조회',
        icon: '↔',
        viewTypes: [
          { id: 'table',     label: '테이블형',   icon: '☰' },
          { id: 'flowchart', label: '플로우차트', icon: '⟶' },
        ],
        hasPeriod: true,
      },
      {
        id: 'wf-result',
        name: '워크플로우 실행 결과',
        desc: '워크플로우 실행 결과 현황',
        icon: '✓',
        viewTypes: [
          { id: 'simple',    label: '심플형',     icon: '▦' },
          { id: 'table',     label: '테이블형',   icon: '☰' },
          { id: 'flowchart', label: '플로우차트', icon: '⟶' },
        ],
        hasPeriod: true,
      },
      {
        id: 'wf-history',
        name: '워크플로우 실행 이력',
        desc: '기간별 실행 이력 조회',
        icon: '🕐',
        viewTypes: [],
        hasPeriod: true,
      },
    ],
  },
  weekly: {
    label: '주간 점검',
    widgets: [
      {
        id: 'insp-sys-list',
        name: '점검 시스템 목록',
        desc: '이번 주 점검 대상 시스템 현황',
        icon: '🖥',
        viewTypes: [],
        hasPeriod: true,
        hasSystemSelect: true,
      },
      {
        id: 'insp-weekly-list',
        name: '주간 점검 목록',
        desc: '주간 점검 항목 및 결과 목록',
        icon: '📋',
        viewTypes: [],
        hasPeriod: true,
        hasSummaryToggle: true,
      },
      {
        id: 'insp-burndown',
        name: '번다운 차트',
        desc: '주간 점검 진행·잔여·실패 현황',
        icon: '📉',
        viewTypes: [],
        hasPeriod: true,
      },
      {
        id: 'insp-result-chart',
        name: '점검 결과 차트',
        desc: '성공·경고·실패 비율 차트',
        icon: '🥧',
        viewTypes: [
          { id: 'donut', label: '도넛 차트', icon: '◎' },
          { id: 'pie',   label: '파이 차트', icon: '◕' },
        ],
        hasPeriod: true,
      },
      {
        id: 'insp-priority',
        name: '점검 우선순위',
        desc: '우선순위별 점검 항목 목록',
        icon: '🚨',
        viewTypes: [],
        hasPeriod: false,
      },
    ],
  },
  inspection: {
    label: '점검 작업',
    widgets: [
      {
        id: 'insp-summary',
        name: '점검 결과 요약',
        desc: '준수율 및 정상/비정상/실패 현황',
        icon: '📊',
        viewTypes: [],
        hasPeriod: true,
        hasSystemSelect: true,
      },
      {
        id: 'insp-result',
        name: '점검 결과',
        desc: '점검 항목별 결과 조회',
        icon: '📝',
        viewTypes: [],
        hasPeriod: true,
        hasSystemSelect: true,
      },
      {
        id: 'insp-schedule',
        name: '점검 작업 스케줄',
        desc: '점검 작업 일정 및 스케줄',
        icon: '📅',
        viewTypes: [],
        hasPeriod: true,
      },
    ],
  },
};

export const WEEKLY_INSPECTION_TEMPLATE_ID = 'weekly-inspection-report';

export const TODAY      = new Date().toISOString().split('T')[0];
export const MONTH_AGO  = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
export const QUICK_PERIODS = ['오늘', '1주', '1개월', '3개월', '6개월'];
