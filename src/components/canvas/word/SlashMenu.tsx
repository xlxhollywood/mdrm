'use client';

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { PLUS_MENU_ITEMS, HEADING_FORMATS } from './wordConstants';

const ALL_ITEMS = [
  ...HEADING_FORMATS.filter(f => f.subtype).map(f => ({
    id: f.subtype,
    label: f.label,
    icon: f.subtype.toUpperCase(),
    type: 'textSize',
    subtype: f.subtype,
  })),
  ...PLUS_MENU_ITEMS.filter(i => i.id !== 'textSize').map(i => ({
    id: i.id,
    label: i.label,
    icon: i.icon,
    type: i.id,
    subtype: null,
  })),
];

const SlashMenu = forwardRef(function SlashMenu({ anchorRect, query, onSelect, onClose }, ref) {
  const [activeIdx, setActiveIdx] = useState(0);
  const menuRef      = useRef(null);
  const activeItemRef = useRef(null);

  const filtered = query
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ITEMS;

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  useImperativeHandle(ref, () => ({
    navigate(key) {
      setActiveIdx(prev => {
        if (key === 'ArrowDown') return Math.min(prev + 1, filtered.length - 1);
        if (key === 'ArrowUp')   return Math.max(prev - 1, 0);
        return prev;
      });
    },
    select() {
      const item = filtered[activeIdx];
      if (item) { onSelect(item.type, item.subtype); return true; }
      return false;
    },
  }), [filtered, activeIdx, onSelect]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: anchorRect.left,
        top: anchorRect.bottom + 4,
        zIndex: 9999,
      }}
      className="bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] py-1 min-w-[200px] max-h-[300px] overflow-y-auto"
    >
      {filtered.length === 0 && (
        <div className="px-3 py-2 text-[12px] text-[#8c959e]">결과 없음</div>
      )}
      {filtered.map((item, idx) => (
        <button
          key={item.id}
          ref={idx === activeIdx ? activeItemRef : null}
          onMouseDown={e => { e.preventDefault(); onSelect(item.type, item.subtype); }}
          className={`w-full px-3 py-[6px] text-left text-[13px] text-[#1a222b] flex items-center gap-2.5 transition-colors ${
            idx === activeIdx ? 'bg-[#f0f4ff]' : 'hover:bg-[#f5f5f5]'
          }`}
        >
          <span className="w-5 text-center text-[13px] shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
});

export default SlashMenu;
