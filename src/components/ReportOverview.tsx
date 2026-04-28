'use client';

import { useState } from 'react';
import AppHeader from './AppHeader';

/* ── 스페이스별 트리 데이터 ── */
const SPACES = [
  { id: 'space-shared', label: '공유 스페이스', type: 'shared' as const },
  { id: 'space-personal', label: '내 스페이스', type: 'personal' as const },
];

const SPACE_MEMBERS: Record<string, { id: string; name: string; role: string; color: string }[]> = {
  'space-shared': [
    { id: 'u1', name: '김세훈', role: '관리자', color: '#0056a4' },
    { id: 'u2', name: '이지은', role: '편집자', color: '#7c3aed' },
    { id: 'u3', name: '박민수', role: '편집자', color: '#0891b2' },
    { id: 'u4', name: '최유진', role: '뷰어', color: '#d97706' },
    { id: 'u5', name: '정호석', role: '뷰어', color: '#dc2626' },
  ],
  'space-personal': [
    { id: 'u1', name: '김세훈', role: '소유자', color: '#0056a4' },
  ],
};

const SPACE_TREES: Record<string, any[]> = {
  'space-shared': [
    {
      id: 'folder-server',
      label: '서버 점검',
      icon: 'folder' as const,
      children: [
        { id: 'rpt-1', label: '서버 및 WEB 점검 결과 보고서', icon: 'report' as const, status: 'published' as const, date: '2026-04-21' },
        { id: 'rpt-3', label: 'WAS 서버 점검 결과 보고서', icon: 'report' as const, status: 'published' as const, date: '2026-04-15' },
        { id: 'rpt-4', label: 'Linux 보안 점검 결과 보고서', icon: 'report' as const, status: 'published' as const, date: '2026-04-12' },
      ],
    },
    {
      id: 'folder-db',
      label: 'DB 점검',
      icon: 'folder' as const,
      children: [
        { id: 'rpt-2', label: 'DB 정기 점검 결과 보고서', icon: 'report' as const, status: 'draft' as const, date: '2026-04-18' },
        { id: 'rpt-6', label: 'DB 백업 점검 결과 보고서', icon: 'report' as const, status: 'published' as const, date: '2026-04-08' },
      ],
    },
    {
      id: 'folder-network',
      label: '네트워크 점검',
      icon: 'folder' as const,
      children: [
        { id: 'rpt-5', label: '네트워크 장비 점검 결과 보고서', icon: 'report' as const, status: 'draft' as const, date: '2026-04-10' },
      ],
    },
  ],
  'space-personal': [
    {
      id: 'folder-my-draft',
      label: '작성 중',
      icon: 'folder' as const,
      children: [
        { id: 'rpt-7', label: '방화벽 정책 점검 보고서 (초안)', icon: 'report' as const, status: 'draft' as const, date: '2026-04-25' },
      ],
    },
    {
      id: 'folder-my-published',
      label: '발행 완료',
      icon: 'folder' as const,
      children: [
        { id: 'rpt-8', label: 'DR 훈련 결과 보고서', icon: 'report' as const, status: 'published' as const, date: '2026-04-20' },
      ],
    },
  ],
};

/* ── 템플릿 데이터 ── */
const TEMPLATES = [
  {
    id: 'tpl-weekly',
    name: '주간 점검결과 보고서',
    desc: '주간 단위 점검 현황 종합 리포트',
    icon: '📅',
    tags: ['주간', '종합', '테이블'],
  },
  {
    id: 'tpl-dr',
    name: 'DR 실행 내역 보고서',
    desc: '재해복구 훈련 실행 내역 리포트',
    icon: '🔄',
    tags: ['DR', '복구', '내역'],
  },
  {
    id: 'tpl-ipl',
    name: 'IPL 실행 내역 보고서',
    desc: 'IPL 실행 결과 및 내역 리포트',
    icon: '⚡',
    tags: ['IPL', '실행', '내역'],
  },
  {
    id: 'tpl-detail',
    name: '점검결과 상세 보고서',
    desc: '위젯 기반 상세 분석 리포트',
    icon: '📊',
    tags: ['위젯', '차트', '테이블'],
  },
  {
    id: 'tpl-security',
    name: '보안 점검 보고서',
    desc: '보안 취약점 점검 결과 리포트',
    icon: '🛡️',
    tags: ['보안', '취약점', '조치'],
  },
];

/* ── 최근 리포트 (메인 영역용) ── */
const RECENT_REPORTS = [
  { id: 'rpt-1', title: '서버 및 WEB 점검 결과 보고서', inspName: '서버 및 WEB 점검', date: '2026-04-21', status: 'published' as const },
  { id: 'rpt-8', title: 'DR 훈련 결과 보고서', inspName: 'DR 재해복구 훈련', date: '2026-04-20', status: 'published' as const },
  { id: 'rpt-2', title: 'DB 정기 점검 결과 보고서', inspName: 'DB 정기 점검', date: '2026-04-18', status: 'draft' as const },
  { id: 'rpt-3', title: 'WAS 서버 점검 결과 보고서', inspName: 'WAS 서버 점검', date: '2026-04-15', status: 'published' as const },
  { id: 'rpt-9', title: 'IPL 실행 내역 보고서', inspName: 'IPL 정기 실행', date: '2026-04-14', status: 'published' as const },
  { id: 'rpt-4', title: 'Linux 보안 점검 결과 보고서', inspName: 'Linux 보안 점검', date: '2026-04-12', status: 'published' as const },
  { id: 'rpt-5', title: '네트워크 장비 점검 결과 보고서', inspName: '네트워크 장비 점검', date: '2026-04-10', status: 'draft' as const },
  { id: 'rpt-6', title: 'DB 백업 점검 결과 보고서', inspName: 'DB 백업 점검', date: '2026-04-08', status: 'published' as const },
  { id: 'rpt-10', title: '방화벽 정책 점검 보고서', inspName: '방화벽 정책 점검', date: '2026-04-05', status: 'draft' as const },
  { id: 'rpt-11', title: '주간 점검결과 보고서 (15주차)', inspName: '주간 종합 점검', date: '2026-04-04', status: 'published' as const },
];

/* ── 트리 아이콘 ── */
function TreeIcon({ type, status }: { type: 'space' | 'folder' | 'report'; status?: string }) {
  if (type === 'space') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="2" y="3" width="20" height="18" rx="3"/><path d="M8 7h8M8 11h5"/>
    </svg>
  );
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
        onClick={() => {
          if (hasChildren) setOpen(!open);
          onSelect(node.id);
        }}
      >
        {hasChildren && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
            className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!hasChildren && <div className="w-2" />}
        <TreeIcon type={node.icon} status={node.status} />
        <span className={`text-[12px] flex-1 min-w-0 truncate ${isSelected ? 'font-semibold text-[#0056a4]' : node.icon === 'space' ? 'font-semibold text-[#1a222b]' : 'text-[#334155]'}`}>
          {node.label}
        </span>
        {hasChildren && (
          <span className="text-[10px] text-[#94a3b8] shrink-0">{node.children.length}</span>
        )}
        {node.status === 'draft' && !hasChildren && (
          <span className="text-[9px] text-[#94a3b8] bg-[#f1f5f9] rounded-[3px] px-1 shrink-0">임시</span>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((child: any) => (
            <SidebarNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 상태 뱃지 ── */
function StatusDot({ status }: { status: 'published' | 'draft' }) {
  return status === 'published' ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16a34a]">
      <div className="w-[5px] h-[5px] rounded-full bg-[#16a34a]" />
      발행됨
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#94a3b8]">
      <div className="w-[5px] h-[5px] rounded-full bg-[#cbd5e1]" />
      작성 중
    </span>
  );
}

/* ── 메인 오버뷰 ── */
interface ReportOverviewProps {
  onOpenReport: (reportId: string) => void;
}

export default function ReportOverview({ onOpenReport }: ReportOverviewProps) {
  const [activeSpace, setActiveSpace] = useState('space-shared');
  const [selectedId, setSelectedId] = useState('folder-server');
  const [showMemberPanel, setShowMemberPanel] = useState(false);
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
          <div className="px-3 pt-3 pb-2 border-b border-border">
            <select
              value={activeSpace}
              onChange={e => { setActiveSpace(e.target.value); setSelectedId(''); }}
              className="w-full text-[12px] font-semibold border border-[#e2e8f0] rounded-[6px] px-2.5 py-[7px] text-[#1a222b] bg-white outline-none focus:border-[#0056a4] cursor-pointer"
            >
              {SPACES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="검색..."
                className="w-full text-[11px] border border-[#e2e8f0] rounded-[5px] pl-7 pr-2 py-[5px] outline-none focus:border-[#0056a4] text-[#334155] bg-white"
              />
            </div>
          </div>

          {/* 트리 */}
          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {currentTree.map(node => (
              <SidebarNode key={node.id} node={node} selectedId={selectedId} onSelect={setSelectedId} />
            ))}
          </div>

          {/* 새 폴더 */}
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
          <div className="max-w-[960px] mx-auto px-8 py-6">

            {/* 스페이스 정보 */}
            <div className="mb-6 bg-white rounded-[10px] border border-[#e2e8f0] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] rounded-[8px] bg-[#eff6ff] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="18" rx="3"/><path d="M8 7h8M8 11h5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#1a222b]">{currentSpace.label}</div>
                    <div className="text-[10px] text-[#94a3b8] mt-0.5">
                      {currentSpace.type === 'shared' ? `${members.length}명이 공유 중` : '나만 사용하는 스페이스'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* 멤버 아바타 */}
                  <div className="flex items-center -space-x-1.5">
                    {members.slice(0, 4).map(m => (
                      <div
                        key={m.id}
                        title={`${m.name} (${m.role})`}
                        className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
                        style={{ background: m.color }}
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] border-2 border-white">
                        +{members.length - 4}
                      </div>
                    )}
                  </div>

                  {/* 멤버 관리 버튼 */}
                  <button
                    onClick={() => setShowMemberPanel(!showMemberPanel)}
                    className="flex items-center gap-1 px-2.5 py-[5px] rounded-[5px] text-[11px] font-medium text-[#64748b] border border-[#e2e8f0] hover:border-[#0056a4] hover:text-[#0056a4] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    관리
                  </button>
                </div>
              </div>

              {/* 멤버 패널 (토글) */}
              {showMemberPanel && (
                <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
                  <div className="flex flex-col gap-2">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: m.color }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-[12px] text-[#334155]">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-[2px] rounded-[3px] bg-[#f1f5f9] text-[#64748b]">{m.role}</span>
                          {m.role !== '관리자' && m.role !== '소유자' && (
                            <button className="text-[#94a3b8] hover:text-[#ef4444] transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-2 w-full flex items-center justify-center gap-1 py-[6px] rounded-[5px] text-[11px] text-[#0056a4] border border-dashed border-[#0056a4]/30 hover:bg-[#eff6ff] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    멤버 추가
                  </button>
                </div>
              )}
            </div>

            {/* 새로 생성하기 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[#1a222b]">새로 생성하기</h2>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">템플릿을 선택하면 바로 리포트를 작성할 수 있습니다</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* 빈 문서 */}
                <div
                  onClick={() => onOpenReport('new')}
                  className="flex flex-col gap-3 p-5 rounded-[10px] border-2 border-dashed border-[#cbd5e1] cursor-pointer hover:border-[#0056a4] hover:bg-[#fafbff] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-[22px] h-[22px] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#0056a4] transition-colors">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-[#64748b] group-hover:text-[#0056a4] transition-colors">빈 문서</div>
                      <div className="text-[10px] text-[#94a3b8] mt-0.5">처음부터 작성</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-[9px] px-1.5 py-[2px] rounded-[3px] bg-[#f1f5f9] text-[#64748b]">자유 형식</span>
                  </div>
                </div>

                {/* 템플릿 카드들 */}
                {TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onOpenReport(t.id)}
                    className="flex flex-col gap-3 p-5 rounded-[10px] border border-[#e2e8f0] bg-white cursor-pointer hover:border-[#0056a4] hover:shadow-[0_2px_12px_rgba(0,86,164,0.08)] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[22px]">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-[#1a222b] group-hover:text-[#0056a4] transition-colors">{t.name}</div>
                        <div className="text-[10px] text-[#94a3b8] mt-0.5">{t.desc}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {t.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-[2px] rounded-[3px] bg-[#f1f5f9] text-[#64748b]">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 리포트 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[16px] font-bold text-[#1a222b]">최근 리포트</h2>
                <button className="text-[11px] text-[#0056a4] hover:underline">전체 보기</button>
              </div>

              <div className="bg-white rounded-[10px] border border-[#e2e8f0] overflow-hidden">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[1fr_160px_100px_80px] px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                  <span>리포트명</span>
                  <span>점검명</span>
                  <span>날짜</span>
                  <span>상태</span>
                </div>
                {/* 테이블 행 */}
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
    </div>
  );
}
