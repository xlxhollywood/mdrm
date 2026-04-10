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

/* ── 서식 툴바 ── */
function WordToolbar() {
  const [fontSize,  setFontSize]  = useState(14);
  const [textColor, setTextColor] = useState('#1a222b');
  const [hlColor,   setHlColor]   = useState('#fef08a');
  const savedRangeRef = useRef(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const r = savedRangeRef.current;
    if (!r) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  };
  const exec = (cmd, val = null) => { restoreSelection(); document.execCommand(cmd, false, val); };

  const applyFontSize = (px) => {
    restoreSelection();
    document.execCommand('fontSize', false, '7');
    document.querySelectorAll('[contenteditable] font[size="7"]').forEach(el => {
      const span = document.createElement('span');
      span.style.fontSize = px + 'px';
      el.parentNode.insertBefore(span, el);
      while (el.firstChild) span.appendChild(el.firstChild);
      el.parentNode.removeChild(el);
    });
  };

  const mb = (fn) => (e) => { e.preventDefault(); fn(); };

  const ToolBtn = ({ children, title, onMD }) => (
    <button title={title} onMouseDown={mb(onMD)}
      className="w-7 h-7 flex items-center justify-center rounded text-dark hover:bg-[#f0f4fa] transition-colors shrink-0">
      {children}
    </button>
  );
  const Sep = () => <div className="w-px h-4 bg-border mx-1 shrink-0" />;

  return (
    <div className="w-full bg-white border-b border-border flex items-center gap-0.5 px-3 py-1.5 shadow-sm shrink-0 flex-wrap">
      <select defaultValue="default"
        onChange={(e) => { restoreSelection(); document.execCommand('fontName', false, e.target.value); }}
        className="h-7 text-[11px] border border-border rounded px-1.5 text-dark bg-white outline-none focus:border-primary mr-1 shrink-0">
        <option value="'Apple SD Gothic Neo', sans-serif">기본</option>
        <option value="'Malgun Gothic', sans-serif">고딕</option>
        <option value="serif">바탕</option>
        <option value="monospace">Mono</option>
      </select>

      <div className="flex items-center gap-0.5 mr-1">
        <button onMouseDown={mb(() => { const s = Math.max(8, fontSize-1); setFontSize(s); applyFontSize(s); })}
          className="w-5 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] text-dark text-[15px] shrink-0 leading-none">−</button>
        <span className="w-8 text-center text-[11px] text-dark select-none">{fontSize}</span>
        <button onMouseDown={mb(() => { const s = Math.min(72, fontSize+1); setFontSize(s); applyFontSize(s); })}
          className="w-5 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] text-dark text-[15px] shrink-0 leading-none">+</button>
      </div>

      <Sep />
      <ToolBtn title="굵게"   onMD={() => exec('bold')}><strong className="text-[13px] font-bold">B</strong></ToolBtn>
      <ToolBtn title="기울임" onMD={() => exec('italic')}><em className="text-[13px]">I</em></ToolBtn>
      <ToolBtn title="밑줄"   onMD={() => exec('underline')}><span className="text-[13px] underline">U</span></ToolBtn>
      <ToolBtn title="취소선" onMD={() => exec('strikeThrough')}><span className="text-[13px] line-through">S</span></ToolBtn>
      <Sep />

      <label title="글자 색상" onMouseDown={saveSelection}
        className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] cursor-pointer shrink-0">
        <div className="flex flex-col items-center gap-[3px] pointer-events-none">
          <span className="text-[12px] font-bold text-dark leading-none">A</span>
          <span className="w-[14px] h-[3px] rounded-sm" style={{ background: textColor }} />
        </div>
        <input type="color" value={textColor}
          onChange={(e) => { setTextColor(e.target.value); exec('foreColor', e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>

      <label title="형광펜" onMouseDown={saveSelection}
        className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] cursor-pointer shrink-0">
        <div className="flex flex-col items-center gap-[3px] pointer-events-none">
          <span className="text-[10px] font-bold leading-none px-[3px] rounded-sm"
            style={{ background: hlColor, color: '#1a222b' }}>HI</span>
        </div>
        <input type="color" value={hlColor}
          onChange={(e) => { setHlColor(e.target.value); exec('hiliteColor', e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>

      <Sep />
      <ToolBtn title="왼쪽 정렬"   onMD={() => exec('justifyLeft')}>
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M1 4h8M1 7h12M1 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </ToolBtn>
      <ToolBtn title="가운데 정렬" onMD={() => exec('justifyCenter')}>
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M3 4h8M1 7h12M3 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </ToolBtn>
      <ToolBtn title="오른쪽 정렬" onMD={() => exec('justifyRight')}>
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 1h12M5 4h8M1 7h12M5 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </ToolBtn>
    </div>
  );
}

/* ── 텍스트 블록 ── */
function TextBlock({ block, onChange, onDelete, onEnter, showPlaceholder }) {
  const ref = useRef(null);
  const isComposing = useRef(false);

  useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.innerHTML = block.html || '';
    }
  }, [block.html]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      e.preventDefault();
      onEnter(block.id);
    }
    // Shift+Enter → 기본 동작(줄바꿈) 허용
  };

  return (
    <div className="flex items-start">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        data-text-id={block.id}
        data-placeholder={showPlaceholder ? '텍스트를 입력하세요...' : undefined}
        className="flex-1 min-h-[32px] text-[13px] text-dark outline-none px-1 py-0.5"
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
        onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity mt-0.5"
      >×</button>
    </div>
  );
}

/* ── 위젯 블록 ── */
function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType = cfg.viewType || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);

  return (
    <div className="flex items-start">
      <div
        className={`relative cursor-pointer rounded-[10px]
          ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
        onClick={(e) => { e.stopPropagation(); onClick(block.instanceId, widgetDef); }}
      >
        {showPreview
          ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />
          : <WidgetPlaceholder widgetDef={widgetDef} />}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity mt-2"
      >×</button>
    </div>
  );
}


/* ── Word 캔버스 ── */
export default function WordCanvas({
  docBlocks, config, selectedWidget, docConfig, findWidgetDef,
  onCardClick, onDeleteBlock, onUpdateText, onDeselectWidget, onReorderBlocks, onInsertText, onDeleteBlocksInRange,
}) {
  const paper = PAPER_SIZES[docConfig.paperSize] || PAPER_SIZES.A4;
  const isLand = docConfig.orientation === 'landscape';
  const docW = isLand ? paper.h : paper.w;
  const docH = isLand ? paper.w : paper.h;
  const m = docConfig.margins;
  const pad = `${Math.round(m.top * MM_TO_PX)}px ${Math.round(m.right * MM_TO_PX)}px ${Math.round(m.bottom * MM_TO_PX)}px ${Math.round(m.left * MM_TO_PX)}px`;

  /* 블록 드래그 재정렬 */
  const pendingFocusRef = useRef(null);

  // Enter 키 → 현재 블록 다음에 새 텍스트 블록 생성 후 포커스
  const handleEnterBlock = useCallback((blockId) => {
    const idx = docBlocks.findIndex(b => b.id === blockId);
    const newId = `text-${Date.now()}`;
    pendingFocusRef.current = newId;
    onInsertText(idx, newId);
  }, [docBlocks, onInsertText]);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    const el = document.querySelector(`[data-text-id="${pendingFocusRef.current}"]`);
    if (el) { el.focus(); pendingFocusRef.current = null; }
  });

  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dropIdx,     setDropIdx]     = useState(null);
  const dragRef    = useRef(null);   // { fromIdx }
  const blockRefs  = useRef([]);     // DOM refs per block

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

  const handleDragHandleMouseDown = useCallback((e, idx) => {
    e.preventDefault();
    dragRef.current = { fromIdx: idx };
    setDraggingIdx(idx);
    setDropIdx(idx);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      setDropIdx(getDropIndex(e.clientY));
    };
    const onUp = (e) => {
      if (!dragRef.current) return;
      const { fromIdx } = dragRef.current;
      const to = getDropIndex(e.clientY);
      if (to !== fromIdx && to !== fromIdx + 1) {
        onReorderBlocks(fromIdx, to);
      }
      dragRef.current = null;
      setDraggingIdx(null);
      setDropIdx(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [getDropIndex, onReorderBlocks]);

  return (
    <>
      <WordToolbar />
      <div
        className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10"
        style={{ width: docW, minHeight: docH, padding: pad }}
        onClick={onDeselectWidget}
        onKeyDown={(e) => {
          const sel = window.getSelection();
          const container = e.currentTarget;

          // Ctrl+A → 전체 선택
          if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            const editables = container.querySelectorAll('[contenteditable]');
            if (!editables.length) return;
            const first = editables[0];
            const last  = editables[editables.length - 1];
            const range = document.createRange();
            range.setStart(first, 0);
            range.setEnd(last, last.childNodes.length);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }

          // Backspace/Delete + 크로스 블록 선택
          if ((e.key === 'Backspace' || e.key === 'Delete') && sel && !sel.isCollapsed) {
            const editables = [...container.querySelectorAll('[contenteditable]')];
            const aIdx = editables.findIndex(el => el.contains(sel.anchorNode));
            const fIdx = editables.findIndex(el => el.contains(sel.focusNode));
            if (aIdx === -1 || fIdx === -1 || aIdx === fIdx) return;

            e.preventDefault();
            sel.removeAllRanges();

            const fromIdx  = Math.min(aIdx, fIdx);
            const toIdx    = Math.max(aIdx, fIdx);
            const keepId   = editables[fromIdx].getAttribute('data-text-id');
            const deleteIds = editables.slice(fromIdx + 1, toIdx + 1)
              .map(el => el.getAttribute('data-text-id'))
              .filter(Boolean);

            onDeleteBlocksInRange(keepId, deleteIds);
            setTimeout(() => {
              const el = container.querySelector(`[data-text-id="${keepId}"]`);
              if (el) { el.innerHTML = ''; el.focus(); }
            }, 0);
          }
        }}
      >
        {/* 맨 위 드롭 인디케이터 */}
        {draggingIdx !== null && dropIdx === 0 && (
          <div className="h-[2px] bg-primary rounded-full mb-1" />
        )}

        {docBlocks.map((block, i) => (
          <React.Fragment key={block.id}>
            <div
              ref={el => blockRefs.current[i] = el}
              className={`relative group rounded-[6px] transition-all duration-100
                ${draggingIdx === i
                  ? 'opacity-40 bg-[#e8f0fc] shadow-[0_2px_12px_rgba(53,113,206,0.18)] cursor-grabbing scale-[0.99]'
                  : ''}`}
            >
              {/* 드래그 핸들 */}
              <div
                onMouseDown={(e) => { e.stopPropagation(); handleDragHandleMouseDown(e, i); }}
                className="absolute -left-6 top-[6px] opacity-0 group-hover:opacity-50 hover:!opacity-100 cursor-grab active:cursor-grabbing text-muted transition-opacity select-none"
              >
                <DragHandleIcon />
              </div>

              {/* 블록 컨텐츠 */}
              {block.type === 'text' ? (
                <TextBlock
                  block={block}
                  onChange={onUpdateText}
                  onDelete={onDeleteBlock}
                  onEnter={handleEnterBlock}
                  showPlaceholder={i === 0 && docBlocks.length === 1}
                />
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

            {/* 드롭 인디케이터 */}
            {draggingIdx !== null && dropIdx === i + 1 && draggingIdx !== i && draggingIdx !== i + 1 && (
              <div className="h-[2px] bg-primary rounded-full my-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
