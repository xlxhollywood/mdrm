'use client';

import { useState } from 'react';
import AppHeader from './AppHeader';
import { SIDEBAR_TREE } from '@/lib/sidebarTree';

/* ── 스페이스 ── */
const SPACES = [
  { id: 'space-shared', label: '공유 스페이스', type: 'shared' as const },
  { id: 'space-personal', label: '내 스페이스', type: 'personal' as const },
];

const SPACE_MEMBERS: Record<string, { id: string; name: string; role: string; color: string }[]> = {
  'space-shared': [
    { id: 'u1', name: '김세훈', email: 'sehun.kim@mantech.co.kr', role: '관리자', color: '#0056a4' },
    { id: 'u2', name: '이지은', email: 'jieun.lee@mantech.co.kr', role: '편집자', color: '#7c3aed' },
    { id: 'u3', name: '박민수', email: 'minsu.park@mantech.co.kr', role: '편집자', color: '#0891b2' },
    { id: 'u4', name: '최유진', email: 'yujin.choi@mantech.co.kr', role: '뷰어', color: '#d97706' },
    { id: 'u5', name: '정호석', email: 'hoseok.jung@mantech.co.kr', role: '뷰어', color: '#dc2626' },
  ],
  'space-personal': [
    { id: 'u1', name: '김세훈', email: 'sehun.kim@mantech.co.kr', role: '소유자', color: '#0056a4' },
  ],
};

/* ── 사이드바 트리 (초기 상태) ── */
const INITIAL_TREES: Record<string, any[]> = {
  'space-shared': JSON.parse(JSON.stringify(SIDEBAR_TREE)),
  'space-personal': [
    { id: 'folder-my-draft', label: '작성 중', icon: 'folder' as const, children: [
      { id: '7', label: '방화벽 정책 점검 리포트 (초안)', icon: 'report' as const, status: 'draft' as const },
    ]},
  ],
};

/* ── 점검 ID → 리포트 이름 매핑 ── */
const INSP_TO_REPORT: Record<string, string> = {
  'insp-1': '서버 및 WEB 점검 결과 리포트',
  'insp-2': 'WAS 서버 점검 결과 리포트',
  'insp-3': 'Linux 보안 점검 결과 리포트',
  'insp-4': 'DB 정기 점검 결과 리포트',
  'insp-5': 'DB 백업 점검 결과 리포트',
  'insp-6': '네트워크 장비 점검 결과 리포트',
  'insp-7': '방화벽 정책 점검 결과 리포트',
};

/* ── 리포트 유형 ── */
const REPORT_TYPES = [
  { id: 'tpl-cumulative', name: '점검 누계 리포트', desc: '일정 기간 동안의 점검 결과를 누적 집계하여 전체 현황과 추이를 파악할 수 있는 리포트입니다.' },
  { id: 'tpl-detail', name: '점검 결과 리포트', desc: '점검항목별 결과를 위젯 기반으로 상세 분석하여 비정상 및 실패 원인을 파악할 수 있는 리포트입니다.' },
  { id: 'tpl-system', name: '시스템별 점검 리포트', desc: '특정 시스템에 대해 수행된 모든 점검 결과를 항목별로 모아 한눈에 확인할 수 있는 리포트입니다.' },
  { id: 'tpl-dr', name: 'DR 실행 내역 리포트', desc: '재해복구 훈련의 실행 내역과 절차별 수행 결과를 기록하는 리포트입니다.' },
  { id: 'tpl-ipl', name: 'IPL 실행 내역 리포트', desc: 'IPL 실행 결과와 시스템별 재기동 내역을 정리하는 리포트입니다.' },
  { id: 'tpl-batch', name: '배치 실행 내역 리포트', desc: '배치 작업의 실행 결과와 성공·실패 내역을 시간순으로 정리하는 리포트입니다.' },
];

/* ── 최근 리포트 ── */
const INITIAL_RECENT = [
  { id: '8', title: 'DR 훈련 결과 리포트', inspName: 'DR 재해복구 훈련', date: '2026-04-20', status: 'published' as const },
  { id: '2', title: 'DB 정기 점검 결과 리포트', inspName: 'DB 정기 점검', date: '2026-04-18', status: 'draft' as const },
  { id: '9', title: 'IPL 실행 내역 리포트', inspName: 'IPL 정기 실행', date: '2026-04-14', status: 'published' as const },
  { id: '4', title: 'Linux 보안 점검 결과 리포트', inspName: 'Linux 보안 점검', date: '2026-04-12', status: 'published' as const },
  { id: '5', title: '네트워크 장비 점검 결과 리포트', inspName: '네트워크 장비 점검', date: '2026-04-10', status: 'draft' as const },
  { id: '6', title: 'DB 백업 점검 결과 리포트', inspName: 'DB 백업 점검', date: '2026-04-08', status: 'published' as const },
];

/* ── 리포트 유형 썸네일 ── */
function ReportThumbnail({ type }: { type: string }) {
  if (type === 'tpl-cumulative') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <path d="M10 80 L40 65 L70 55 L100 45 L130 35 L160 25 L170 20 V90 H10 Z" fill="#22c55e" opacity="0.15"/>
      <path d="M10 80 L40 65 L70 55 L100 45 L130 35 L160 25 L170 20" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 85 L40 75 L70 68 L100 60 L130 55 L160 50 L170 48 V90 H10 Z" fill="#f59e0b" opacity="0.15"/>
      <path d="M10 85 L40 75 L70 68 L100 60 L130 55 L160 50 L170 48" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="10" y1="90" x2="170" y2="90" stroke="#d9dfe5" strokeWidth="1"/>
    </svg>
  );
  if (type === 'tpl-detail') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <circle cx="50" cy="50" r="30" stroke="#e2e8f0" strokeWidth="8"/>
      <circle cx="50" cy="50" r="30" stroke="#22c55e" strokeWidth="8" strokeDasharray="141 188" strokeDashoffset="0" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="30" stroke="#f59e0b" strokeWidth="8" strokeDasharray="35 188" strokeDashoffset="-141" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="30" stroke="#ef4444" strokeWidth="8" strokeDasharray="12 188" strokeDashoffset="-176" strokeLinecap="round"/>
      <rect x="100" y="20" width="70" height="5" rx="2" fill="#d9dfe5"/>
      <rect x="100" y="33" width="55" height="5" rx="2" fill="#d9dfe5"/>
      <rect x="100" y="46" width="65" height="5" rx="2" fill="#d9dfe5"/>
      <rect x="100" y="59" width="45" height="5" rx="2" fill="#d9dfe5"/>
      <rect x="100" y="72" width="60" height="5" rx="2" fill="#d9dfe5"/>
    </svg>
  );
  if (type === 'tpl-system') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <rect x="20" y="15" width="60" height="30" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="33" cy="30" r="3" fill="#22c55e"/><rect x="42" y="27" width="30" height="6" rx="1.5" fill="#d9dfe5"/>
      <rect x="20" y="50" width="60" height="30" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="33" cy="65" r="3" fill="#f59e0b"/><rect x="42" y="62" width="30" height="6" rx="1.5" fill="#d9dfe5"/>
      <rect x="100" y="15" width="60" height="30" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="113" cy="30" r="3" fill="#22c55e"/><rect x="122" y="27" width="30" height="6" rx="1.5" fill="#d9dfe5"/>
      <rect x="100" y="50" width="60" height="30" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="113" cy="65" r="3" fill="#ef4444"/><rect x="122" y="62" width="30" height="6" rx="1.5" fill="#d9dfe5"/>
    </svg>
  );
  if (type === 'tpl-dr') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <path d="M90 20 A30 30 0 1 1 60 50" stroke="#0056a4" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <polygon points="55,42 60,52 65,42" fill="#0056a4"/>
      <path d="M90 80 A30 30 0 1 1 120 50" stroke="#0056a4" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <polygon points="125,58 120,48 115,58" fill="#0056a4"/>
      <rect x="30" y="28" width="12" height="12" rx="2" fill="#22c55e" opacity="0.5"/>
      <rect x="138" y="60" width="12" height="12" rx="2" fill="#f59e0b" opacity="0.5"/>
    </svg>
  );
  if (type === 'tpl-ipl') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <rect x="55" y="25" width="70" height="20" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="68" cy="35" r="2.5" fill="#22c55e"/>
      <rect x="55" y="50" width="70" height="20" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="68" cy="60" r="2.5" fill="#22c55e"/>
      <rect x="55" y="75" width="70" height="20" rx="3" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc"/>
      <circle cx="68" cy="85" r="2.5" fill="#f59e0b"/>
      <polyline points="140,55 148,45 156,55" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="148" y1="45" x2="148" y2="65" stroke="#0056a4" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'tpl-batch') return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <line x1="40" y1="15" x2="40" y2="90" stroke="#d9dfe5" strokeWidth="1.5"/>
      <circle cx="40" cy="25" r="5" fill="#22c55e"/>
      <rect x="55" y="20" width="80" height="10" rx="2" fill="#22c55e" opacity="0.2"/>
      <rect x="55" y="20" width="60" height="10" rx="2" fill="#22c55e" opacity="0.5"/>
      <circle cx="40" cy="50" r="5" fill="#22c55e"/>
      <rect x="55" y="45" width="80" height="10" rx="2" fill="#22c55e" opacity="0.2"/>
      <rect x="55" y="45" width="80" height="10" rx="2" fill="#22c55e" opacity="0.5"/>
      <circle cx="40" cy="75" r="5" fill="#ef4444"/>
      <rect x="55" y="70" width="80" height="10" rx="2" fill="#ef4444" opacity="0.2"/>
      <rect x="55" y="70" width="30" height="10" rx="2" fill="#ef4444" opacity="0.5"/>
    </svg>
  );
  return (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
      <rect x="50" y="15" width="80" height="70" rx="4" stroke="#d9dfe5" strokeWidth="1.5" fill="white"/>
      <rect x="60" y="30" width="40" height="4" rx="1" fill="#d9dfe5"/>
      <rect x="60" y="40" width="55" height="4" rx="1" fill="#d9dfe5"/>
      <rect x="60" y="50" width="35" height="4" rx="1" fill="#d9dfe5"/>
      <rect x="60" y="60" width="50" height="4" rx="1" fill="#d9dfe5"/>
    </svg>
  );
}

/* ── 트리 아이콘 ── */
function TreeIcon({ type, status }: { type: string; status?: string }) {
  if (type === 'folder') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
  const color = status === 'published' ? '#0056a4' : '#94a3b8';
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

/* ── 사이드바 트리 노드 ── */
function SidebarNode({ node, depth = 0, selectedId, onSelect }: any) {
  const [open, setOpen] = useState(node.id === 'folder-server');
  const hasChildren = node.children?.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center gap-[6px] py-[6px] cursor-pointer rounded-[4px] transition-colors
          ${isSelected ? 'bg-[#eff6ff] text-[#0056a4]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 16 + 10, paddingRight: 8 }}
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.id); }}
      >
        {hasChildren ? (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : <div className="w-2" />}
        <TreeIcon type={node.icon} status={node.status} />
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : 'text-[#334155]'}`}>
          {node.label}
        </span>
        {hasChildren && <span className="text-[10px] text-[#94a3b8] shrink-0">{node.children.length}</span>}
        {node.status === 'draft' && !hasChildren && <span className="text-[9px] text-[#94a3b8] bg-[#f1f5f9] rounded-[3px] px-1 shrink-0">임시</span>}
      </div>
      {hasChildren && open && node.children.map((child: any) => (
        <SidebarNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

/* ── 상태 표시 (통일: 파란색=발행, 회색=작성중) ── */
function StatusDot({ status }: { status: 'published' | 'draft' }) {
  return status === 'published' ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0056a4]">
      <div className="w-[5px] h-[5px] rounded-full bg-[#0056a4]" />
      발행됨
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#94a3b8]">
      <div className="w-[5px] h-[5px] rounded-full bg-[#cbd5e1]" />
      작성 중
    </span>
  );
}

/* ── 점검 선택 트리 데이터 ── */
const INSP_TREE = [
  {
    id: 'dc1', label: '나이스 데이터센터', icon: 'dc' as const, children: [
      { id: 'task-server', label: '서버 점검', icon: 'folder' as const, children: [
        { id: 'insp-1', label: '서버 및 WEB 점검', icon: 'shield' as const, count: 11 },
        { id: 'insp-2', label: 'WAS 서버 점검', icon: 'shield' as const, count: 5 },
        { id: 'insp-3', label: 'Linux 보안 점검', icon: 'shield' as const, count: 12 },
      ]},
      { id: 'task-db', label: 'DB 점검', icon: 'folder' as const, children: [
        { id: 'insp-4', label: 'DB 정기 점검', icon: 'shield' as const, count: 8 },
        { id: 'insp-5', label: 'DB 백업 점검', icon: 'shield' as const, count: 3 },
      ]},
      { id: 'task-network', label: '네트워크 점검', icon: 'folder' as const, children: [
        { id: 'insp-6', label: '네트워크 장비 점검', icon: 'shield' as const, count: 6 },
        { id: 'insp-7', label: '방화벽 정책 점검', icon: 'shield' as const, count: 4 },
      ]},
    ],
  },
];

function InspIcon({ type }: { type: string }) {
  if (type === 'dc') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
    </svg>
  );
  if (type === 'folder') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

/* ── 점검명 조회 헬퍼 ── */
function getInspName(id: string): string {
  for (const dc of INSP_TREE) {
    for (const task of dc.children || []) {
      for (const insp of task.children || []) {
        if (insp.id === id) return insp.label;
      }
    }
  }
  return '';
}

/* ── 점검별 이력 (더미) ── */
const INSP_HISTORY: Record<string, string[]> = {
  'insp-1': ['2026-04-21 13:31', '2026-04-14 13:30', '2026-04-07 13:31', '2026-03-31 13:30', '2026-03-24 13:31'],
  'insp-2': ['2026-04-21 14:00', '2026-04-14 14:00', '2026-04-07 14:01', '2026-03-31 14:00'],
  'insp-3': ['2026-04-20 09:00', '2026-04-13 09:00', '2026-04-06 09:01'],
  'insp-4': ['2026-04-18 10:00', '2026-04-11 10:00', '2026-04-04 10:00'],
  'insp-5': ['2026-04-18 11:30', '2026-04-11 11:30'],
  'insp-6': ['2026-04-17 15:00', '2026-04-10 15:00', '2026-04-03 15:00'],
  'insp-7': ['2026-04-16 16:00', '2026-04-09 16:00'],
};

/* ── 점검 트리 노드 (모달 1단계 좌측) ── */
function InspPickNode({ node, depth = 0, onSelect, selectedId }: any) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children?.length > 0;
  const isLeaf = !hasChildren;
  const isSelected = isLeaf && node.id === selectedId;

  return (
    <div>
      <div className={`flex items-center gap-[5px] py-[6px] cursor-pointer rounded-[4px] transition-colors ${isSelected ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 18 + 12, paddingRight: 8 }}
        onClick={() => { if (hasChildren) setOpen(!open); else onSelect(node.id); }}>
        {hasChildren && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <InspIcon type={node.icon} />
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : hasChildren ? 'font-medium text-[#334155]' : 'text-[#334155]'}`}>{node.label}</span>
        {node.count != null && <span className="text-[10px] font-semibold text-[#0056a4] bg-[#dbeafe] rounded-[4px] px-[5px] py-[1px] shrink-0">{node.count}</span>}
      </div>
      {hasChildren && open && node.children.map((child: any) => (
        <InspPickNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}

type InspEntry = { id: string; inspId: string; inspName: string; date: string; scope: { normal: boolean; abnormal: boolean; fail: boolean } };

/* ── 위자드 모달 ── */
function InspSelectModal({ typeName, onClose, onConfirm }: { typeName: string; onClose: () => void; onConfirm: (entries: InspEntry[], reportName: string) => void }) {
  const [step, setStep] = useState(1);
  const [entries, setEntries] = useState<InspEntry[]>([]);
  const [reportName, setReportName] = useState('');
  const [created, setCreated] = useState(false);

  const [selectedInspId, setSelectedInspId] = useState<string | null>(null);
  const selectedInspName = selectedInspId ? getInspName(selectedInspId) : '';
  const selectedHistory = selectedInspId ? (INSP_HISTORY[selectedInspId] || []) : [];

  const handleAddEntry = (date: string) => {
    if (!selectedInspId) return;
    setEntries(prev => [...prev, { id: `${selectedInspId}-${date}`, inspId: selectedInspId, inspName: selectedInspName, date, scope: { normal: false, abnormal: true, fail: true } }]);
  };

  const addedKeys = new Set(entries.map(e => e.id));

  const handleRemoveEntry = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  // 기본 이름
  const uniqueNames = [...new Set(entries.map(e => e.inspName))];
  const defaultName = uniqueNames.length === 0 ? ''
    : uniqueNames.length === 1 ? `${uniqueNames[0]} 결과 리포트`
    : `${uniqueNames[0]} 외 ${uniqueNames.length - 1}건 결과 리포트`;
  const displayName = reportName || defaultName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] w-[640px] flex flex-col" style={{ height: 600 }} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-[#e2e8f0] shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-[#1a222b]">{typeName}</div>
              {!created && <div className="text-[11px] text-[#94a3b8] mt-0.5">
                {step === 1 && '점검과 시점을 선택하여 추가하세요'}
                {step === 2 && '리포트에 포함할 항목을 선택하세요'}
                {step === 3 && '리포트 이름을 확인하세요'}
              </div>}
            </div>
            <button onClick={onClose} className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#64748b] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {/* 스텝 인디케이터 */}
          {!created && <div className="flex items-center gap-2 mt-3">
            {['점검 선택', '스코프', '확인'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-[#e2e8f0]" />}
                <div className={`flex items-center gap-1.5 ${step === i + 1 ? 'text-[#0056a4]' : step > i + 1 ? 'text-[#22c55e]' : 'text-[#cbd5e1]'}`}>
                  <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-bold ${step === i + 1 ? 'bg-[#0056a4] text-white' : step > i + 1 ? 'bg-[#dcfce7] text-[#22c55e]' : 'bg-[#f1f5f9] text-[#cbd5e1]'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-[11px] font-medium">{label}</span>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* ── 1단계: 점검 + 시점 선택 ── */}
        {!created && step === 1 && (
          <>
            <div className="flex-1 flex overflow-hidden">
              {/* 좌측: 점검 트리 */}
              <div className="w-[260px] border-r border-[#e2e8f0] overflow-y-auto px-3 py-3 shrink-0">
                <div className="border border-[#e2e8f0] rounded-[8px] bg-[#fafbfc] p-1">
                  {INSP_TREE.map(node => (
                    <InspPickNode key={node.id} node={node} onSelect={setSelectedInspId} selectedId={selectedInspId} />
                  ))}
                </div>
              </div>
              {/* 우측: 이력 목록 */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {selectedInspId ? (
                  <>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span className="text-[13px] font-semibold text-[#1a222b]">{selectedInspName}</span>
                    </div>
                    <div className="text-[10px] text-[#94a3b8] mb-3">시점을 선택하면 리포트에 추가됩니다</div>
                    <div className="flex flex-col gap-1">
                      {selectedHistory.map(date => {
                        const key = `${selectedInspId}-${date}`;
                        const added = addedKeys.has(key);
                        return (
                          <div key={date} onClick={() => added ? handleRemoveEntry(key) : handleAddEntry(date)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] cursor-pointer hover:bg-[#f8fafc] transition-colors">
                            <div className={`w-[15px] h-[15px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${added ? 'bg-[#0056a4] border-[#0056a4]' : 'border-[#cbd5e1] bg-white'}`}>
                              {added && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span className="text-[12px] text-[#334155]">{date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#cbd5e1]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span className="text-[12px] mt-2">좌측에서 점검을 선택하세요</span>
                  </div>
                )}
              </div>
            </div>

            {/* 추가된 항목 리스트 */}
            <div className="shrink-0 border-t border-[#e2e8f0]">
              <div className="px-5 py-3 h-[120px] overflow-y-auto">
                {entries.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {entries.map(e => (
                      <div key={e.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          <span className="text-[11px] font-medium text-[#334155]">{e.inspName}</span>
                          <span className="text-[10px] text-[#94a3b8]">{e.date}</span>
                        </div>
                        <button onClick={() => handleRemoveEntry(e.id)} className="text-[#cbd5e1] hover:text-[#ef4444] transition-colors">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#cbd5e1]">점검을 선택하고 시점을 추가하세요</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── 2단계: 점검별 스코프 선택 ── */}
        {!created && step === 2 && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="text-[10px] text-[#94a3b8] mb-3">점검 결과 요약과 항목별 준수율은 기본 포함됩니다</div>

            {/* 프리셋 */}
            <div className="flex gap-1.5 mb-4">
              {[
                { label: '전체', scope: { normal: true, abnormal: true, fail: true } },
                { label: '비정상 + 실패', scope: { normal: false, abnormal: true, fail: true } },
                { label: '비정상만', scope: { normal: false, abnormal: true, fail: false } },
                { label: '실패만', scope: { normal: false, abnormal: false, fail: true } },
              ].map(preset => {
                const isActive = entries.length > 0 && entries.every(e =>
                  e.scope.normal === preset.scope.normal &&
                  e.scope.abnormal === preset.scope.abnormal &&
                  e.scope.fail === preset.scope.fail
                );
                return (
                  <button key={preset.label}
                    onClick={() => setEntries(prev => prev.map(e => ({ ...e, scope: { ...preset.scope } })))}
                    className={`px-2.5 py-[5px] rounded-[5px] border text-[11px] font-medium transition-colors ${isActive ? 'border-[#0056a4] bg-[#eff6ff] text-[#0056a4]' : 'border-[#e2e8f0] text-[#64748b] hover:border-[#0056a4] hover:text-[#0056a4]'}`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
              {entries.map((entry, ei) => (
                <div key={entry.id} className="border border-[#e2e8f0] rounded-[8px] p-3">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span className="text-[12px] font-semibold text-[#1a222b]">{entry.inspName}</span>
                    <span className="text-[10px] text-[#94a3b8]">{entry.date}</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { key: 'normal' as const, label: '정상', color: '#22c55e' },
                      { key: 'abnormal' as const, label: '비정상', color: '#f59e0b' },
                      { key: 'fail' as const, label: '실패', color: '#ef4444' },
                    ].map(item => (
                      <button key={item.key}
                        onClick={() => {
                          const newEntries = [...entries];
                          newEntries[ei] = { ...entry, scope: { ...entry.scope, [item.key]: !entry.scope[item.key] } };
                          setEntries(newEntries);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-[5px] border text-[11px] font-medium transition-colors ${entry.scope[item.key] ? 'border-[#0056a4] bg-[#eff6ff] text-[#0056a4]' : 'border-[#e2e8f0] text-[#94a3b8] hover:border-[#cbd5e1]'}`}>
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: item.color }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3단계: 리포트 이름 + 확인 ── */}
        {!created && step === 3 && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="text-[12px] font-semibold text-[#1a222b] mb-3">리포트 이름</div>
            <input
              type="text"
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              placeholder={defaultName}
              className="w-full text-[12px] border border-[#e2e8f0] rounded-[5px] px-2.5 py-[7px] outline-none focus:border-[#0056a4] text-[#334155] bg-white placeholder:text-[#cbd5e1] mb-4"
            />

            <div className="text-[12px] font-semibold text-[#1a222b] mb-2">구성 요약</div>
            <div className="border border-[#e2e8f0] rounded-[8px] bg-[#fafbfc] p-3">
              <div className="text-[11px] text-[#64748b] mb-2">점검 ({entries.length})</div>
              <div className="flex flex-col gap-2">
                {entries.map(e => (
                  <div key={e.id}>
                    <div className="flex items-center gap-2 text-[11px] mb-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span className="text-[#334155]">{e.inspName}</span>
                      <span className="text-[#94a3b8]">{e.date}</span>
                    </div>
                    <div className="flex gap-1 pl-[18px]">
                      <span className="text-[9px] px-1.5 py-[1px] rounded-[3px] bg-[#dbeafe] text-[#0056a4]">요약</span>
                      <span className="text-[9px] px-1.5 py-[1px] rounded-[3px] bg-[#dbeafe] text-[#0056a4]">준수율</span>
                      {e.scope.normal && <span className="text-[9px] px-1.5 py-[1px] rounded-[3px] bg-[#dcfce7] text-[#16a34a]">정상</span>}
                      {e.scope.abnormal && <span className="text-[9px] px-1.5 py-[1px] rounded-[3px] bg-[#fef9c3] text-[#d97706]">비정상</span>}
                      {e.scope.fail && <span className="text-[9px] px-1.5 py-[1px] rounded-[3px] bg-[#fee2e2] text-[#ef4444]">실패</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 완료 화면 */}
        {created && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-[48px] h-[48px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="text-[14px] font-semibold text-[#1a222b] mb-1">리포트가 생성되었습니다</div>
            <div className="text-[11px] text-[#94a3b8]">{displayName}</div>
          </div>
        )}

        {/* 하단 버튼 */}
        {!created && (
          <div className="px-5 py-3 border-t border-[#e2e8f0] flex justify-end gap-2 shrink-0">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-[7px] rounded-[5px] text-[12px] font-medium text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                이전
              </button>
            )}
            {step < 3 ? (
              <button
                disabled={step === 1 && entries.length === 0}
                onClick={() => setStep(step + 1)}
                className={`px-4 py-[7px] rounded-[5px] text-[12px] font-medium transition-colors ${(step === 1 && entries.length === 0) ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed' : 'bg-[#0056a4] text-white hover:bg-[#004a8f]'}`}
              >
                다음
              </button>
            ) : (
              <button
                onClick={() => {
                  setCreated(true);
                  setTimeout(() => onConfirm(entries, displayName), 1500);
                }}
                className="px-4 py-[7px] rounded-[5px] text-[12px] font-medium bg-[#0056a4] text-white hover:bg-[#004a8f] transition-colors"
              >
                리포트 생성
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 메인 ── */
interface ReportOverviewProps {
  onOpenReport: (reportId: string, params?: string) => void;
}

/* ── 멤버 설정 모달 ── */
function MemberSettingsModal({ members, onClose }: { members: any[]; onClose: () => void }) {
  const [list, setList] = useState(members);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('뷰어');

  const handleAdd = () => {
    if (!email.trim()) return;
    const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const colors = ['#0891b2', '#7c3aed', '#d97706', '#dc2626', '#0056a4', '#16a34a'];
    setList([...list, { id: `u-${Date.now()}`, name, email: email.trim(), role, color: colors[list.length % colors.length] }]);
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] w-[440px] max-h-[520px] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <div>
            <div className="text-[14px] font-semibold text-[#1a222b]">멤버 관리</div>
            <div className="text-[11px] text-[#94a3b8] mt-0.5">스페이스 멤버를 추가하거나 제거합니다</div>
          </div>
          <button onClick={onClose} className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#64748b] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 멤버 추가 */}
        <div className="px-5 py-3 border-b border-[#e2e8f0]">
          <div className="text-[11px] font-semibold text-[#64748b] mb-2">멤버 추가</div>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="이메일 주소 입력"
              className="flex-1 text-[12px] border border-[#e2e8f0] rounded-[5px] px-2.5 py-[6px] outline-none focus:border-[#0056a4] text-[#334155] bg-white"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="text-[11px] border border-[#e2e8f0] rounded-[5px] px-2 py-[6px] outline-none focus:border-[#0056a4] text-[#334155] bg-white"
            >
              <option value="편집자">편집자</option>
              <option value="뷰어">뷰어</option>
            </select>
            <button
              onClick={handleAdd}
              className="px-3 py-[6px] rounded-[5px] bg-[#0056a4] text-white text-[11px] font-medium hover:bg-[#004a8f] transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        {/* 멤버 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="text-[11px] font-semibold text-[#64748b] mb-2">멤버 ({list.length})</div>
          <div className="flex flex-col gap-1">
            {list.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 px-2 rounded-[5px] hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: m.color }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[12px] text-[#334155] font-medium">{m.name}</div>
                    <div className="text-[10px] text-[#94a3b8]">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-[2px] rounded-[3px] bg-[#f1f5f9] text-[#64748b]">{m.role}</span>
                  {m.role !== '관리자' && m.role !== '소유자' && (
                    <button
                      onClick={() => setList(list.filter(x => x.id !== m.id))}
                      className="w-[22px] h-[22px] rounded-[4px] flex items-center justify-center text-[#cbd5e1] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                      title="멤버 제거"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 */}
        <div className="px-5 py-3 border-t border-[#e2e8f0] flex justify-end">
          <button onClick={onClose} className="px-4 py-[6px] rounded-[5px] bg-[#0056a4] text-white text-[12px] font-medium hover:bg-[#004a8f] transition-colors">
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportOverview({ onOpenReport }: ReportOverviewProps) {
  const [activeSpace, setActiveSpace] = useState('space-shared');
  const [selectedId, setSelectedId] = useState('folder-server');
  const [showMembers, setShowMembers] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [inspModal, setInspModal] = useState<{ typeName: string; typeId: string } | null>(null);
  const [spaceTrees, setSpaceTrees] = useState(INITIAL_TREES);
  const [recentReports, setRecentReports] = useState(INITIAL_RECENT);
  const currentTree = spaceTrees[activeSpace] || [];
  const currentSpace = SPACES.find(s => s.id === activeSpace)!;
  const members = SPACE_MEMBERS[activeSpace] || [];

  return (
    <div className="flex flex-col h-screen text-[13px] text-dark bg-bg">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 좌측 사이드바 ── */}
        <div className="w-[260px] bg-white border-r border-border flex flex-col shrink-0">
          {/* 스페이스 선택 */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-[24px] h-[24px] rounded-[6px] bg-[#0056a4] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {currentSpace.label.charAt(0)}
              </div>
              <select
                value={activeSpace}
                onChange={e => { setActiveSpace(e.target.value); setSelectedId(''); }}
                className="flex-1 text-[12px] font-semibold border-none outline-none text-[#1a222b] bg-transparent cursor-pointer"
              >
                {SPACES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* 검색 */}
          <div className="px-3 pb-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="리포트 검색..." className="w-full text-[11px] border border-[#e2e8f0] rounded-[5px] pl-7 pr-2 py-[5px] outline-none focus:border-[#0056a4] text-[#334155] bg-white" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {currentTree.map(node => (
              <SidebarNode key={node.id} node={node} selectedId={selectedId} onSelect={(id: string) => {
                setSelectedId(id);
                if (!id.startsWith('folder-')) onOpenReport(id);
              }} />
            ))}
            <button className="flex items-center gap-1 text-[11px] text-[#94a3b8] hover:text-[#0056a4] transition-colors mt-1 px-[10px] py-[6px]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              폴더 추가
            </button>
          </div>
        </div>

        {/* ── 메인 영역 ── */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1040px] mx-auto px-8 py-6">

            {/* 스페이스 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-bold text-[#1a222b]">스페이스</h1>
              </div>

            </div>

            {/* 멤버 패널 (토글) */}
            {showMembers && (
              <div className="mb-6 bg-white rounded-[8px] border border-[#e2e8f0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[#64748b]">멤버 ({members.length})</span>
                  <button onClick={() => setShowMemberModal(true)} className="w-[24px] h-[24px] rounded-[5px] flex items-center justify-center text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#64748b] transition-colors" title="멤버 설정">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: m.color }}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-[12px] text-[#334155]">{m.name}</span>
                          <span className="text-[10px] text-[#94a3b8] ml-1.5">{m.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-[2px] rounded-[3px] bg-[#f1f5f9] text-[#64748b]">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 리포트 유형 */}
            <div className="mb-8">
              <h2 className="text-[20px] font-bold text-[#1a222b] mb-4">리포트 유형</h2>
              <div className="grid grid-cols-3 gap-4">
                {REPORT_TYPES.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setInspModal({ typeName: item.name, typeId: item.id })}
                    className="bg-white rounded-[8px] border border-[#e2e8f0] cursor-pointer hover:border-[#0056a4] hover:shadow-[0_4px_16px_rgba(0,86,164,0.08)] transition-all group overflow-hidden"
                  >
                    <div className="h-[140px] bg-[#f8fafc] flex items-center justify-center border-b border-[#e2e8f0]">
                      <ReportThumbnail type={item.id} />
                    </div>
                    <div className="p-4">
                      <div className="text-[13px] font-semibold text-[#0056a4] group-hover:underline mb-1">{item.name}</div>
                      <p className="text-[11px] text-[#5b646f] leading-[1.5]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 리포트 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-bold text-[#1a222b]">최근 리포트</h2>
                <button className="text-[11px] text-[#0056a4] hover:underline">전체 보기</button>
              </div>

              <div className="bg-white rounded-[8px] border border-[#e2e8f0] overflow-hidden">
                <div className="grid grid-cols-[1fr_160px_100px_80px] px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                  <span>리포트명</span>
                  <span>점검명</span>
                  <span>날짜</span>
                  <span>상태</span>
                </div>
                {recentReports.map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenReport(r.id)}
                    className={`grid grid-cols-[1fr_160px_100px_80px] px-4 py-3 cursor-pointer hover:bg-[#fafbff] transition-colors items-center
                      ${i < recentReports.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
                  >
                    <span className="text-[12px] font-medium text-[#1a222b] truncate pr-4">{r.title}</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#5b646f]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {r.inspName}
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">{r.date}</span>
                    <StatusDot status={r.status} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 멤버 설정 모달 */}
      {showMemberModal && (
        <MemberSettingsModal members={members} onClose={() => setShowMemberModal(false)} />
      )}

      {/* 점검 선택 모달 */}
      {inspModal && (
        <InspSelectModal
          typeName={inspModal.typeName}
          onClose={() => setInspModal(null)}
          onConfirm={(entries: InspEntry[], reportName: string) => {
            const reportId = entries.length > 1 ? '10' : '1';
            // 트리에 추가 (폴더 미소속, 최상위)
            setSpaceTrees(prev => {
              const tree = JSON.parse(JSON.stringify(prev));
              tree['space-shared'].push({ id: reportId, label: reportName, icon: 'report', status: 'published' });
              return tree;
            });
            // 최근 리포트에도 추가
            setRecentReports(prev => [
              { id: reportId, title: reportName, inspName: entries.map(e => `${e.inspName} (${e.date})`).join(', '), date: new Date().toISOString().slice(0, 10), status: 'published' as const },
              ...prev,
            ]);
            onOpenReport(reportId);
          }}
        />
      )}
    </div>
  );
}
