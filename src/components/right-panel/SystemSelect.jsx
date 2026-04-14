'use client';

import { useState } from 'react';
import { imgDatacenter } from '@/lib/assets';

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

const IcoFolder = ({ color = '#5b646f' }) => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
    <path d="M0 2a1 1 0 011-1h4l1.5 1.5H13a1 1 0 011 1V11a1 1 0 01-1 1H1a1 1 0 01-1-1V2z" fill={color} />
  </svg>
);

export const IcoChevron = ({ open }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
    className={`transition-transform ${open ? 'rotate-90' : ''}`}>
    <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="#5b646f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

export function SystemSelectSection({ cfg, onCfgChange }) {
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
