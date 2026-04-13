'use client';

import { useState, useRef, useEffect } from 'react';
import { BLOCK_FORMATS } from './wordConstants';

export default function FloatingToolbar() {
  const [pos,       setPos]       = useState(null);
  const [blockFmt,  setBlockFmt]  = useState('p');
  const [fmtOpen,   setFmtOpen]   = useState(false);
  const [textColor, setTextColor] = useState('#ffffff');
  const [hlColor,   setHlColor]   = useState('#fef08a');
  const savedRangeRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setPos(null);
        setFmtOpen(false);
        return;
      }
      const node = sel.anchorNode;
      const el = node?.nodeType === 3 ? node.parentElement : node;
      if (!el?.closest('[contenteditable]')) { setPos(null); setFmtOpen(false); return; }
      const range = sel.getRangeAt(0);
      const rect  = range.getBoundingClientRect();
      if (!rect.width && !rect.height) { setPos(null); return; }
      savedRangeRef.current = range.cloneRange();
      const editableEl = el?.closest('[contenteditable]');
      if (editableEl) {
        const fs = editableEl.style.fontSize;
        const detected = BLOCK_FORMATS.find(f => f.fontSize === fs)?.value || 'p';
        setBlockFmt(detected);
      }
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  if (!pos) return null;

  const restoreSelection = () => {
    const r = savedRangeRef.current;
    if (!r) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  };
  const exec = (cmd, val = null) => { restoreSelection(); document.execCommand(cmd, false, val); };
  const mb = (fn) => (e) => { e.preventDefault(); fn(); };
  const saveRange = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };

  const applyFmt = (fmt) => {
    const r = savedRangeRef.current;
    if (!r) return;
    const node = r.startContainer;
    const el = (node?.nodeType === 3 ? node.parentElement : node)?.closest('[contenteditable]');
    if (el) {
      el.style.fontSize   = fmt.fontSize;
      el.style.fontWeight = fmt.fontWeight;
    }
    setBlockFmt(fmt.value);
    setFmtOpen(false);
  };

  const Btn = ({ children, title, onMD }) => (
    <button title={title} onMouseDown={mb(onMD)}
      className="w-7 h-7 flex items-center justify-center rounded text-[13px] text-white hover:bg-white/15 transition-colors shrink-0">
      {children}
    </button>
  );
  const Sep = () => <div className="w-px h-4 bg-white/20 mx-0.5 shrink-0" />;

  const currentFmt = BLOCK_FORMATS.find(f => f.value === blockFmt) || BLOCK_FORMATS[0];

  return (
    <div
      style={{ position: 'fixed', left: pos.x, top: pos.y - 10, transform: 'translate(-50%, -100%)', zIndex: 9999 }}
      onMouseDown={(e) => e.preventDefault()}
      className="bg-[#1a222b] rounded-[8px] shadow-[0_6px_24px_rgba(0,0,0,0.40)] flex items-center gap-0.5 px-2 py-[5px]"
    >
      <div className="relative mr-1">
        <button
          onMouseDown={mb(() => setFmtOpen(o => !o))}
          className="h-6 px-2 text-[11px] bg-white/10 text-white rounded flex items-center gap-1 hover:bg-white/20 shrink-0 whitespace-nowrap"
        >
          <span className="font-bold text-[10px]">{currentFmt.icon}</span>
          <span>{currentFmt.label}</span>
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="shrink-0 ml-0.5">
            <path d="M1 1l3 3 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {fmtOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a222b] border border-white/10 rounded-[6px] shadow-xl overflow-hidden min-w-[140px]">
            {BLOCK_FORMATS.map(f => (
              <button
                key={f.value}
                onMouseDown={mb(() => applyFmt(f))}
                className={`w-full px-2 py-[6px] text-left text-white hover:bg-white/15 transition-colors flex items-center gap-2 ${f.value === blockFmt ? 'bg-white/10' : ''}`}
              >
                <span className="w-7 h-5 flex items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white shrink-0">{f.icon}</span>
                <span className="text-[12px]">{f.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Sep />
      <Btn title="굵게"   onMD={() => exec('bold')}><strong className="font-bold">B</strong></Btn>
      <Btn title="기울임" onMD={() => exec('italic')}><em>I</em></Btn>
      <Btn title="밑줄"   onMD={() => exec('underline')}><span className="underline">U</span></Btn>
      <Btn title="취소선" onMD={() => exec('strikeThrough')}><span className="line-through">S</span></Btn>
      <Sep />

      <label title="글자 색상" onMouseDown={saveRange}
        className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 cursor-pointer shrink-0">
        <div className="flex flex-col items-center gap-[3px] pointer-events-none">
          <span className="text-[12px] font-bold text-white leading-none">A</span>
          <span className="w-[14px] h-[2.5px] rounded-sm" style={{ background: textColor }} />
        </div>
        <input type="color" value={textColor}
          onChange={(e) => { setTextColor(e.target.value); exec('foreColor', e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>

      <label title="형광펜" onMouseDown={saveRange}
        className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 cursor-pointer shrink-0">
        <span className="text-[10px] font-bold leading-none px-[3px] py-[1px] rounded-sm pointer-events-none"
          style={{ background: hlColor, color: '#1a222b' }}>HI</span>
        <input type="color" value={hlColor}
          onChange={(e) => { setHlColor(e.target.value); exec('hiliteColor', e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>
      <Btn title="형광펜 제거" onMD={() => exec('hiliteColor', 'transparent')}>
        <span className="text-[10px] font-bold leading-none px-[3px] py-[1px] rounded-sm relative"
          style={{ background: '#fef08a', color: '#1a222b' }}>
          HI
          <span className="absolute inset-0 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>
        </span>
      </Btn>

      <Sep />
      <Btn title="왼쪽 정렬"   onMD={() => exec('justifyLeft')}>
        <svg width="13" height="11" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M1 4h8M1 7h12M1 10h8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </Btn>
      <Btn title="가운데 정렬" onMD={() => exec('justifyCenter')}>
        <svg width="13" height="11" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M3 4h8M1 7h12M3 10h8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </Btn>
      <Btn title="오른쪽 정렬" onMD={() => exec('justifyRight')}>
        <svg width="13" height="11" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M5 4h8M1 7h12M5 10h8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </Btn>
    </div>
  );
}
