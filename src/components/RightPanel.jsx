'use client';

import { useState, useEffect, useRef } from 'react';
import { TODAY, MONTH_AGO, QUICK_PERIODS } from '@/lib/constants';
import { imgDatacenter } from '@/lib/assets';

/* ── 시스템 트리 데이터 ── */
const SYSTEM_TREE = [
  {
    id: 'dc-main',
    type: 'datacenter',
    label: 'Datacenter',
    count: 135,
    children: [
      {
        id: 'folder-agent',
        type: 'folder',
        label: '에이전트(삭제금지)',
        count: 4,
        children: [
          { id: 'folder-1210', type: 'folder', label: '1.2.10', count: 2 },
          { id: 'folder-130',  type: 'folder', label: '1.3.0',  count: 2 },
        ],
      },
      { id: 'folder-dev2',    type: 'folder', label: '개발2팀',     count: 128 },
      { id: 'folder-network', type: 'folder', label: '네트워크 장비', count: 3 },
    ],
  },
  { id: 'dc-plan',     type: 'datacenter', label: '기획팀',   count: 0, disabled: true },
  { id: 'dc-customer', type: 'datacenter', label: '고객사',   count: 1 },
  { id: 'dc-engineer', type: 'datacenter', label: '엔지니어', count: 0, disabled: true },
];

/* ── 아이콘 ── */
const IcoFolder = ({ color = '#5b646f' }) => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
    <path d="M0 2a1 1 0 011-1h4l1.5 1.5H13a1 1 0 011 1V11a1 1 0 01-1 1H1a1 1 0 01-1-1V2z" fill={color} />
  </svg>
);

const IcoChevron = ({ open }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
    className={`transition-transform ${open ? 'rotate-90' : ''}`}>
    <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="#5b646f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── 트리 노드 ── */
function TreeNode({ node, depth, selectedIds, onToggleSelect, expanded, onToggleExpand }) {
  const hasChildren = node.children?.length > 0;
  const isSelected = selectedIds.includes(node.id);
  const isDisabled = node.disabled;
  const isExpanded = expanded.includes(node.id);
  const indent = depth * 16;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[5px] pr-2 rounded transition-colors
          ${isDisabled ? 'opacity-40' : 'hover:bg-[#f0f4fa] cursor-pointer'}`}
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        <span
          className={`w-4 h-4 flex items-center justify-center shrink-0 ${hasChildren && !isDisabled ? 'cursor-pointer' : ''}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren && !isDisabled) onToggleExpand(node.id); }}
        >
          {hasChildren && <IcoChevron open={isExpanded} />}
        </span>

        <span
          onClick={() => !isDisabled && onToggleSelect(node.id)}
          className={`w-[13px] h-[13px] border rounded-[2px] shrink-0 flex items-center justify-center transition-colors
            ${isSelected ? 'bg-primary border-primary' : 'border-[#a6acb7] bg-white'}`}
        >
          {isSelected && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>

        <span
          className="flex items-center gap-1.5 flex-1 min-w-0"
          onClick={() => !isDisabled && onToggleSelect(node.id)}
        >
          {node.type === 'datacenter'
            ? <img src={imgDatacenter} alt="dc" className="w-[13px] h-[13px] shrink-0" />
            : <IcoFolder color={isDisabled ? '#adaeae' : '#5b646f'} />}
          <span className={`text-[11px] truncate ${isDisabled ? 'text-[#adaeae]' : 'text-dark'}`}>
            {node.label}
          </span>
          <span className={`text-[10px] font-bold px-1 rounded-[3px] shrink-0
            ${isDisabled ? 'bg-[#adaeae]' : 'bg-[#5b646f]'} text-white`}>
            {node.count}
          </span>
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 시스템 선택 섹션 ── */
function SystemSelectSection({ cfg, onCfgChange }) {
  const [expanded, setExpanded] = useState(['dc-main']);
  const selectedIds = cfg.systemIds || [];

  const toggleSelect = (id) => {
    onCfgChange(selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]);
  };

  const toggleExpand = (id) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em]">시스템 선택</div>
      <div className="border border-border rounded-[6px] overflow-hidden bg-white">
        <div className="max-h-[220px] overflow-y-auto py-1">
          {SYSTEM_TREE.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
        {selectedIds.length > 0 && (
          <div className="border-t border-border px-3 py-1.5 flex items-center justify-between bg-[#f8fafc]">
            <span className="text-[10px] text-muted">{selectedIds.length}개 선택됨</span>
            <button
              onClick={() => onCfgChange([])}
              className="text-[10px] text-link hover:underline"
            >
              전체 해제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 섹션 구분선 ── */
const Sep = () => <div className="h-px bg-border" />;

/* ── 섹션 라벨 ── */
const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em]">{children}</div>
);

/* ── Word 문서 설정 패널 ── */
function WordDocPanel({ docConfig, onChange, onPublish, published, onTempSave, tempSaved }) {
  const set = (key, val) => onChange({ ...docConfig, [key]: val });
  const setMargin = (side, val) => onChange({ ...docConfig, margins: { ...docConfig.margins, [side]: Number(val) } });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex-1 p-4 flex flex-col gap-3">
        <SectionLabel>페이지 설정</SectionLabel>

        {/* 용지 크기 */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted">용지 크기</label>
          <select
            value={docConfig.paperSize}
            onChange={e => set('paperSize', e.target.value)}
            className="text-[12px] border border-border rounded-[6px] px-2.5 py-[7px] text-dark bg-white outline-none focus:border-primary"
          >
            <option value="A4">A4  (210 × 297mm)</option>
            <option value="A3">A3  (297 × 420mm)</option>
            <option value="B5">B5  (176 × 250mm)</option>
            <option value="Letter">Letter  (216 × 279mm)</option>
            <option value="Legal">Legal  (216 × 356mm)</option>
          </select>
        </div>

        {/* 방향 */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted">방향</label>
          <div className="flex gap-2">
            {[
              {
                val: 'portrait', label: '세로',
                icon: (
                  <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                    <rect x="1" y="1" width="16" height="22" rx="2"
                      stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
                  </svg>
                ),
              },
              {
                val: 'landscape', label: '가로',
                icon: (
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                    <rect x="1" y="1" width="22" height="16" rx="2"
                      stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
                  </svg>
                ),
              },
            ].map(({ val, label, icon }) => (
              <button
                key={val}
                onClick={() => set('orientation', val)}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[6px] border text-[11px] transition-colors
                  ${docConfig.orientation === val
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border text-muted hover:border-primary hover:text-primary'}`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 행간 / 자간 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted">간격</label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">행간</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range" min="1.0" max="3.0" step="0.1"
                value={docConfig.lineHeight}
                onChange={e => set('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">자간</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.letterSpacing.toFixed(1)}px</span>
              </div>
              <input
                type="range" min="-2" max="10" step="0.5"
                value={docConfig.letterSpacing}
                onChange={e => set('letterSpacing', parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted">블록 간격</span>
                <span className="text-[10px] text-muted font-medium">{docConfig.blockSpacing}px</span>
              </div>
              <input
                type="range" min="0" max="40" step="1"
                value={docConfig.blockSpacing}
                onChange={e => set('blockSpacing', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* 여백 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted">여백 (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            {[['top','위'], ['bottom','아래'], ['left','왼쪽'], ['right','오른쪽']].map(([side, label]) => (
              <div key={side} className="flex flex-col gap-1">
                <span className="text-[10px] text-muted">{label}</span>
                <input
                  type="number"
                  value={docConfig.margins[side]}
                  onChange={e => setMargin(side, e.target.value)}
                  min="0" max="100"
                  className="text-[12px] border border-border rounded-[6px] px-2 py-1.5 text-dark outline-none focus:border-primary w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 임시 저장 / 발행 버튼 */}
      <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
        <button
          onClick={onTempSave}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-[6px] border transition-colors
            ${tempSaved
              ? 'bg-[#e8f5e9] text-success border-success'
              : 'bg-white text-dark border-border hover:border-primary hover:text-primary'}`}
        >
          {tempSaved ? '✓ 임시 저장됨' : '임시 저장'}
        </button>
        <button
          onClick={onPublish}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-[6px] transition-colors
            ${published
              ? 'bg-success text-white'
              : 'bg-primary text-white hover:bg-primary-hover'}`}
        >
          {published ? '✓ 발행 완료' : '발행'}
        </button>
      </div>
    </div>
  );
}

/* ── 데이터 불러오기 모달 ── */
const DATA_FIELDS = ['시스템 명', 'OS', '점검명', '워크플로우 명', '업무명'];
const SYSTEM_FIELDS = ['시스템 명', 'OS'];

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
          { id: 'dl-sys-d01', type: 'system', label: 'dev-web-001',  os: 'Ubuntu 22.04' },
          { id: 'dl-sys-d02', type: 'system', label: 'dev-api-001',  os: 'Windows Server 2019' },
          { id: 'dl-sys-d03', type: 'system', label: 'dev-db-001',   os: 'RHEL 8' },
          { id: 'dl-sys-d04', type: 'system', label: 'dev-cache-001',os: 'Ubuntu 22.04' },
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

const FIELD_ITEMS = {
  '점검명':      ['정기 점검', '긴급 점검', '보안 점검', '성능 점검', '네트워크 점검', 'SW 패치 점검', 'HW 점검', '재해복구 점검'],
  '워크플로우 명': ['배포 프로세스', '장애 대응', '변경 관리', '릴리즈 관리', '승인 절차', '배포 승인', '서비스 전환'],
  '업무명':      ['인프라 관리', '보안 관리', '운영 지원', '개발 지원', '서비스 운영', '모니터링', '백업 관리'],
};

function getAllLeaves(node) {
  if (node.type === 'system') return [node];
  return (node.children || []).flatMap(getAllLeaves);
}

function getSystemValues(tree, selectedIds, field) {
  const result = [];
  function traverse(node) {
    if (node.type === 'system' && selectedIds.includes(node.id))
      result.push(field === 'OS' ? node.os : node.label);
    (node.children || []).forEach(traverse);
  }
  tree.forEach(traverse);
  return result;
}

/* 데이터 로드 - 시스템 트리 노드 */
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

function DataLoadModal({ onConfirm, onClose }) {
  const [step,       setStep]       = useState(1);
  const [direction,  setDirection]  = useState(null);
  const [field,      setField]      = useState(null);
  const [treeSelIds, setTreeSelIds] = useState([]);
  const [listSel,    setListSel]    = useState([]);
  const [treeExp,    setTreeExp]    = useState(['dl-dc-main']);
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { step > 1 ? setStep(s => s - 1) : onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const isSystemField = SYSTEM_FIELDS.includes(field);
  const values = isSystemField
    ? getSystemValues(DATA_LOAD_SYSTEM_TREE, treeSelIds, field)
    : listSel;

  const handleTreeToggle = (node) => {
    const leafIds = getAllLeaves(node).map(n => n.id);
    const allSel  = leafIds.every(id => treeSelIds.includes(id));
    setTreeSelIds(prev =>
      allSel ? prev.filter(id => !leafIds.includes(id))
             : [...new Set([...prev, ...leafIds])]
    );
  };

  const STEPS = ['추가 방향', '데이터 종류', '항목 선택'];

  const canNext =
    (step === 1 && direction !== null) ||
    (step === 2 && field !== null) ||
    (step === 3 && values.length > 0);

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else if (values.length > 0) { onConfirm(direction, field, values); onClose(); }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-[420px] flex flex-col overflow-hidden max-h-[85vh]">

        {/* 헤더 */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold text-dark">데이터 불러오기</span>
            <button onClick={onClose} className="text-muted hover:text-dark transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {/* 스텝 인디케이터 */}
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done    = step > n;
              const active  = step === n;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                      ${done   ? 'bg-primary text-white'
                      : active ? 'bg-primary text-white ring-4 ring-primary/20'
                               : 'bg-[#eef0f3] text-muted'}`}>
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

          {/* Step 1: 추가 방향 */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">데이터를 표에 추가할 방향을 선택하세요.</p>
              <div className="flex gap-3">
                {[
                  {
                    val: 'row', label: '행으로 추가', desc: '데이터가 새 행으로 추가됩니다',
                    icon: (
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect x="2" y="2" width="32" height="9" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="2" y="14" width="32" height="6" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="2" y="23" width="32" height="6" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M18 31v3M15 32.5l3 2 3-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                  },
                  {
                    val: 'col', label: '열로 추가', desc: '데이터가 새 열로 추가됩니다',
                    icon: (
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect x="2" y="2" width="9" height="32" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="2" width="6" height="32" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="23" y="2" width="6" height="32" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M31 18h3M32.5 15l2 3-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                  },
                ].map(({ val, label, desc, icon }) => (
                  <button
                    key={val}
                    onClick={() => setDirection(val)}
                    className={`flex-1 flex flex-col items-center gap-2.5 py-5 px-3 rounded-[10px] border-2 transition-all
                      ${direction === val
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border text-muted hover:border-[#b0bec5] hover:bg-[#f8fafc]'}`}
                  >
                    {icon}
                    <span className="text-[13px] font-semibold">{label}</span>
                    <span className="text-[11px] opacity-70 text-center">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 데이터 종류 */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">불러올 데이터 종류를 선택하세요.</p>
              <div className="flex flex-col gap-1.5">
                {DATA_FIELDS.map(f => (
                  <button
                    key={f}
                    onClick={() => { setField(f); setTreeSelIds([]); setListSel([]); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[8px] border-2 text-left transition-all
                      ${field === f ? 'border-primary bg-primary-light' : 'border-border hover:border-[#b0bec5] hover:bg-[#f8fafc]'}`}
                  >
                    <span className={`text-[13px] font-semibold flex-1 ${field === f ? 'text-primary' : 'text-dark'}`}>{f}</span>
                    {field === f && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 항목 선택 */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted">
                {isSystemField ? '데이터센터 또는 시스템을 선택하세요.' : '추가할 항목을 선택하세요.'}
              </p>

              {isSystemField ? (
                <div className="border border-border rounded-[8px] overflow-hidden">
                  <div className="max-h-[280px] overflow-y-auto py-1 bg-white">
                    {DATA_LOAD_SYSTEM_TREE.map(node => (
                      <DataTreeNode
                        key={node.id}
                        node={node}
                        depth={0}
                        selectedIds={treeSelIds}
                        onToggle={handleTreeToggle}
                        expanded={treeExp}
                        onExpand={id => setTreeExp(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                      />
                    ))}
                  </div>
                  {values.length > 0 && (
                    <div className="border-t border-border px-3 py-1.5 flex items-center justify-between bg-[#f8fafc]">
                      <span className="text-[11px] text-muted">{values.length}개 선택됨</span>
                      <button onClick={() => setTreeSelIds([])} className="text-[11px] text-link hover:underline">전체 해제</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {(FIELD_ITEMS[field] || []).map(item => (
                    <button
                      key={item}
                      onClick={() => setListSel(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[8px] border-2 text-left transition-all
                        ${listSel.includes(item) ? 'border-primary bg-primary-light' : 'border-border hover:border-[#b0bec5] hover:bg-[#f8fafc]'}`}
                    >
                      <span className={`text-[12px] font-medium flex-1 ${listSel.includes(item) ? 'text-primary' : 'text-dark'}`}>{item}</span>
                      {listSel.includes(item) && (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 6.5l3 3L11 2.5" stroke="#0056a4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
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
            {step < 3 ? '다음' : values.length > 0 ? `불러오기 (${values.length}개)` : '불러오기'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 표 설정 패널 ── */
function TablePanel({ table, onAction, onDelete, onLoadData, onToggleHeader, onSwapHeaders }) {
  const { rows, cols, row, col, headerRow = true, headerCol = false } = table;
  const [showModal, setShowModal] = useState(false);

  const Btn = ({ label, action, danger }) => (
    <button
      onClick={() => onAction(action)}
      className={`w-full text-left px-3 py-2 rounded-[6px] text-[12px] border transition-colors
        ${danger
          ? 'text-danger border-danger hover:bg-red-50'
          : 'text-dark border-border hover:bg-[#f0f4ff] hover:border-primary hover:text-primary'}`}
    >
      {label}
    </button>
  );

  return (
    <>
    {showModal && (
      <DataLoadModal
        onConfirm={(direction, field, values) => onLoadData?.(direction, field, values)}
        onClose={() => setShowModal(false)}
      />
    )}
    <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
      <div className="flex flex-col gap-1">
        <SectionLabel>크기</SectionLabel>
        <div className="text-[12px] text-muted">{rows}행 × {cols}열 (현재 {row + 1}행 {col + 1}열)</div>
      </div>
      <Sep />
      <div className="flex flex-col gap-2">
        <SectionLabel>헤더</SectionLabel>
        {[['headerRow', '행 헤더', headerRow], ['headerCol', '열 헤더', headerCol]].map(([key, label, val]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-[12px] text-dark">{label}</span>
            <button
              onClick={() => onToggleHeader?.(key, !val)}
              className={`w-9 h-5 rounded-full transition-colors relative ${val ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150
                ${val ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
        <button
          onClick={() => onSwapHeaders?.()}
          className="w-full px-3 py-2 rounded-[6px] text-[12px] border border-border text-dark hover:bg-[#f0f4ff] hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 4h9M7 1.5L10 4 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 10H4M7 7.5L4 10l3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          행/열 헤더 교체
        </button>
      </div>
      <Sep />
      <div className="flex flex-col gap-1.5">
        <SectionLabel>데이터</SectionLabel>
        <button
          onClick={() => setShowModal(true)}
          className="w-full text-left px-3 py-2 rounded-[6px] text-[12px] border border-primary text-primary bg-primary-light hover:bg-blue-100 transition-colors flex items-center gap-2"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          데이터 불러오기
        </button>
      </div>
      <Sep />
      <div className="flex flex-col gap-1.5">
        <SectionLabel>행</SectionLabel>
        <Btn label="위에 행 추가"   action="addRowAbove" />
        <Btn label="아래에 행 추가" action="addRowBelow" />
        <Btn label="현재 행 삭제"   action="deleteRow"   />
      </div>
      <Sep />
      <div className="flex flex-col gap-1.5">
        <SectionLabel>열</SectionLabel>
        <Btn label="왼쪽에 열 추가"  action="addColLeft"  />
        <Btn label="오른쪽에 열 추가" action="addColRight" />
        <Btn label="현재 열 삭제"    action="deleteCol"   />
      </div>
      <div className="flex-1" />
      <button
        onClick={onDelete}
        className="w-full py-2 bg-white text-danger text-[12px] font-medium rounded border border-danger hover:bg-red-50 transition-colors"
      >
        표 삭제
      </button>
    </div>
    </>
  );
}

/* ── Main ── */
export default function RightPanel({ mode, selected, config, onConfigChange, onRemove, docConfig, onDocConfigChange, published, onPublish, tempSaved, onTempSave, selectedTable, onTableAction, onTableDelete, onTableLoadData, onTableToggleHeader, onTableSwapHeaders }) {

  /* Word 모드 + 표 포커스 → 표 설정 */
  if (mode === 'word' && !selected && selectedTable) {
    return (
      <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-dark">표 설정</div>
          <div className="text-[11px] text-muted mt-0.5">{selectedTable.rows}행 × {selectedTable.cols}열</div>
        </div>
        <TablePanel
          table={selectedTable}
          onAction={onTableAction}
          onDelete={() => onTableDelete(selectedTable.blockId)}
          onLoadData={(direction, field, values) => onTableLoadData?.(selectedTable.blockId, direction, field, values)}
          onToggleHeader={(key, val) => onTableToggleHeader?.(selectedTable.blockId, key, val)}
          onSwapHeaders={() => onTableSwapHeaders?.(selectedTable.blockId)}
        />
      </div>
    );
  }

  /* Word 모드 + 위젯 미선택 → 문서 설정 */
  if (mode === 'word' && !selected) {
    return (
      <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-dark">문서 설정</div>
          <div className="text-[11px] text-muted mt-0.5">용지·여백을 설정하세요</div>
        </div>
        <WordDocPanel docConfig={docConfig} onChange={onDocConfigChange} onPublish={onPublish} published={published} onTempSave={onTempSave} tempSaved={tempSaved} />
      </div>
    );
  }

  /* Grid 모드 + 위젯 미선택 → 빈 상태 */
  if (!selected) {
    return (
      <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-dark">위젯 옵션</div>
          <div className="text-[11px] text-muted mt-0.5">캔버스에서 위젯을 선택하세요</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-border">
          <span className="text-3xl">⚙</span>
          <span className="text-[12px]">선택된 위젯이 없습니다</span>
        </div>
      </div>
    );
  }

  /* 위젯 선택 → 위젯 옵션 (Grid/Word 공통) */
  const { widgetDef, instanceId } = selected;
  const cfg = config[instanceId] || {};

  const setViewType  = (vt)  => onConfigChange(instanceId, { ...cfg, viewType: vt });
  const setPeriodOn  = (v)   => onConfigChange(instanceId, { ...cfg, periodOn: v });
  const setFrom      = (v)   => onConfigChange(instanceId, { ...cfg, from: v });
  const setTo        = (v)   => onConfigChange(instanceId, { ...cfg, to: v });
  const setQuick     = (q)   => onConfigChange(instanceId, { ...cfg, quick: q });
  const setSystemIds = (ids) => onConfigChange(instanceId, { ...cfg, systemIds: ids });

  return (
    <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[13px] font-semibold text-dark">{widgetDef.name}</div>
        <div className="text-[11px] text-muted mt-0.5">{widgetDef.desc}</div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">

        {/* 시스템 선택 */}
        {widgetDef.hasSystemSelect && (
          <SystemSelectSection cfg={cfg} onCfgChange={setSystemIds} />
        )}

        {/* 표시 형태 */}
        {widgetDef.viewTypes.length > 0 && (
          <>
            {widgetDef.hasSystemSelect && <Sep />}
            <div className="flex flex-col gap-2">
              <SectionLabel>표시 형태</SectionLabel>
              <div className="flex flex-col gap-1">
                {widgetDef.viewTypes.map(vt => (
                  <div
                    key={vt.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border transition-colors
                      ${cfg.viewType === vt.id
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:bg-[#f8fafc] text-dark'}`}
                    onClick={() => setViewType(vt.id)}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${cfg.viewType === vt.id ? 'border-primary' : 'border-[#c0c7ce]'}`}>
                      {cfg.viewType === vt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-[11px]">{vt.icon}</span>
                    <span className="text-[12px] font-medium">{vt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 표시 설정 */}
        <>
          <Sep />
          <div className="flex flex-col gap-2">
            <SectionLabel>표시 설정</SectionLabel>
            {[['showBorder', '외곽선'], ['showLabel', '라벨']].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[12px] text-dark">{label}</span>
                <button
                  onClick={() => onConfigChange(instanceId, { ...cfg, [key]: cfg[key] === false ? true : false })}
                  className={`w-9 h-5 rounded-full transition-colors relative ${cfg[key] !== false ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150
                    ${cfg[key] !== false ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </>

        {/* 기간 설정 */}
        {widgetDef.hasPeriod && (
          <>
            {(widgetDef.viewTypes.length > 0 || widgetDef.hasSystemSelect) && <Sep />}
            <div className="flex flex-col gap-2">
              <SectionLabel>기간 설정</SectionLabel>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-dark">기간 필터 사용</span>
                <button
                  onClick={() => setPeriodOn(!cfg.periodOn)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${cfg.periodOn ? 'bg-primary' : 'bg-[#c0c7ce]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150
                    ${cfg.periodOn ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>

              {cfg.periodOn && (
                <>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {QUICK_PERIODS.map(q => (
                      <button
                        key={q}
                        onClick={() => setQuick(cfg.quick === q ? null : q)}
                        className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors
                          ${cfg.quick === q
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-muted border-border hover:border-primary hover:text-primary'}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  {!cfg.quick && (
                    <div className="flex flex-col gap-2 mt-1">
                      {[['시작', cfg.from || MONTH_AGO, setFrom], ['종료', cfg.to || TODAY, setTo]].map(([label, val, setter]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[11px] text-muted w-6 shrink-0">{label}</span>
                          <input
                            type="date"
                            value={val}
                            onChange={e => setter(e.target.value)}
                            className="flex-1 text-[11px] border border-border rounded px-2 py-1 text-dark outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <div className="flex-1" />

        <button
          onClick={() => onRemove && onRemove(instanceId)}
          className="w-full py-2 bg-white text-danger text-[12px] font-medium rounded border border-danger hover:bg-red-50 transition-colors"
        >
          위젯 삭제
        </button>
      </div>
    </div>
  );
}
