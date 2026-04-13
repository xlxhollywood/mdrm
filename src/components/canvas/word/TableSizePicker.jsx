'use client';

import { useState, useRef, useEffect } from 'react';

const MAX_R = 8, MAX_C = 8;

export default function TableSizePicker({ anchorRect, onSelect, onClose }) {
  const [hover, setHover] = useState({ rows: 1, cols: 1 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (containerRef.current && !containerRef.current.contains(e.target)) onClose(); };
    const onKey   = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown',   onKey);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: anchorRect.left, top: anchorRect.bottom + 4, zIndex: 9999 }}
      className="bg-white border border-[#d9dfe5] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-3"
    >
      <div className="flex flex-col gap-[3px]">
        {Array.from({ length: MAX_R }, (_, r) => (
          <div key={r} className="flex gap-[3px]">
            {Array.from({ length: MAX_C }, (_, c) => (
              <div
                key={c}
                onMouseEnter={() => setHover({ rows: r + 1, cols: c + 1 })}
                onClick={() => onSelect(hover.rows, hover.cols)}
                className={`w-5 h-5 border rounded-[2px] cursor-pointer transition-colors ${
                  r < hover.rows && c < hover.cols
                    ? 'bg-[#dce8ff] border-[#3571ce]'
                    : 'bg-white border-[#d9dfe5] hover:border-[#a0b4d0]'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-center text-[12px] text-[#5b646f] mt-2">
        {hover.rows} × {hover.cols}
      </div>
    </div>
  );
}
