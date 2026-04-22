'use client';

import { useState, useEffect, useRef } from 'react';
import { imgDatacenter } from '@/lib/assets';

function IcoChevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      className={`transition-transform ${open ? 'rotate-90' : ''}`}>
      <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── 카테고리 ── */
const CATEGORIES = [
  {
    id: 'system',
    label: '시스템',
    desc: '시스템 상태 및 관련 데이터',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="4" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M9 24h10M14 20v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="14" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'inspection',
    label: '점검작업',
    desc: '준비 중',
    disabled: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M8 4h12a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'workflow',
    label: '워크플로우',
    desc: '준비 중',
    disabled: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="6" cy="14" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="22" cy="14" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="14" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M9 14h10M14 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/* ── 시스템 테이블 목록 ── */
const SYSTEM_TABLES = [
  { id: '시스템 상태', label: '시스템 상태', desc: '상태·OS·IP 등 기본 현황' },
  { id: '계정',       label: '계정',       desc: '계정명·권한·로그인 이력' },
  { id: '변경요약',   label: '변경요약',   desc: '변경 유형·일시·담당자' },
  { id: '알림',       label: '알림',       desc: '알림 유형·내용·발생 시간' },
];

/* ── 데이터센터 트리 ── */
const DATA_LOAD_SYSTEM_TREE = [
  {
    id: 'dl-dc-main', type: 'datacenter', label: 'Datacenter',
    children: [
      { id: 'dl-folder-agent', type: 'folder', label: '에이전트(삭제금지)',
        children: [
          { id: 'dl-sys-a01', type: 'system', label: 'agent-v1.2.10-01', os: 'Ubuntu 22.04' },
          { id: 'dl-sys-a02', type: 'system', label: 'agent-v1.2.10-02', os: 'CentOS 7' },
          { id: 'dl-sys-a03', type: 'system', label: 'agent-v1.3.0-01',  os: 'Ubuntu 22.04' },
          { id: 'dl-sys-a04', type: 'system', label: 'agent-v1.3.0-02',  os: 'RHEL 8' },
        ],
      },
      { id: 'dl-folder-dev2', type: 'folder', label: '개발2팀',
        children: [
          { id: 'dl-sys-d01', type: 'system', label: 'dev-web-001',   os: 'Ubuntu 22.04' },
          { id: 'dl-sys-d02', type: 'system', label: 'dev-api-001',   os: 'Windows Server 2019' },
          { id: 'dl-sys-d03', type: 'system', label: 'dev-db-001',    os: 'RHEL 8' },
          { id: 'dl-sys-d04', type: 'system', label: 'dev-cache-001', os: 'Ubuntu 22.04' },
        ],
      },
      { id: 'dl-folder-net', type: 'folder', label: '네트워크 장비',
        children: [
          { id: 'dl-sys-n01', type: 'system', label: 'L3-switch-01', os: 'Cisco IOS' },
          { id: 'dl-sys-n02', type: 'system', label: 'firewall-01',  os: 'FortiOS' },
          { id: 'dl-sys-n03', type: 'system', label: 'L2-switch-01', os: 'Cisco IOS' },
        ],
      },
    ],
  },
  { id: 'dl-dc-customer', type: 'datacenter', label: '고객사',
    children: [
      { id: 'dl-sys-c01', type: 'system', label: 'customer-web-01', os: 'Windows Server 2022' },
      { id: 'dl-sys-c02', type: 'system', label: 'customer-db-01',  os: 'Windows Server 2019' },
    ],
  },
];

/* 유틸 */
export function getAllLeaves(node) {
  if (node.type === 'system') return [node];
  return (node.children || []).flatMap(getAllLeaves);
}

/* ── 아이콘 ── */
const IcoFolder = ({ color = '#5b646f' }) => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
    <path d="M0 2a1 1 0 011-1h4l1.5 1.5H13a1 1 0 011 1V11a1 1 0 01-1 1H1a1 1 0 01-1-1V2z" fill={color} />
  </svg>
);

/* ── 시스템 트리 노드 ── */
function DataTreeNode({ node, depth, selectedIds, onToggle, expanded, onExpand }) {
  const hasChildren = node.children?.length > 0;
  const isSystem = node.type === 'system';
  const leaves = getAllLeaves(node);
  const leafIds = leaves.map(n => n.id);
  const selectedCount = leafIds.filter(id => selectedIds.includes(id)).length;
  const allSel  = leafIds.length > 0 && selectedCount === leafIds.length;
  const someSel = selectedCount > 0 && !allSel;
  const isExp   = expanded.includes(node.id);

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-[5px] pr-2 rounded hover:bg-[#f0f4fa] cursor-pointer"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onToggle(node)}
      >
        <span
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={e => { e.stopPropagation(); if (hasChildren) onExpand(node.id); }}
        >
          {hasChildren && <IcoChevron open={isExp} />}
        </span>

        <span className={`w-[13px] h-[13px] border rounded-[2px] shrink-0 flex items-center justify-center transition-colors
          ${allSel ? 'bg-primary border-primary' : someSel ? 'border-primary bg-white' : 'border-[#a6acb7] bg-white'}`}>
          {allSel && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {someSel && <div className="w-[6px] h-[1.5px] bg-primary rounded" />}
        </span>

        <span className="flex items-center gap-1.5 flex-1 min-w-0">
          {node.type === 'datacenter'
            ? <img src={imgDatacenter} alt="dc" className="w-[13px] h-[13px] shrink-0" />
            : node.type === 'folder'
              ? <IcoFolder />
              : <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <circle cx="5.5" cy="5.5" r="4.5" stroke="#5b646f" strokeWidth="1.2"/>
                  <circle cx="5.5" cy="5.5" r="2" fill="#5b646f"/>
                </svg>
          }
          <span className="text-[11px] text-dark truncate">{node.label}</span>
          {!isSystem && (
            <span className="text-[10px] font-bold px-1 rounded-[3px] bg-[#5b646f] text-white shrink-0">
              {leafIds.length}
            </span>
          )}
        </span>
      </div>

      {hasChildren && isExp && node.children.map(child => (
        <DataTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onToggle={onToggle}
          expanded={expanded}
          onExpand={onExpand}
        />
      ))}
    </div>
  );
}

/* ── 메인 모달 ── */
// onConfirm(category, selectedLeafNodes, tableType)
export function DataLoadModal({ onConfirm, onClose }) {
  const [step,       setStep]    = useState(1);
  const [category,   setCategory] = useState(null);
  const [treeSelIds, setTreeSelIds] = useState([]);
  const [treeExp,    setTreeExp]  = useState(['dl-dc-main']);
  const [tableType,  setTableType] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') step > 1 ? setStep(s => s - 1) : onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const handleTreeToggle = node => {
    const leafIds = getAllLeaves(node).map(n => n.id);
    const allSel  = leafIds.every(id => treeSelIds.includes(id));
    setTreeSelIds(prev =>
      allSel ? prev.filter(id => !leafIds.includes(id))
             : [...new Set([...prev, ...leafIds])]
    );
  };

  const selectedLeaves = DATA_LOAD_SYSTEM_TREE
    .flatMap(getAllLeaves)
    .filter(n => treeSelIds.includes(n.id));

  const STEPS = ['카테고리', '시스템 선택', '테이블 선택'];

  const canNext =
    (step === 1 && category !== null) ||
    (step === 2 && treeSelIds.length > 0) ||
    (step === 3 && tableType !== null);

  const handleNext = () => {
    if (step < 3) { setStep(s => s + 1); return; }
    onConfirm(category, selectedLeaves, tableType);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-[440px] flex flex-col overflow-hidden max-h-[85vh]">

        {/* 헤더 + 스텝 인디케이터 */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold text-dark">데이터 불러오기</span>
            <button onClick={onClose} className="text-muted hover:text-dark transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done   = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                      ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-[#eef0f3] text-muted'}`}>
                      {done
                        ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : n}
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-primary' : done ? 'text-muted' : 'text-[#c0c7ce]'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-2 mb-4 rounded transition-colors ${step > n ? 'bg-primary' : 'bg-[#eef0f3]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Step 1: 카테고리 */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">불러올 데이터의 카테고리를 선택하세요.</p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    disabled={cat.disabled}
                    onClick={() => !cat.disabled && setCategory(cat.id)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-[10px] border-2 text-left transition-all
                      ${cat.disabled
                        ? 'border-border opacity-40 cursor-not-allowed bg-[#fafafa]'
                        : category === cat.id
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border hover:border-[#b0bec5] hover:bg-[#f8fafc] text-dark'}`}
                  >
                    <span className={category === cat.id ? 'text-primary' : 'text-[#5b646f]'}>
                      {cat.icon}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold">{cat.label}</span>
                      <span className="text-[11px] opacity-70">{cat.desc}</span>
                    </span>
                    {category === cat.id && (
                      <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 시스템 선택 (데이터센터 트리) */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">데이터를 가져올 시스템을 선택하세요.</p>
              <div className="border border-border rounded-[8px] overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto py-1 bg-white">
                  {DATA_LOAD_SYSTEM_TREE.map(node => (
                    <DataTreeNode
                      key={node.id}
                      node={node}
                      depth={0}
                      selectedIds={treeSelIds}
                      onToggle={handleTreeToggle}
                      expanded={treeExp}
                      onExpand={id => setTreeExp(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      )}
                    />
                  ))}
                </div>
                {treeSelIds.length > 0 && (
                  <div className="border-t border-border px-3 py-1.5 flex items-center justify-between bg-[#f8fafc]">
                    <span className="text-[11px] text-muted">{selectedLeaves.length}개 시스템 선택됨</span>
                    <button onClick={() => setTreeSelIds([])} className="text-[11px] text-link hover:underline">전체 해제</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: 테이블 선택 */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">표에 채울 테이블 유형을 선택하세요.</p>
              <div className="flex flex-col gap-1.5">
                {SYSTEM_TABLES.map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => setTableType(tbl.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[8px] border-2 text-left transition-all
                      ${tableType === tbl.id ? 'border-primary bg-primary-light' : 'border-border hover:border-[#b0bec5] hover:bg-[#f8fafc]'}`}
                  >
                    <span className="flex flex-col gap-0.5 flex-1">
                      <span className={`text-[13px] font-semibold ${tableType === tbl.id ? 'text-primary' : 'text-dark'}`}>
                        {tbl.label}
                      </span>
                      <span className="text-[11px] text-muted">{tbl.desc}</span>
                    </span>
                    {tableType === tbl.id && (
                      <svg className="shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {selectedLeaves.length > 0 && (
                <div className="mt-1 px-3 py-2 bg-[#f0f4fa] rounded-[6px] text-[11px] text-muted">
                  선택된 시스템 {selectedLeaves.length}개 데이터가 표에 채워집니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex-1 py-2.5 text-[13px] font-medium rounded-[6px] border border-border text-muted hover:bg-[#f5f5f5] transition-colors"
          >
            {step > 1 ? '이전' : '취소'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-[6px] transition-colors
              ${!canNext ? 'bg-[#c0c7ce] text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover'}`}
          >
            {step < 3 ? '다음' : `불러오기 (${selectedLeaves.length}개)`}
          </button>
        </div>
      </div>
    </div>
  );
}
