'use client';

import { useEffect, useRef } from 'react';

const LAYOUTS = [1, 2, 3, 4];

function ColumnPreview({ cols }) {
  return (
    <div className="flex gap-[3px] w-[52px] h-[34px]">
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="flex-1 bg-[#d9dfe5] rounded-[2px] group-hover:bg-[#b3c8e8] transition-colors" />
      ))}
    </div>
  );
}

export default function LayoutColumnPicker({ anchorRect, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey   = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown',   onKey);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: anchorRect.right + 4, top: anchorRect.top, zIndex: 9999 }}
      className="bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-3"
    >
      <div className="text-[11px] text-[#5b646f] mb-2">열 개수 선택</div>
      <div className="flex gap-2">
        {LAYOUTS.map(cols => (
          <button
            key={cols}
            onClick={() => { onSelect(cols); onClose(); }}
            className="group flex flex-col items-center gap-[6px] p-2 rounded-[6px] hover:bg-[#f0f4ff] transition-colors"
          >
            <ColumnPreview cols={cols} />
            <span className="text-[11px] text-[#5b646f] group-hover:text-[#0056a4] transition-colors">{cols}열</span>
          </button>
        ))}
      </div>
    </div>
  );
}
