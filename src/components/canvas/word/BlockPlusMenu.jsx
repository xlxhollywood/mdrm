'use client';

import { useState, useRef, useEffect } from 'react';
import { PLUS_MENU_ITEMS, HEADING_FORMATS } from './wordConstants';

export default function BlockPlusMenu({ blockIdx, anchorRect, onInsert, onClose, onTablePick }) {
  const [showSub, setShowSub] = useState(false);
  const menuRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const onKey   = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const openSub  = (id) => { clearTimeout(timerRef.current); setShowSub(id); };
  const closeSub = ()   => { timerRef.current = setTimeout(() => setShowSub(false), 120); };

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: anchorRect.right + 4, top: anchorRect.top, zIndex: 9999 }}
      className="bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] py-1 min-w-[190px]"
    >
      {PLUS_MENU_ITEMS.map(item => (
        <div key={item.id} className="relative"
          onMouseEnter={() => item.hasSub ? openSub(item.id) : closeSub()}
          onMouseLeave={() => item.hasSub && closeSub()}
        >
          <button
            onClick={(e) => {
              if (item.id === 'table') { onTablePick?.(blockIdx, e.currentTarget.getBoundingClientRect()); onClose(); return; }
              if (!item.hasSub) { onInsert(blockIdx, item.id, null); onClose(); }
            }}
            className="w-full px-3 py-[6px] text-left text-[13px] text-[#1a222b] hover:bg-[#f5f5f5] flex items-center gap-2.5 transition-colors"
          >
            <span className="w-5 text-center text-[13px] shrink-0">{item.icon}</span>
            <span>{item.label}</span>
            {item.hasSub && <span className="ml-auto text-[#5b646f] text-[11px]">›</span>}
          </button>
          {item.hasSub && showSub === item.id && (
            <div
              onMouseEnter={() => openSub(item.id)}
              onMouseLeave={closeSub}
              className="absolute left-full top-0 bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] py-1 min-w-[130px]"
            >
              {HEADING_FORMATS.map(f => (
                <button
                  key={f.subtype || 'p'}
                  onClick={() => { onInsert(blockIdx, 'textSize', f.subtype); onClose(); }}
                  className="w-full px-3 py-[5px] text-left hover:bg-[#f5f5f5] transition-colors text-[#1a222b]"
                  style={{ fontSize: f.fontSize, fontWeight: f.fontWeight }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
