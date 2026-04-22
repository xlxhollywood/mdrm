'use client';

import { useState } from 'react';

/* ── 트리 데이터 ── */

// 시스템 메뉴 트리: 데이터센터 → 그룹 → 시스템
const SYSTEM_TREE = [
  {
    id: 'dc1',
    label: '나이스 데이터센터',
    icon: 'dc',
    count: 32,
    children: [
      {
        id: 'grp-cmp',
        label: '나이스_CMP',
        icon: 'folder',
        count: 5,
        children: [
          { id: 'sys-1', label: 'icenscdb01', icon: 'server' },
          { id: 'sys-2', label: 'icenscld01', icon: 'server' },
          { id: 'sys-3', label: 'icenscsm01', icon: 'server' },
          { id: 'sys-4', label: 'icenscsn01', icon: 'server' },
          { id: 'sys-5', label: 'icenscw01', icon: 'server' },
        ],
      },
      {
        id: 'grp-db',
        label: '나이스_DB서버',
        icon: 'folder',
        count: 7,
        children: [
          { id: 'sys-6', label: 'icenshis01', icon: 'server' },
          { id: 'sys-7', label: 'icenshis02', icon: 'server' },
          { id: 'sys-8', label: 'icensmis02', icon: 'server' },
          { id: 'sys-9', label: 'icensele01', icon: 'server' },
          { id: 'sys-10', label: 'icensbut02', icon: 'server' },
          { id: 'sys-11', label: 'icensga01', icon: 'server' },
          { id: 'sys-12', label: 'icenspp02', icon: 'server' },
        ],
      },
    ],
  },
];

// 점검작업 메뉴 트리: 데이터센터 → 업무 → 점검
const TASK_TREE = [
  {
    id: 'dc1',
    label: '나이스 데이터센터',
    icon: 'dc',
    count: 7,
    children: [
      {
        id: 'task-server',
        label: '서버 점검',
        icon: 'folder',
        count: 3,
        children: [
          { id: 'insp-1', label: '서버 및 WEB 점검', icon: 'shield', count: 11 },
          { id: 'insp-2', label: 'WAS 서버 점검', icon: 'shield', count: 5 },
          { id: 'insp-3', label: 'Linux 보안 점검', icon: 'shield', count: 12 },
        ],
      },
      {
        id: 'task-db',
        label: 'DB 점검',
        icon: 'folder',
        count: 2,
        children: [
          { id: 'insp-4', label: 'DB 정기 점검', icon: 'shield', count: 8 },
          { id: 'insp-5', label: 'DB 백업 점검', icon: 'shield', count: 3 },
        ],
      },
      {
        id: 'task-network',
        label: '네트워크 점검',
        icon: 'folder',
        count: 2,
        children: [
          { id: 'insp-6', label: '네트워크 장비 점검', icon: 'shield', count: 6 },
          { id: 'insp-7', label: '방화벽 정책 점검', icon: 'shield', count: 4 },
        ],
      },
    ],
  },
];

/* ── 아이콘 ── */
function NodeIcon({ type }: { type: string }) {
  if (type === 'dc') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/><path d="M14 15v.01M14 18v.01"/>
    </svg>
  );
  if (type === 'folder') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
  if (type === 'server') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  );
  // shield
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

/* ── 트리 노드 ── */
function TreeNode({ node, depth = 0, checkedIds, onToggle, searchQuery }: any) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const isLeaf = !hasChildren;
  const isChecked = checkedIds.has(node.id);

  if (searchQuery) {
    if (isLeaf && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) return null;
    if (hasChildren) {
      const hasMatch = node.children.some((c: any) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.children?.some((cc: any) => cc.label.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (!hasMatch) return null;
    }
  }

  return (
    <div>
      <div
        className={`flex items-center gap-[5px] py-[5px] cursor-pointer rounded-[4px] transition-colors
          ${isChecked && isLeaf ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fafc]'}`}
        style={{ paddingLeft: depth * 20 + 8, paddingRight: 8 }}
        onClick={() => {
          if (hasChildren) setOpen(!open);
          else onToggle(node.id);
        }}
      >
        <div
          className={`w-[15px] h-[15px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors
            ${isLeaf && isChecked ? 'bg-[#0056a4] border-[#0056a4]' : 'border-[#cbd5e1] bg-white'}`}
        >
          {isLeaf && isChecked && (
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {hasChildren && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
            className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M3.5 2L6.5 5L3.5 8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}

        <NodeIcon type={node.icon} />

        <span className={`text-[12px] flex-1 min-w-0 truncate ${isLeaf && isChecked ? 'font-semibold text-[#0056a4]' : hasChildren ? 'font-medium text-[#334155]' : 'text-[#334155]'}`}>
          {node.label}
        </span>

        {node.count != null && (
          <span className="text-[10px] font-semibold text-[#0056a4] bg-[#dbeafe] rounded-[4px] px-[5px] py-[1px] shrink-0">
            {node.count}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <div className="relative">
          <div
            className="absolute border-l border-[#e2e8f0]"
            style={{ left: depth * 20 + 19, top: 0, bottom: 8 }}
          />
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} checkedIds={checkedIds} onToggle={onToggle} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  );
}

interface WidgetPanelProps {
  widget: { id: string; type: string; title?: string };
  onUpdateBlock: (id: string, fields: any) => void;
}

export function WidgetPanel({ widget, onUpdateBlock }: WidgetPanelProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(['insp-1']));
  const [search, setSearch] = useState('');
  const [sourceTab, setSourceTab] = useState<'system' | 'task'>('task');

  const handleToggle = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const treeData = sourceTab === 'system' ? SYSTEM_TREE : TASK_TREE;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 상세 옵션 */}
      <div className="px-4 pt-3 pb-2 border-b border-[#e8ecf0] flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-[#64748b]">위젯 이름</div>

        {/* 이름 입력 */}
        <div>
          <input
            type="text"
            value={widget.title || ''}
            onChange={e => onUpdateBlock(widget.id, { title: e.target.value })}
            placeholder="위젯 제목을 입력하세요"
            className="w-full text-[12px] border border-[#e2e8f0] rounded-[5px] px-2.5 py-[6px] outline-none focus:border-[#0056a4] text-[#334155] bg-white"
          />
        </div>

        {/* 폰트 사이즈 */}
        <div>
          <div className="text-[10px] text-[#94a3b8] mb-1">폰트 사이즈</div>
          <div className="flex gap-[3px]">
            {[
              { id: 'h1', label: 'H', sub: '1', size: 14 },
              { id: 'h2', label: 'H', sub: '2', size: 13 },
              { id: 'h3', label: 'H', sub: '3', size: 12 },
              { id: 'h4', label: 'H', sub: '4', size: 11 },
              { id: 'h5', label: 'H', sub: '5', size: 10 },
              { id: undefined, label: 'P', sub: null, size: 11 },
            ].map(opt => {
              const active = (widget as any).titleSubtype === opt.id;
              return (
                <button
                  key={opt.sub || 'p'}
                  onClick={() => onUpdateBlock(widget.id, { titleSubtype: opt.id || null })}
                  title={opt.sub ? `제목 ${opt.sub}` : '본문'}
                  className={`flex-1 py-[5px] rounded-[4px] flex items-center justify-center transition-colors
                    ${active
                      ? 'bg-[#0056a4] text-white'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'}`}
                >
                  <span style={{ fontSize: opt.size, fontWeight: 700, lineHeight: 1 }}>{opt.label}</span>
                  {opt.sub && <span style={{ fontSize: 8, fontWeight: 700, lineHeight: 1, marginTop: 'auto' }}>{opt.sub}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 대상 선택 */}
      <div className="px-4 pt-3 pb-1">
        <div className="text-[11px] font-semibold text-[#64748b] mb-2">대상 선택</div>
        <div className="flex gap-1">
          {([
            { id: 'system' as const, label: '시스템', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
            )},
            { id: 'task' as const, label: '점검작업', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            )},
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSourceTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-[5px] py-[7px] rounded-[5px] text-[11px] font-medium border transition-colors
                ${sourceTab === tab.id
                  ? 'bg-[#0056a4] text-white border-[#0056a4]'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#cbd5e1]'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="px-3 pt-2 pb-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색..."
            className="flex-1 text-[12px] border border-[#e2e8f0] rounded-[5px] px-2.5 py-[6px] outline-none focus:border-[#0056a4] text-[#334155] bg-white"
          />
          <button className="w-[30px] h-[30px] rounded-[5px] bg-[#0056a4] flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 트리 */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {treeData.map(node => (
          <TreeNode key={node.id} node={node} checkedIds={checkedIds} onToggle={handleToggle} searchQuery={search} />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="px-3 py-3 border-t border-[#e8ecf0] flex gap-2">
        <button className="flex-1 py-[7px] rounded-[5px] bg-[#0056a4] text-white text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-[#004a8f] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          확인
        </button>
        <button className="flex-1 py-[7px] rounded-[5px] bg-white text-[#64748b] text-[12px] font-medium border border-[#e2e8f0] flex items-center justify-center gap-1 hover:bg-[#f8fafc] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          취소
        </button>
      </div>
    </div>
  );
}
