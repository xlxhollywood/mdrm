'use client';

import React, { useState, useRef } from 'react';
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
    <button
      title={title}
      onMouseDown={mb(onMD)}
      className="w-7 h-7 flex items-center justify-center rounded text-dark hover:bg-[#f0f4fa] transition-colors shrink-0"
    >{children}</button>
  );
  const Sep = () => <div className="w-px h-4 bg-border mx-1 shrink-0" />;

  return (
    <div className="w-full bg-white border-b border-border flex items-center gap-0.5 px-3 py-1.5 shadow-sm shrink-0 flex-wrap">

      <select
        defaultValue="default"
        onChange={(e) => { restoreSelection(); document.execCommand('fontName', false, e.target.value); }}
        className="h-7 text-[11px] border border-border rounded px-1.5 text-dark bg-white outline-none focus:border-primary mr-1 shrink-0"
      >
        <option value="'Apple SD Gothic Neo', sans-serif">기본</option>
        <option value="'Malgun Gothic', sans-serif">고딕</option>
        <option value="serif">바탕</option>
        <option value="monospace">Mono</option>
      </select>

      <div className="flex items-center gap-0.5 mr-1">
        <button
          onMouseDown={mb(() => { const s = Math.max(8, fontSize - 1); setFontSize(s); applyFontSize(s); })}
          className="w-5 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] text-dark text-[15px] shrink-0 leading-none"
        >−</button>
        <span className="w-8 text-center text-[11px] text-dark select-none">{fontSize}</span>
        <button
          onMouseDown={mb(() => { const s = Math.min(72, fontSize + 1); setFontSize(s); applyFontSize(s); })}
          className="w-5 h-7 flex items-center justify-center rounded hover:bg-[#f0f4fa] text-dark text-[15px] shrink-0 leading-none"
        >+</button>
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
function TextBlock({ block, onChange, onDelete }) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.innerHTML = block.html || '';
    }
  }, [block.html]);

  return (
    <div className="relative flex items-start group">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        data-placeholder="텍스트를 입력하세요..."
        className="flex-1 min-h-[32px] text-[13px] text-dark outline-none px-1 py-0.5"
        onInput={(e) => onChange(block.id, e.currentTarget.innerHTML)}
      />
      <button
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity"
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
    <div
      className={`relative flex items-start group cursor-pointer rounded-[10px]
        ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(block.instanceId, widgetDef); }}
    >
      {showPreview
        ? <WidgetPreview widgetId={widgetDef.id} viewType={viewType} />
        : <WidgetPlaceholder widgetDef={widgetDef} />}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
        className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center text-[#c0c7ce] hover:text-danger text-[14px] shrink-0 transition-opacity"
      >×</button>
    </div>
  );
}

/* ── 블록 사이 삽입 버튼 ── */
function BlockInsert({ onInsertText }) {
  return (
    <div
      onClick={onInsertText}
      className="flex items-center gap-2 py-1 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
    >
      <span className="flex-1 h-px bg-[#e4e8ee]" />
      <span className="w-5 h-5 rounded-full border border-[#c0c7ce] flex items-center justify-center text-[12px] text-[#c0c7ce] hover:border-primary hover:text-primary transition-colors">+</span>
      <span className="flex-1 h-px bg-[#e4e8ee]" />
    </div>
  );
}

/* ── Word 캔버스 ── */
export default function WordCanvas({ docBlocks, config, selectedWidget, docConfig, findWidgetDef, onCardClick, onDeleteBlock, onUpdateText, onInsertText, onDeselectWidget }) {
  const paper = PAPER_SIZES[docConfig.paperSize] || PAPER_SIZES.A4;
  const isLand = docConfig.orientation === 'landscape';
  const docW = isLand ? paper.h : paper.w;
  const docH = isLand ? paper.w : paper.h;
  const m = docConfig.margins;
  const pad = `${Math.round(m.top * MM_TO_PX)}px ${Math.round(m.right * MM_TO_PX)}px ${Math.round(m.bottom * MM_TO_PX)}px ${Math.round(m.left * MM_TO_PX)}px`;

  return (
    <>
      <WordToolbar />
      <div
        className="shrink-0 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] my-6 mb-10"
        style={{ width: docW, minHeight: docH, padding: pad }}
        onClick={onDeselectWidget}
      >
        {docBlocks.map((block, i) => (
          <React.Fragment key={block.id}>
            {block.type === 'text' ? (
              <TextBlock block={block} onChange={onUpdateText} onDelete={onDeleteBlock} />
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
            <BlockInsert onInsertText={() => onInsertText(i)} />
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
