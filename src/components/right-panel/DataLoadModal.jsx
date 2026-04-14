'use client';

import { useState, useEffect, useRef } from 'react';
import { imgDatacenter } from '@/lib/assets';
import { IcoChevron } from './SystemSelect';

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

const IcoFolder = ({ color = '#5b646f' }) => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
    <path d="M0 2a1 1 0 011-1h4l1.5 1.5H13a1 1 0 011 1V11a1 1 0 01-1 1H1a1 1 0 01-1-1V2z" fill={color} />
  </svg>
);

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

export function DataLoadModal({ onConfirm, onClose }) {
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
