'use client';

import { useState } from 'react';
import AppHeader from './AppHeader';

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

/* ── 사이드바 트리 ── */
const SPACE_TREES: Record<string, any[]> = {
  'space-shared': [
    { id: 'folder-server', label: '서버 점검', icon: 'folder' as const, children: [
      { id: '1', label: '서버 및 WEB 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
      { id: '3', label: 'WAS 서버 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
      { id: '4', label: 'Linux 보안 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
    ]},
    { id: 'folder-db', label: 'DB 점검', icon: 'folder' as const, children: [
      { id: '2', label: 'DB 정기 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
      { id: '6', label: 'DB 백업 점검 결과 리포트', icon: 'report' as const, status: 'published' as const },
    ]},
    { id: 'folder-network', label: '네트워크 점검', icon: 'folder' as const, children: [
      { id: '5', label: '네트워크 장비 점검 결과 리포트', icon: 'report' as const, status: 'draft' as const },
      { id: '10', label: '방화벽 정책 점검 리포트', icon: 'report' as const, status: 'draft' as const },
    ]},
    { id: 'folder-dr', label: 'DR', icon: 'folder' as const, children: [
      { id: '8', label: 'DR 훈련 결과 리포트', icon: 'report' as const, status: 'published' as const },
    ]},
    { id: 'folder-ipl', label: 'IPL', icon: 'folder' as const, children: [
      { id: '9', label: 'IPL 실행 내역 리포트', icon: 'report' as const, status: 'published' as const },
    ]},
    { id: 'folder-word', label: 'Editor ver', icon: 'folder' as const, children: [
      { id: 'word', label: '점검결과 상세 리포트 (Editor ver)', icon: 'report' as const, status: 'published' as const },
    ]},
  ],
  'space-personal': [
    { id: 'folder-my-draft', label: '작성 중', icon: 'folder' as const, children: [
      { id: '7', label: '방화벽 정책 점검 리포트 (초안)', icon: 'report' as const, status: 'draft' as const },
    ]},
  ],
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
const RECENT_REPORTS = [
  { id: '1', title: '서버 및 WEB 점검 결과 리포트', inspName: '서버 및 WEB 점검', date: '2026-04-21', status: 'published' as const },
  { id: '8', title: 'DR 훈련 결과 리포트', inspName: 'DR 재해복구 훈련', date: '2026-04-20', status: 'published' as const },
  { id: '2', title: 'DB 정기 점검 결과 리포트', inspName: 'DB 정기 점검', date: '2026-04-18', status: 'draft' as const },
  { id: '3', title: 'WAS 서버 점검 결과 리포트', inspName: 'WAS 서버 점검', date: '2026-04-15', status: 'published' as const },
  { id: '9', title: 'IPL 실행 내역 리포트', inspName: 'IPL 정기 실행', date: '2026-04-14', status: 'published' as const },
  { id: '4', title: 'Linux 보안 점검 결과 리포트', inspName: 'Linux 보안 점검', date: '2026-04-12', status: 'published' as const },
  { id: '5', title: '네트워크 장비 점검 결과 리포트', inspName: '네트워크 장비 점검', date: '2026-04-10', status: 'draft' as const },
  { id: '6', title: 'DB 백업 점검 결과 리포트', inspName: 'DB 백업 점검', date: '2026-04-08', status: 'published' as const },
  { id: '10', title: '방화벽 정책 점검 리포트', inspName: '방화벽 정책 점검', date: '2026-04-05', status: 'draft' as const },
  { id: 'word', title: '점검결과 상세 리포트 (Editor ver)', inspName: '서버 및 WEB 점검', date: '2026-04-03', status: 'published' as const },
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
  const [open, setOpen] = useState(depth < 2);
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

/* ── 메인 ── */
interface ReportOverviewProps {
  onOpenReport: (reportId: string) => void;
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
  const currentTree = SPACE_TREES[activeSpace] || [];
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
          </div>

          <div className="px-3 py-2 border-t border-border">
            <button className="w-full flex items-center justify-center gap-1.5 py-[6px] rounded-[5px] text-[11px] text-[#64748b] border border-dashed border-[#cbd5e1] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              새 폴더
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
                    onClick={() => onOpenReport(item.id)}
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
                {RECENT_REPORTS.map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenReport(r.id)}
                    className={`grid grid-cols-[1fr_160px_100px_80px] px-4 py-3 cursor-pointer hover:bg-[#fafbff] transition-colors items-center
                      ${i < RECENT_REPORTS.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
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
    </div>
  );
}
