'use client';

import { useState } from 'react';
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
function WordDocPanel({ docConfig, onChange, onPublish, published }) {
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

      {/* 발행 버튼 */}
      <div className="px-4 py-3 border-t border-border">
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

/* ── Main ── */
export default function RightPanel({ mode, selected, config, onConfigChange, onRemove, docConfig, onDocConfigChange, published, onPublish }) {

  /* Word 모드 + 위젯 미선택 → 문서 설정 */
  if (mode === 'word' && !selected) {
    return (
      <div className="w-[280px] bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-dark">문서 설정</div>
          <div className="text-[11px] text-muted mt-0.5">용지·여백을 설정하세요</div>
        </div>
        <WordDocPanel docConfig={docConfig} onChange={onDocConfigChange} onPublish={onPublish} published={published} />
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
