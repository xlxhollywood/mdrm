'use client';

import { useState, useRef, useEffect } from 'react';
import { BLOCK_FORMATS } from '../wordConstants';

const COLOR_PRESETS = ['#1a222b','#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff'];
const HL_PRESETS    = ['#fef08a','#fce7f3','#dbeafe','#d1fae5','#ede9fe','#fee2e2','#fef9c3','#e5e7eb'];

export default function FloatingToolbar() {
  const [pos,       setPos]       = useState(null);
  const [blockFmt,  setBlockFmt]  = useState('p');
  const [fmtOpen,   setFmtOpen]   = useState(false);
  const [textColor, setTextColor] = useState('#1a222b');
  const [hlColor,   setHlColor]   = useState('#fef08a');
  const [colorMenu, setColorMenu] = useState(null); // 'text' | 'hl' | null
  const [linkInput, setLinkInput] = useState(null);
  const linkOpenRef   = useRef(false);
  const colorOpenRef  = useRef(false);
  const savedRangeRef = useRef(null);
  const linkInputRef  = useRef(null);

  useEffect(() => {
    const update = () => {
      if (linkOpenRef.current || colorOpenRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setPos(null); setFmtOpen(false); setLinkInput(null); setColorMenu(null);
        return;
      }
      const node = sel.anchorNode;
      const el = (node?.nodeType === 3 ? node.parentElement : node) as HTMLElement | null;
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
    restoreSelection();
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const el = (node?.nodeType === 3 ? node.parentElement : node)?.closest('[contenteditable]');

    // 선택 영역이 전체(또는 비어있으면) → 블록 전체 스타일 변경
    if (!el || range.collapsed || (range.toString().trim() === (el.textContent || '').trim())) {
      if (el) { el.style.fontSize = fmt.fontSize; el.style.fontWeight = fmt.fontWeight; }
    } else {
      // 선택된 텍스트에만 인라인 스타일 적용
      const span = document.createElement('span');
      span.style.fontSize = fmt.fontSize;
      span.style.fontWeight = fmt.fontWeight;
      try {
        range.surroundContents(span);
      } catch (_) {
        // 복잡한 선택 시 fallback: execCommand
        document.execCommand('fontSize', false, '7');
        el?.querySelectorAll('font[size="7"]').forEach(font => {
          font.removeAttribute('size');
          font.style.fontSize = fmt.fontSize;
          font.style.fontWeight = fmt.fontWeight;
        });
      }
    }
    setBlockFmt(fmt.value);
    setFmtOpen(false);
  };

  const applyLink = (url) => {
    linkOpenRef.current = false;
    restoreSelection();
    if (url) {
      let href = url;
      if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
      document.execCommand('createLink', false, href);
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        const link = el?.closest('a') || el?.querySelector('a');
        if (link) { link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = '#0056a4'; link.style.textDecoration = 'underline'; }
      }
    }
    setLinkInput(null);
  };

  const removeTextColor = () => {
    restoreSelection();
    document.execCommand('removeFormat');
    colorOpenRef.current = false;
    setColorMenu(null);
  };

  const removeHighlight = () => {
    restoreSelection();
    const selObj = window.getSelection();
    if (!selObj?.rangeCount) return;
    const range = selObj.getRangeAt(0);
    const anchor = selObj.anchorNode;
    const editable = (anchor?.nodeType === 3 ? anchor.parentElement : anchor)?.closest('[contenteditable]');
    if (editable) {
      [...editable.querySelectorAll('span')].forEach(span => {
        if ((span.style.backgroundColor || span.style.background) && range.intersectsNode(span)) {
          span.style.backgroundColor = '';
          span.style.background = '';
          const s = span.getAttribute('style') ?? '';
          if (!s.replace(/\s|;/g, '')) span.removeAttribute('style');
        }
      });
    }
    colorOpenRef.current = false;
    setColorMenu(null);
  };

  const Btn = ({ children, title, onMD }) => (
    <button title={title} onMouseDown={mb(onMD)}
      className="w-7 h-7 flex items-center justify-center rounded text-[13px] text-white hover:bg-white/15 transition-colors shrink-0">
      {children}
    </button>
  );
  const Sep = () => <div className="w-px h-4 bg-white/20 mx-0.5 shrink-0" />;

  const currentFmt = BLOCK_FORMATS.find(f => f.value === blockFmt) || BLOCK_FORMATS[0];

  const ColorPalette = ({ colors, onPick, onRemove, removeLabel }) => (
    <div
      onMouseDown={e => e.stopPropagation()}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1a222b] border border-white/15 rounded-[8px] shadow-xl p-2.5"
    >
      <div className="flex flex-wrap gap-[5px] w-[140px]">
        {colors.map(color => (
          <button
            key={color}
            onMouseDown={e => e.preventDefault()}
            onClick={() => onPick(color)}
            className="w-[28px] h-[28px] rounded-[4px] border border-white/15 hover:scale-110 transition-transform shrink-0"
            style={{ background: color }}
          />
        ))}
      </div>
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={onRemove}
        className="mt-2 w-full text-[11px] text-white/50 hover:text-red-400 text-left px-0.5"
      >{removeLabel}</button>
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', left: pos.x, top: pos.y - 10, transform: 'translate(-50%, -100%)', zIndex: 9999 }}
      onMouseDown={(e) => e.preventDefault()}
      className="bg-[#1a222b] rounded-[8px] shadow-[0_6px_24px_rgba(0,0,0,0.40)] flex items-center gap-0.5 px-2 py-[5px]"
    >
      {/* 블록 포맷 */}
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
      <Btn title="하이퍼링크" onMD={() => {
        saveRange();
        const r = savedRangeRef.current;
        if (!r) return;
        const node = r.startContainer;
        const el = (node?.nodeType === 3 ? node.parentElement : node);
        const existingLink = el?.closest('a');
        if (existingLink) {
          restoreSelection();
          document.execCommand('unlink');
        } else {
          linkOpenRef.current = true;
          setLinkInput('');
          setTimeout(() => linkInputRef.current?.focus(), 10);
        }
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M6 8l2-2M5 9.5L3.5 11a1.5 1.5 0 01-2.1-2.1L3 7.3a1.5 1.5 0 012.1 0M9 4.5l1.5-1.5a1.5 1.5 0 012.1 2.1L11 6.7a1.5 1.5 0 01-2.1 0" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </Btn>
      <Sep />

      {/* 글자 색상 */}
      <div className="relative">
        <button title="글자 색상" onMouseDown={mb(() => {
          saveRange();
          colorOpenRef.current = colorMenu !== 'text';
          setColorMenu(colorMenu === 'text' ? null : 'text');
        })}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 cursor-pointer shrink-0"
        >
          <div className="flex flex-col items-center gap-[3px] pointer-events-none">
            <span className="text-[12px] font-bold text-white leading-none">A</span>
            <span className="w-[14px] h-[2.5px] rounded-sm" style={{ background: textColor }} />
          </div>
        </button>
        {colorMenu === 'text' && (
          <ColorPalette
            colors={COLOR_PRESETS}
            onPick={(c) => { setTextColor(c); exec('foreColor', c); colorOpenRef.current = false; setColorMenu(null); }}
            onRemove={removeTextColor}
            removeLabel="색상 제거"
          />
        )}
      </div>

      {/* 형광펜 */}
      <div className="relative">
        <button title="형광펜" onMouseDown={mb(() => {
          saveRange();
          colorOpenRef.current = colorMenu !== 'hl';
          setColorMenu(colorMenu === 'hl' ? null : 'hl');
        })}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 cursor-pointer shrink-0"
        >
          <span className="text-[10px] font-bold leading-none px-[3px] py-[1px] rounded-sm pointer-events-none"
            style={{ background: hlColor, color: '#1a222b' }}>HI</span>
        </button>
        {colorMenu === 'hl' && (
          <ColorPalette
            colors={HL_PRESETS}
            onPick={(c) => { setHlColor(c); exec('hiliteColor', c); colorOpenRef.current = false; setColorMenu(null); }}
            onRemove={removeHighlight}
            removeLabel="형광펜 제거"
          />
        )}
      </div>

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

      {/* 하이퍼링크 인라인 입력 */}
      {linkInput !== null && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1a222b] border border-white/15 rounded-[8px] shadow-xl p-2 flex items-center gap-1.5"
          onClick={e => e.stopPropagation()}
        >
          <input
            ref={linkInputRef}
            type="text"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            placeholder="URL 입력 후 Enter..."
            className="w-[220px] h-7 px-2 text-[12px] bg-white/10 text-white rounded outline-none placeholder:text-white/30"
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') { e.preventDefault(); applyLink(linkInput); }
              if (e.key === 'Escape') { e.preventDefault(); linkOpenRef.current = false; setLinkInput(null); }
            }}
          />
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => applyLink(linkInput)}
            className="h-7 px-2.5 text-[11px] text-white bg-[#0056a4] hover:bg-[#004a8f] rounded transition-colors shrink-0"
          >확인</button>
        </div>
      )}
    </div>
  );
}
