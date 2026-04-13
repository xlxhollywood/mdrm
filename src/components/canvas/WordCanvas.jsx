'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import WidgetPreview from '../widgets/WidgetPreview';
import WidgetPlaceholder from './WidgetPlaceholder';

/* 용지 크기 (px, portrait 기준) */
const PAPER_SIZES = {
  A4:     { w: 794,  h: 1123 },
  A3:     { w: 1123, h: 1587 },
  B5:     { w: 669,  h: 945  },
  Letter: { w: 816,  h: 1056 },
  Legal:  { w: 816,  h: 1344 },
};
const MM_TO_PX = 3.7795;

/* ── 드래그 핸들 아이콘 ── */
function DragHandleIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      <circle cx="3"  cy="2.5"  r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="2.5"  r="1.2" fill="currentColor"/>
      <circle cx="3"  cy="7"    r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="7"    r="1.2" fill="currentColor"/>
      <circle cx="3"  cy="11.5" r="1.2" fill="currentColor"/>
      <circle cx="7"  cy="11.5" r="1.2" fill="currentColor"/>
    </svg>
  );
}

const BLOCK_FORMATS = [
  { icon: 'T',  label: '일반 텍스트', value: 'p',  fontSize: '13px', fontWeight: 'normal' },
  { icon: 'H1', label: '제목 1',     value: 'h1', fontSize: '30px', fontWeight: 'bold'   },
  { icon: 'H2', label: '제목 2',     value: 'h2', fontSize: '24px', fontWeight: 'bold'   },
  { icon: 'H3', label: '제목 3',     value: 'h3', fontSize: '20px', fontWeight: 'bold'   },
  { icon: 'H4', label: '제목 4',     value: 'h4', fontSize: '16px', fontWeight: 'bold'   },
  { icon: 'H5', label: '제목 5',     value: 'h5', fontSize: '14px', fontWeight: 'bold'   },
];

/* ── 플로팅 서식 툴바 (선택 시 위에 떠오름) ── */
function FloatingToolbar() {
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
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y - 10,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="bg-[#1a222b] rounded-[8px] shadow-[0_6px_24px_rgba(0,0,0,0.40)] flex items-center gap-0.5 px-2 py-[5px]"
    >
      {/* 블록 형식 커스텀 드롭다운 */}
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
                className={`w-full px-2 py-[6px] text-left text-white hover:bg-white/15 transition-colors flex items-center gap-2
                  ${f.value === blockFmt ? 'bg-white/10' : ''}`}
              >
                <span className="w-7 h-5 flex items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white shrink-0">
                  {f.icon}
                </span>
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

      {/* 글자 색상 */}
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

      {/* 형광펜 */}
      <label title="형광펜" onMouseDown={saveRange}
        className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 cursor-pointer shrink-0">
        <span className="text-[10px] font-bold leading-none px-[3px] py-[1px] rounded-sm pointer-events-none"
          style={{ background: hlColor, color: '#1a222b' }}>HI</span>
        <input type="color" value={hlColor}
          onChange={(e) => { setHlColor(e.target.value); exec('hiliteColor', e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>

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

/* ── 텍스트 블록 ── */
function TextBlock({ block, onChange, onDelete, onEnter, onArrow, onBackspaceAtStart, onFocusBlock, onBlurBlock, isBlockActive, allSelected, bulletNumber, onConvertToSubtype, lineHeight, letterSpacing }) {
  const ref = useRef(null);
  const isComposing = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const isList = block.subtype === 'bullet' || block.subtype === 'numbered';
  const isEmpty = isList
    ? !(block.html || '').replace(/<[^>]*>/g, '').trim()
    : !(block.html || '').replace(/<br\s*\/?>/gi, '').trim();
  const showPlaceholder = block.subtype ? isEmpty : (isFocused && isEmpty);

  const placeholderText = {
    bullet: '목록', numbered: '목록', todo: '할 일',
    callout: '내용을 입력하세요...', quote: '인용문을 입력하세요...',
    h1: '제목 1', h2: '제목 2', h3: '제목 3', h4: '제목 4', h5: '제목 5',
  }[block.subtype] || '텍스트를 입력하세요...';

  const headingStyle = {
    h1: { fontSize: '30px', fontWeight: 'bold' },
    h2: { fontSize: '24px', fontWeight: 'bold' },
    h3: { fontSize: '20px', fontWeight: 'bold' },
    h4: { fontSize: '16px', fontWeight: 'bold' },
    h5: { fontSize: '14px', fontWeight: 'bold' },
  }[block.subtype] || {};

  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      const isList = block.subtype === 'bullet' || block.subtype === 'numbered';
      ref.current.innerHTML = block.html || (isList ? '<li></li>' : '');
    }
  }, [block.html]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      if (isList) {
        // 빈 <li>에서 엔터 → 리스트 탈출
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          let node = sel.getRangeAt(0).startContainer;
          while (node && node !== ref.current && node.tagName !== 'LI') node = node.parentElement;
          const currentLi = node?.tagName === 'LI' ? node : null;
          if (currentLi && !currentLi.textContent.trim()) {
            e.preventDefault();
            const isLastLi = !currentLi.nextElementSibling;
            currentLi.remove();
            const hasRemaining = !!ref.current.textContent.trim();
            if (hasRemaining) {
              onChange(block.id, ref.current.innerHTML);
              if (isLastLi) {
                // 마지막 빈 항목에서 엔터 → 일반 텍스트 블록으로 탈출
                onEnter(block.id);
              }
            } else {
              // 리스트 전체가 비어있음 → 일반 텍스트로 변환
              onChange(block.id, '');
              onBackspaceAtStart?.(block.id, '');
            }
          }
          // 비어있지 않으면 브라우저가 <li> 자동 생성
        }
        return;
      }
      e.preventDefault();
      onEnter(block.id);
      return;
    }
    // - + 스페이스 → 글머리 기호 목록 자동 변환
    if (e.key === ' ' && !isComposing.current && !block.subtype) {
      const text = ref.current?.textContent || '';
      if (text === '-') {
        e.preventDefault();
        onConvertToSubtype?.(block.id, 'bullet');
        return;
      }
      if (text === '1.') {
        e.preventDefault();
        onConvertToSubtype?.(block.id, 'numbered');
        return;
      }
    }
    if (e.key === 'Backspace' && !isComposing.current) {
      if (isList) {
        // 리스트 전체가 비어있을 때만 블록 탈출 처리, 나머지는 브라우저에 위임
        if (!ref.current?.textContent?.trim()) {
          e.preventDefault();
          onBackspaceAtStart?.(block.id, block.html || '');
        }
        return;
      }
      const sel = window.getSelection();
      if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return;
      const range = sel.getRangeAt(0);
      const el = ref.current;
      // 커서가 블록 맨 앞인지: startOffset=0 이고 startContainer가 el 자체이거나 el의 첫 텍스트노드 시작
      const node = range.startContainer;
      const offset = range.startOffset;
      const atStart =
        (node === el && offset === 0) ||
        (node.nodeType === Node.TEXT_NODE && offset === 0 && el.firstChild === node) ||
        isEmpty;
      if (atStart) {
        e.preventDefault();
        onBackspaceAtStart?.(block.id, block.html || '');
        return;
      }
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.shiftKey && !e.metaKey && !e.ctrlKey && !isComposing.current) {
      const sel = window.getSelection();
      if (!sel?.rangeCount || !sel.getRangeAt(0).collapsed) return;
      const prevNode   = sel.focusNode;
      const prevOffset = sel.focusOffset;
      const dir        = e.key === 'ArrowLeft' ? 'left' : 'right';
      requestAnimationFrame(() => {
        const next = window.getSelection();
        if (next && document.activeElement === ref.current &&
            next.focusNode === prevNode && next.focusOffset === prevOffset) {
          onArrow(block.id, dir);
        }
      });
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (e.metaKey || e.ctrlKey) && !isComposing.current) {
      e.preventDefault();
      onArrow(block.id, e.key === 'ArrowUp' ? 'first' : 'last', 0);
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isComposing.current) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const caretRect = sel.getRangeAt(0).getBoundingClientRect();
      const elRect    = ref.current.getBoundingClientRect();
      const lineH     = caretRect.height || 20;
      // 빈 블록은 caretRect가 (0,0,0,0)을 반환 — elRect.left를 X 기본값으로
      const zeroRect  = caretRect.top === 0 && caretRect.bottom === 0;
      const caretX    = zeroRect ? elRect.left : (caretRect.left + caretRect.width / 2);

      if (e.key === 'ArrowUp' && (zeroRect || caretRect.top < elRect.top + lineH)) {
        e.preventDefault();
        onArrow(block.id, 'up', caretX);
      } else if (e.key === 'ArrowDown' && (zeroRect || caretRect.bottom > elRect.bottom - lineH)) {
        e.preventDefault();
        onArrow(block.id, 'down', caretX);
      }
    }
  };

  const editableDiv = (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      dir="ltr"
      data-text-id={block.id}
      data-placeholder={showPlaceholder ? placeholderText : undefined}
      className="flex-1 outline-none px-1 py-0.5 cursor-text"
      style={{
        color: block.subtype === 'quote' ? '#5b646f' : '#1a222b',
        fontStyle: block.subtype === 'quote' ? 'italic' : undefined,
        textDecoration: (block.subtype === 'todo' && block.checked) ? 'line-through' : undefined,
        fontSize: '13px',
        lineHeight: lineHeight ?? 1.6,
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        ...headingStyle,
      }}
      onFocus={() => { setIsFocused(true); onFocusBlock?.(); }}
      onBlur={() => { setIsFocused(false); onBlurBlock?.(); }}
      onDragStart={(e) => e.preventDefault()}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; }}
      onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
      onKeyDown={handleKeyDown}
    />
  );

  if (block.subtype === 'bullet' || block.subtype === 'numbered') {
    const Tag = block.subtype === 'bullet' ? 'ul' : 'ol';
    return (
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-text-id={block.id}
        data-placeholder={showPlaceholder ? '목록을 입력하세요...' : undefined}
        className={`outline-none cursor-text pl-5 min-h-[28px] ${block.subtype === 'bullet' ? 'list-disc' : 'list-decimal'}`}
        style={{ fontSize: '13px', color: '#1a222b', lineHeight: lineHeight ?? 1.6, letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined, marginLeft: '-16px' }}
        onFocus={() => { setIsFocused(true); onFocusBlock?.(); }}
        onBlur={() => { setIsFocused(false); onBlurBlock?.(); }}
        onDragStart={e => e.preventDefault()}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
        onInput={e => onChange(block.id, e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
      />
    );
  }
  if (block.subtype === 'quote') {
    return (
      <div className="flex items-stretch min-h-[32px] gap-2 py-0.5">
        <div className="w-[3px] rounded-full shrink-0 bg-[#d9dfe5]" />
        {editableDiv}
      </div>
    );
  }
  if (block.subtype === 'callout') {
    return (
      <div className="flex items-start min-h-[32px] gap-2 px-3 py-2 rounded-[8px] bg-[#f0f4ff] border border-[#c5d3f0]">
        <span className="text-[15px] leading-[1.8] shrink-0 select-none">💡</span>
        {editableDiv}
      </div>
    );
  }
  return (
    <div className="flex items-start min-h-[32px]">
      {editableDiv}
    </div>
  );
}

/* ── 할일 목록 블록 ── */
function TodoListBlock({ block, onUpdateBlock, onEnterAfterBlock, onBackspaceAtStart, onFocusBlock, lineHeight, letterSpacing }) {
  const items = block.items ?? [{ id: `ti-0-${block.id}`, html: block.html || '', checked: block.checked || false }];
  const itemRefs = useRef({});
  const pendingItemFocus = useRef(null);

  useEffect(() => {
    if (!pendingItemFocus.current) return;
    const { itemId } = pendingItemFocus.current;
    pendingItemFocus.current = null;
    const el = itemRefs.current[itemId];
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    r.setStart(el, 0);
    r.collapse(true);
    sel.addRange(r);
  }, [items]);

  const updateItems = (newItems) => onUpdateBlock(block.id, { items: newItems });

  const handleItemEnter = (e, idx) => {
    e.preventDefault();
    const item = items[idx];
    const el = itemRefs.current[item.id];
    const isEmpty = !el?.textContent?.trim();
    const isLast = idx === items.length - 1;

    if (isEmpty) {
      if (items.length === 1) {
        onBackspaceAtStart?.(block.id, '');
      } else if (isLast) {
        const newItems = items.filter((_, i) => i !== idx);
        updateItems(newItems);
        onEnterAfterBlock?.(block.id);
      } else {
        const newItems = items.filter((_, i) => i !== idx);
        updateItems(newItems);
      }
      return;
    }
    const newItem = { id: `ti-${Date.now()}`, html: '', checked: false };
    const newItems = [...items];
    newItems.splice(idx + 1, 0, newItem);
    updateItems(newItems);
    pendingItemFocus.current = { itemId: newItem.id };
  };

  const handleItemBackspace = (e, idx) => {
    const item = items[idx];
    const el = itemRefs.current[item.id];
    const isEmpty = !el?.textContent?.trim();
    if (!isEmpty) return;

    e.preventDefault();
    if (items.length === 1) {
      onBackspaceAtStart?.(block.id, '');
    } else {
      const newItems = items.filter((_, i) => i !== idx);
      updateItems(newItems);
      const focusIdx = idx > 0 ? idx - 1 : 0;
      pendingItemFocus.current = { itemId: newItems[focusIdx].id };
    }
  };

  const handleToggle = (item) => {
    updateItems(items.map(it => it.id === item.id ? { ...it, checked: !it.checked } : it));
  };

  return (
    <div>
      {items.map((item, idx) => {
        const isItemEmpty = !item.html?.replace(/<br\s*\/?>/gi, '').trim();
        return (
          <div key={item.id} className="flex items-start gap-2 min-h-[28px]">
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleToggle(item); }}
              className="mt-[5px] shrink-0 w-[15px] h-[15px] rounded border-[1.5px] flex items-center justify-center transition-colors"
              style={{ borderColor: item.checked ? '#0056a4' : '#5b646f', background: item.checked ? '#0056a4' : 'white' }}
            >
              {item.checked && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div
              ref={el => {
                if (el) {
                  itemRefs.current[item.id] = el;
                  if (!el.dataset.init) { el.dataset.init = '1'; el.innerHTML = item.html || ''; }
                }
              }}
              contentEditable
              suppressContentEditableWarning
              data-text-id={idx === 0 ? block.id : undefined}
              data-placeholder={isItemEmpty ? '할 일을 입력하세요...' : undefined}
              className="flex-1 outline-none px-1 py-0.5 cursor-text"
              style={{
                color: '#1a222b',
                textDecoration: item.checked ? 'line-through' : undefined,
                fontSize: '13px',
                lineHeight: lineHeight ?? 1.6,
                letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
              }}
              onFocus={onFocusBlock}
              onDragStart={e => e.preventDefault()}
              onInput={e => {
                const el = e.currentTarget;
                updateItems(items.map(it => it.id === item.id ? { ...it, html: el.innerHTML } : it));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) handleItemEnter(e, idx);
                else if (e.key === 'Backspace') handleItemBackspace(e, idx);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── 위젯 블록 ── */
function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType    = cfg.viewType   || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);
  const showBorder  = cfg.showBorder !== false;
  const showLabel   = cfg.showLabel  !== false;

  return (
    <div className="flex items-start">
      <div
        className={`relative cursor-pointer rounded-[10px]
          ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
        onClick={(e) => { e.stopPropagation(); onClick(block.instanceId, widgetDef); }}
      >
        {showPreview
          ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} showBorder={showBorder} showLabel={showLabel} />
          : <WidgetPlaceholder widgetDef={widgetDef} />}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity mt-2"
      >×</button>
    </div>
  );
}

/* ── 표 블록 ── */
function TableBlock({ block, onUpdateBlock }) {
  const { rows = 3, cols = 3, cells = {} } = block;
  return (
    <div className="py-1 overflow-x-auto">
      <table className="border-collapse">
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => {
                const key = `${r},${c}`;
                const isHeader = r === 0;
                return (
                  <td key={c} className={`border border-[#d9dfe5] px-2 py-1 min-w-[80px] ${isHeader ? 'bg-[#f5f5f5]' : ''}`}>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className={`outline-none text-[13px] min-h-[20px] ${isHeader ? 'font-semibold' : ''}`}
                      style={{ color: '#1a222b' }}
                      onInput={e => onUpdateBlock(block.id, { cells: { ...cells, [key]: e.currentTarget.innerHTML } })}
                      dangerouslySetInnerHTML={{ __html: cells[key] || '' }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── 블록 + 메뉴 ── */
const PLUS_MENU_ITEMS = [
  { id: 'textSize', label: '텍스트 크기 조정', icon: 'T', hasSub: true },
  { id: 'bullet',   label: '글머리 기호 목록', icon: '•' },
  { id: 'numbered', label: '번호 매기기 목록', icon: '1.' },
  { id: 'todo',     label: '할일 목록',        icon: '☐' },
  { id: 'callout',  label: '콜아웃',           icon: '💡' },
  { id: 'quote',    label: '인용',             icon: '❝' },
  { id: 'table',    label: '표',               icon: '⊞' },
];

const HEADING_FORMATS = [
  { label: '일반 텍스트', subtype: null,  fontSize: '13px', fontWeight: 'normal' },
  { label: '제목 1',      subtype: 'h1',  fontSize: '22px', fontWeight: 'bold'   },
  { label: '제목 2',      subtype: 'h2',  fontSize: '18px', fontWeight: 'bold'   },
  { label: '제목 3',      subtype: 'h3',  fontSize: '15px', fontWeight: 'bold'   },
  { label: '제목 4',      subtype: 'h4',  fontSize: '13px', fontWeight: 'bold'   },
  { label: '제목 5',      subtype: 'h5',  fontSize: '12px', fontWeight: 'bold'   },
];

function BlockPlusMenu({ blockIdx, anchorRect, onInsert, onClose }) {
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
            onClick={() => { if (!item.hasSub) { onInsert(blockIdx, item.id, null); onClose(); } }}
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

/* ── Word 캔버스 ── */
export default function WordCanvas({
  docBlocks, config, selectedWidget, docConfig, findWidgetDef,
  onCardClick, onDeleteBlock, onUpdateText, onDeselectWidget, onReorderBlocks, onInsertText, onDeleteBlocksInRange,
  onInsertBlock, onUpdateBlock,
}) {
  const paper = PAPER_SIZES[docConfig.paperSize] || PAPER_SIZES.A4;
  const isLand = docConfig.orientation === 'landscape';
  const docW = isLand ? paper.h : paper.w;
  const docH = isLand ? paper.w : paper.h;
  const m   = docConfig.margins;
  const pad = `${Math.round(m.top * MM_TO_PX)}px ${Math.round(m.right * MM_TO_PX)}px ${Math.round(m.bottom * MM_TO_PX)}px ${Math.round(m.left * MM_TO_PX)}px`;

  const pendingFocusRef  = useRef(null); // { id, position: 'start'|'end' } or string id
  const didInitFocus     = useRef(false);

  // 최초 마운트 시 첫 텍스트 블록 포커스
  useEffect(() => {
    if (didInitFocus.current) return;
    const first = docBlocks.find(b => b.type === 'text');
    if (!first) return;
    const el = document.querySelector(`[data-text-id="${first.id}"]`);
    if (el) { el.focus(); didInitFocus.current = true; }
  });

  const handleArrow = useCallback((blockId, direction, caretX = 0) => {
    let ti;
    if (direction === 'first') {
      ti = docBlocks.findIndex(b => b.type === 'text');
    } else if (direction === 'last') {
      ti = docBlocks.length - 1;
      while (ti >= 0 && docBlocks[ti].type !== 'text') ti--;
    } else {
      const idx = docBlocks.findIndex(b => b.id === blockId);
      const step = (direction === 'up' || direction === 'left') ? -1 : 1;
      ti = idx + step;
      while (ti >= 0 && ti < docBlocks.length && docBlocks[ti].type !== 'text') ti += step;
    }
    if (ti < 0 || ti >= docBlocks.length) return;
    const targetEl = document.querySelector(`[data-text-id="${docBlocks[ti].id}"]`);
    if (!targetEl) return;
    targetEl.focus();

    const sel = window.getSelection();
    sel.removeAllRanges();

    if (direction === 'left' || direction === 'last') {
      // 이전 블록 맨 끝
      const r = document.createRange();
      r.selectNodeContents(targetEl);
      r.collapse(false);
      sel.addRange(r);
    } else if (direction === 'right' || direction === 'first') {
      // 다음 블록 맨 앞
      const r = document.createRange();
      r.setStart(targetEl, 0);
      r.collapse(true);
      sel.addRange(r);
    } else {
      // up/down: X 좌표 유지
      const targetRect = targetEl.getBoundingClientRect();
      const goToEnd = direction === 'up';
      const y = goToEnd ? targetRect.bottom - 4 : targetRect.top + 4;
      const range = document.caretRangeFromPoint?.(caretX, y);
      if (range && targetEl.contains(range.startContainer)) {
        sel.addRange(range);
      } else {
        const r = document.createRange();
        if (goToEnd) { r.selectNodeContents(targetEl); r.collapse(false); }
        else { r.setStart(targetEl, 0); r.collapse(true); }
        sel.addRange(r);
      }
    }
  }, [docBlocks]);

  const handleEnterBlock = useCallback((blockId) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    const newId = `text-${Date.now()}`;
    pendingFocusRef.current = { id: newId, position: 'start' };
    onInsertText(idx, newId);
  }, [docBlocks, onInsertText]);

  const handleBackspaceAtStart = useCallback((blockId, currentHtml) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    const block = docBlocks[idx];

    // 서브타입 있는 빈 블록 → 서브타입만 제거 (일반 텍스트로 변환)
    if (block?.subtype && !currentHtml.replace(/<br\s*\/?>/gi, '').trim()) {
      onUpdateBlock(blockId, { subtype: undefined, checked: undefined, html: '', items: undefined });
      pendingFocusRef.current = { id: blockId, position: 'start' };
      return;
    }

    // 첫 번째 블록이면 아무것도 안 함
    if (idx <= 0) return;
    // 이전 텍스트 블록 찾기
    let ti = idx - 1;
    while (ti >= 0 && docBlocks[ti].type !== 'text') ti--;
    if (ti < 0) return;

    const prevBlock = docBlocks[ti];
    const isEmpty = !currentHtml.replace(/<br\s*\/?>/gi, '').trim();

    if (isEmpty) {
      // 빈 블록 → 그냥 삭제, 이전 블록 끝으로 이동
      pendingFocusRef.current = { id: prevBlock.id, position: 'end' };
      onDeleteBlock(blockId);
    } else {
      // 텍스트 있음 → 이전 블록에 merge
      const prevHtml = prevBlock.html || '';
      // 이전 블록의 순수 텍스트 길이 (커서 위치용)
      const tmp = document.createElement('div');
      tmp.innerHTML = prevHtml;
      const prevTextLen = tmp.textContent.length;

      onUpdateText(prevBlock.id, prevHtml + currentHtml);
      onDeleteBlock(blockId);
      pendingFocusRef.current = { id: prevBlock.id, position: 'offset', charOffset: prevTextLen };
    }
  }, [docBlocks, onDeleteBlock, onUpdateText, onUpdateBlock]);

  const handleInsertBlockFromMenu = useCallback((afterIdx, type, subtype) => {
    if (type === 'textSize') {
      // 현재 블록의 텍스트 크기(subtype)만 변경, 새 블록 삽입 없음
      const currentBlock = docBlocks[afterIdx];
      if (currentBlock) onUpdateBlock(currentBlock.id, { subtype: subtype || undefined });
      return;
    }
    const newId = type === 'table' ? `table-${Date.now()}` : `text-${Date.now()}`;
    let blockDef;
    if (type === 'table') {
      blockDef = { id: newId, type: 'table', rows: 3, cols: 3, cells: {} };
    } else {
      const blockSubtype = type;
      const isListType = blockSubtype === 'bullet' || blockSubtype === 'numbered';
      if (blockSubtype === 'todo') {
        blockDef = { id: newId, type: 'text', subtype: 'todo', items: [{ id: `ti-${Date.now()}`, html: '', checked: false }] };
      } else {
        blockDef = { id: newId, type: 'text', subtype: blockSubtype || undefined, html: isListType ? '<li></li>' : '' };
      }
    }
    pendingFocusRef.current = { id: newId, position: 'start' };
    onInsertBlock(afterIdx, blockDef);
  }, [docBlocks, onInsertBlock, onUpdateBlock]);

  const handleToggleCheck = useCallback((blockId) => {
    const block = docBlocks.find(b => b.id === blockId);
    if (block) onUpdateBlock(blockId, { checked: !block.checked });
  }, [docBlocks, onUpdateBlock]);

  const handleConvertToSubtype = useCallback((blockId, subtype) => {
    const isListType = subtype === 'bullet' || subtype === 'numbered';
    const initialHtml = isListType ? '<li></li>' : '';
    onUpdateBlock(blockId, { subtype, html: initialHtml });
    pendingFocusRef.current = { id: blockId, position: 'start' };
  }, [onUpdateBlock]);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    const pending = pendingFocusRef.current;
    const id = typeof pending === 'string' ? pending : pending.id;
    const position = typeof pending === 'string' ? 'start' : pending.position;
    const el = document.querySelector(`[data-text-id="${id}"]`);
    if (el) {
      el.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();
      // <ul>/<ol>은 첫/마지막 <li> 안으로 커서 이동
      const isListEl = el.tagName === 'UL' || el.tagName === 'OL';
      const targetEl = isListEl
        ? (position === 'end' ? el.querySelector('li:last-child') : el.querySelector('li')) ?? el
        : el;
      if (position === 'start') {
        const r = document.createRange();
        r.setStart(targetEl, 0);
        r.collapse(true);
        sel.addRange(r);
      } else if (position === 'end') {
        const r = document.createRange();
        r.selectNodeContents(targetEl);
        r.collapse(false);
        sel.addRange(r);
      } else if (position === 'offset') {
        // 텍스트 노드를 순회하며 charOffset 위치에 커서 배치
        let remaining = pending.charOffset;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let placed = false;
        let node;
        while ((node = walker.nextNode())) {
          if (remaining <= node.length) {
            const r = document.createRange();
            r.setStart(node, remaining);
            r.collapse(true);
            sel.addRange(r);
            placed = true;
            break;
          }
          remaining -= node.length;
        }
        if (!placed) {
          // fallback: 끝으로
          const r = document.createRange();
          r.selectNodeContents(el);
          r.collapse(false);
          sel.addRange(r);
        }
      }
      pendingFocusRef.current = null;
    }
  });

  // Ctrl+A 삭제 후 새 빈 블록에 포커스
  useEffect(() => {
    if (!pendingResetFocus.current) return;
    if (docBlocks.length === 1 && docBlocks[0].type === 'text') {
      const el = document.querySelector(`[data-text-id="${docBlocks[0].id}"]`);
      if (el) { el.focus(); pendingResetFocus.current = false; }
    }
  });

  const [hoveredBlockId,   setHoveredBlockId]   = useState(null);
  const [activeBlockId,    setActiveBlockId]    = useState(null);
  const [allSelected,      setAllSelected]      = useState(false);
  const [plusMenu,         setPlusMenu]         = useState(null); // { blockIdx, anchorRect }
  const pendingResetFocus  = useRef(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dropIdx,     setDropIdx]     = useState(null);
  const dragRef    = useRef(null);
  const blockRefs  = useRef([]);
  const paperRef   = useRef(null);

  // paper 위 mousemove로 hover 블록 감지 (핸들 영역 32px 포함)
  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const onMove = (e) => {
      let found = null;
      for (let i = 0; i < blockRefs.current.length; i++) {
        const el = blockRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
            e.clientX >= rect.left - 72 && e.clientX <= rect.right) {
          found = docBlocks[i]?.id ?? null;
          break;
        }
      }
      setHoveredBlockId(found);
    };
    const onLeave = () => setHoveredBlockId(null);
    paper.addEventListener('mousemove', onMove);
    paper.addEventListener('mouseleave', onLeave);
    return () => {
      paper.removeEventListener('mousemove', onMove);
      paper.removeEventListener('mouseleave', onLeave);
    };
  }, [docBlocks]);

  const getDropIndex = useCallback((clientY) => {
    let idx = docBlocks.length;
    for (let i = 0; i < blockRefs.current.length; i++) {
      const el = blockRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) { idx = i; break; }
    }
    return idx;
  }, [docBlocks.length]);

  const DRAG_THRESHOLD = 6; // px

  const handleDragHandleMouseDown = useCallback((e, idx, blockId) => {
    e.preventDefault();
    setActiveBlockId(blockId);
    dragRef.current = { fromIdx: idx, startX: e.clientX, startY: e.clientY, started: false };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { startX, startY, started, fromIdx } = dragRef.current;
      if (!started) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        dragRef.current.started = true;
        setDraggingIdx(fromIdx);
        setDropIdx(fromIdx);
      }
      setDropIdx(getDropIndex(e.clientY));
    };
    const onUp = (e) => {
      if (!dragRef.current) return;
      const { fromIdx, started } = dragRef.current;
      if (started) {
        const to = getDropIndex(e.clientY);
        if (to !== fromIdx && to !== fromIdx + 1) onReorderBlocks(fromIdx, to);
        setDraggingIdx(null);
        setDropIdx(null);
      }
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [getDropIndex, onReorderBlocks]);

  return (
    <>
      <FloatingToolbar />
      {plusMenu && (
        <BlockPlusMenu
          blockIdx={plusMenu.blockIdx}
          anchorRect={plusMenu.anchorRect}
          onInsert={handleInsertBlockFromMenu}
          onClose={() => setPlusMenu(null)}
        />
      )}

      <div
        ref={paperRef}
        className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10"
        style={{ width: docW, minHeight: docH, padding: pad }}
        onClick={(e) => { onDeselectWidget(e); setActiveBlockId(null); setAllSelected(false); }}
        onKeyDown={(e) => {
          const sel = window.getSelection();
          const container = e.currentTarget;

          // 드래그 핸들로 활성화된 블록에서 Backspace/Delete → 블록 삭제
          if (activeBlockId && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            const delId = activeBlockId;
            setActiveBlockId(null);
            onDeleteBlock(delId);
            return;
          }

          // Ctrl+A → 전체 블록 선택 상태
          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            sel.removeAllRanges();
            setAllSelected(true);
            setActiveBlockId(null);
            return;
          }

          // 전체 선택 상태에서 Backspace/Delete → 모든 블록 삭제 후 빈 블록 하나 유지
          if (allSelected && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
            setAllSelected(false);
            const allIds = docBlocks.map(b => b.id);
            pendingResetFocus.current = true;
            onDeleteBlocksInRange(null, allIds);
            return;
          }

          // 전체 선택 상태에서 다른 키 → 선택 해제 후 기본 동작
          if (allSelected) {
            setAllSelected(false);
          }

          // 크로스 블록 선택 Backspace
          if ((e.key === 'Backspace' || e.key === 'Delete') && sel && !sel.isCollapsed) {
            const editables = [...container.querySelectorAll('[contenteditable]')];
            const aIdx = editables.findIndex(el => el.contains(sel.anchorNode));
            const fIdx = editables.findIndex(el => el.contains(sel.focusNode));
            if (aIdx === -1 || fIdx === -1 || aIdx === fIdx) return;
            e.preventDefault();
            sel.removeAllRanges();
            const fromIdx   = Math.min(aIdx, fIdx);
            const toIdx     = Math.max(aIdx, fIdx);
            const keepId    = editables[fromIdx].getAttribute('data-text-id');
            const deleteIds = editables.slice(fromIdx + 1, toIdx + 1)
              .map(el => el.getAttribute('data-text-id')).filter(Boolean);
            onDeleteBlocksInRange(keepId, deleteIds);
            setTimeout(() => {
              const el = container.querySelector(`[data-text-id="${keepId}"]`);
              if (el) { el.innerHTML = ''; el.focus(); }
            }, 0);
          }
        }}
      >
        {draggingIdx !== null && dropIdx === 0 && (
          <div className="h-[2px] bg-primary rounded-full mb-1" />
        )}

        {docBlocks.map((block, i) => (
          <React.Fragment key={block.id}>
            <div
              ref={el => blockRefs.current[i] = el}
              style={{ marginBottom: docConfig.blockSpacing ?? 3 }}
              className={`relative rounded-[6px] transition-all duration-100
                ${draggingIdx === i
                  ? 'opacity-40 bg-[#e8f0fc] shadow-[0_2px_12px_rgba(53,113,206,0.18)] cursor-grabbing scale-[0.99]'
                  : allSelected || activeBlockId === block.id
                    ? 'bg-[#dce8ff]'
                    : ''}`}
            >
              {/* 드래그 핸들 + 추가(+) 버튼 — 마우스가 올라간 블록에 표시 */}
              {(() => {
                const isHovered = hoveredBlockId === block.id;
                return (
                  <div className={`absolute -left-[52px] top-[3px] flex items-center gap-[3px] transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {/* + 버튼 */}
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); setPlusMenu({ blockIdx: i, anchorRect: e.currentTarget.getBoundingClientRect() }); }}
                      className="w-[18px] h-[18px] flex items-center justify-center rounded text-[#8c959e] text-[15px] font-normal leading-none hover:bg-[#e2e6ea] hover:text-[#3d4a56] select-none transition-colors"
                    >+</button>
                    {/* 드래그 핸들 */}
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); window.getSelection()?.removeAllRanges(); handleDragHandleMouseDown(e, i, block.id); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#8c959e] cursor-grab active:cursor-grabbing"
                    >
                      <DragHandleIcon />
                    </div>
                  </div>
                );
              })()}

              {block.type === 'text' && block.subtype === 'todo' ? (
                <TodoListBlock
                  block={block}
                  onUpdateBlock={onUpdateBlock}
                  onEnterAfterBlock={handleEnterBlock}
                  onBackspaceAtStart={handleBackspaceAtStart}
                  onFocusBlock={() => setAllSelected(false)}
                  lineHeight={docConfig.lineHeight}
                  letterSpacing={docConfig.letterSpacing}
                />
              ) : block.type === 'text' ? (
                <TextBlock
                  block={block}
                  onChange={onUpdateText}
                  onDelete={onDeleteBlock}
                  onEnter={handleEnterBlock}
                  onArrow={handleArrow}
                  onBackspaceAtStart={handleBackspaceAtStart}
                  onFocusBlock={() => setAllSelected(false)}
                  onBlurBlock={() => {}}
                  isBlockActive={activeBlockId === block.id}
                  allSelected={allSelected}
                  bulletNumber={block.subtype === 'numbered'
                    ? docBlocks.slice(0, i).filter(b => b.subtype === 'numbered').length + 1
                    : null}
                  onConvertToSubtype={handleConvertToSubtype}
                  lineHeight={docConfig.lineHeight}
                  letterSpacing={docConfig.letterSpacing}
                />
              ) : block.type === 'table' ? (
                <TableBlock block={block} onUpdateBlock={onUpdateBlock} />
              ) : (
                <WidgetBlock
                  block={block}
                  config={config}
                  widgetDef={findWidgetDef(block.widgetId)}
                  isActive={selectedWidget?.instanceId === block.instanceId}
                  onClick={onCardClick}
                  onDelete={onDeleteBlock}
                />
              )}
            </div>

            {draggingIdx !== null && dropIdx === i + 1 && draggingIdx !== i && draggingIdx !== i + 1 && (
              <div className="h-[2px] bg-primary rounded-full my-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
