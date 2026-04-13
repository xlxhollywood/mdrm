'use client';

import { useRef, useState, useEffect } from 'react';
import WidgetPreview from '../../widgets/WidgetPreview';
import WidgetPlaceholder from '../WidgetPlaceholder';

export function DragHandleIcon() {
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

export function WidgetBlock({ block, config, widgetDef, isActive, onClick, onDelete }) {
  if (!widgetDef) return null;
  const cfg = config[block.instanceId] || {};
  const viewType    = cfg.viewType   || widgetDef.viewTypes[0]?.id;
  const showPreview = !widgetDef.hasSystemSelect || (cfg.systemIds?.length > 0);
  const showBorder  = cfg.showBorder !== false;
  const showLabel   = cfg.showLabel  !== false;

  return (
    <div className="flex items-start">
      <div
        className={`relative cursor-pointer rounded-[10px] ${isActive ? 'ring-2 ring-[#3571ce] ring-offset-2 shadow-[0_0_0_4px_rgba(53,113,206,0.12)]' : ''}`}
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

/* ── 행/열 구분선 포인트 버튼 ── */
function SepDot({ hovered, onClick, onEnter, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex items-center justify-center"
    >
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={e => { e.stopPropagation(); onClick(); }}
        className={`rounded-full transition-all duration-100 select-none flex items-center justify-center
          ${hovered
            ? 'w-[16px] h-[16px] bg-[#0056a4] text-white text-[10px] leading-none shadow-sm hover:bg-[#004a8f]'
            : 'w-[6px] h-[6px] bg-[#c8cdd3] cursor-default text-transparent'}`}
      >{hovered ? '+' : ''}</button>
    </div>
  );
}

export function TableBlock({ block, onUpdateBlock, onCellFocus, onFocusBlock, onAddRow, onAddCol }) {
  const { rows = 3, cols = 3, cells = {} } = block;
  const cellRefs    = useRef({});
  const colWidthsRef = useRef(null); // 드래그 중 최신 너비 추적
  const [activeCell,  setActiveCell]  = useState(null);
  const [hovSepRow,   setHovSepRow]   = useState(null);
  const [hovSepCol,   setHovSepCol]   = useState(null);
  const [colWidths,   setColWidths]   = useState(() =>
    block.colWidths ?? Array.from({ length: cols }, () => 100)
  );
  const [dragging,    setDragging]    = useState(null); // { col, startX, startWidth }

  /* 열 수 변경 시 colWidths 동기화 */
  useEffect(() => {
    setColWidths(prev => {
      if (prev.length === cols) return prev;
      if (prev.length < cols) return [...prev, ...Array.from({ length: cols - prev.length }, () => 100)];
      return prev.slice(0, cols);
    });
  }, [cols]);

  /* 행/열 삽입 후 DOM 콘텐츠 동기화 */
  useEffect(() => {
    Object.entries(cellRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const expected = cells[key] ?? '';
      if (el.innerHTML !== expected) el.innerHTML = expected;
    });
  }, [rows, cols]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 열 너비 드래그 리스너 */
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const delta = e.clientX - dragging.startX;
      const w = Math.max(50, dragging.startWidth + delta);
      setColWidths(prev => {
        const next = [...prev];
        next[dragging.col] = w;
        colWidthsRef.current = next;
        return next;
      });
    };
    const onUp = () => {
      if (colWidthsRef.current) onUpdateBlock(block.id, { colWidths: colWidthsRef.current });
      setDragging(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [dragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusCell = (r, c) => {
    const el = cellRefs.current[`${r},${c}`];
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  return (
    <div className="py-1 overflow-x-auto" style={{ cursor: dragging ? 'col-resize' : undefined }}>
      <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 16 }} />
          {Array.from({ length: cols }, (_, c) => (
            <col key={c} style={{ width: colWidths[c] ?? 100 }} />
          ))}
        </colgroup>
        <tbody>
          {/* 상단 거터 행: 열 끝 구분 포인트 */}
          <tr key="top-gutter" style={{ height: 16 }}>
            <td style={{ padding: 0, border: 0 }} />
            {Array.from({ length: cols }, (_, c) => (
              <td key={c} style={{ padding: '0 2px 0 0', border: 0 }}>
                <div className="h-full flex items-center justify-end">
                  <SepDot
                    hovered={hovSepCol === c}
                    onClick={() => onAddCol?.(block.id, c)}
                    onEnter={() => setHovSepCol(c)}
                    onLeave={() => setHovSepCol(null)}
                  />
                </div>
              </td>
            ))}
          </tr>

          {/* 실제 행들 */}
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {/* 좌측 거터: 행 끝 구분 포인트 */}
              <td style={{ padding: '0 0 2px 0', border: 0, verticalAlign: 'bottom' }}>
                <div className="flex items-center justify-center">
                  <SepDot
                    hovered={hovSepRow === r}
                    onClick={() => onAddRow?.(block.id, r)}
                    onEnter={() => setHovSepRow(r)}
                    onLeave={() => setHovSepRow(null)}
                  />
                </div>
              </td>

              {/* 실제 셀들 */}
              {Array.from({ length: cols }, (_, c) => {
                const key      = `${r},${c}`;
                const isHeader = r === 0;
                const isActive = activeCell?.r === r && activeCell?.c === c;
                return (
                  <td
                    key={c}
                    className={`relative border border-[#d9dfe5]
                      ${isHeader ? 'bg-[#f5f5f5]' : ''}`}
                    style={{ outline: isActive ? '2px solid #0056a4' : 'none', outlineOffset: '-2px' }}
                  >
                    <div
                      ref={el => {
                        if (el) {
                          cellRefs.current[key] = el;
                          if (!el.dataset.init) { el.dataset.init = '1'; el.innerHTML = cells[key] || ''; }
                        }
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      data-cell-id={`${block.id}-${r}-${c}`}
                      className={`outline-none text-[13px] min-h-[20px] px-2 py-1 ${isHeader ? 'font-semibold' : ''}`}
                      style={{ color: '#1a222b' }}
                      onFocus={() => {
                        setActiveCell({ r, c });
                        onCellFocus?.(block.id, r, c);
                        onFocusBlock?.();
                      }}
                      onBlur={() => setActiveCell(null)}
                      onInput={e => onUpdateBlock(block.id, { cells: { ...cells, [key]: e.currentTarget.innerHTML } })}
                      onKeyDown={e => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          if (e.shiftKey) {
                            if (c > 0)      focusCell(r, c - 1);
                            else if (r > 0) focusCell(r - 1, cols - 1);
                          } else {
                            if (c < cols - 1)      focusCell(r, c + 1);
                            else if (r < rows - 1) focusCell(r + 1, 0);
                            else {
                              onUpdateBlock(block.id, { rows: rows + 1 });
                              setTimeout(() => focusCell(rows, 0), 30);
                            }
                          }
                          return;
                        }
                        if (e.key === 'ArrowUp')   { e.preventDefault(); if (r > 0)          focusCell(r - 1, c); return; }
                        if (e.key === 'ArrowDown')  { e.preventDefault(); if (r < rows - 1)   focusCell(r + 1, c); return; }
                        if (e.key === 'ArrowLeft')  { if (c === 0 && r > 0) { e.preventDefault(); focusCell(r - 1, cols - 1); } return; }
                        if (e.key === 'ArrowRight') { if (c === cols - 1 && r < rows - 1) { e.preventDefault(); focusCell(r + 1, 0); } return; }
                      }}
                    />

                    {/* 열 너비 조절 핸들 (헤더 행만) */}
                    {isHeader && (
                      <div
                        onMouseDown={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragging({ col: c, startX: e.clientX, startWidth: colWidths[c] ?? 100 });
                        }}
                        className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize z-10 group"
                      >
                        <div className={`w-full h-full transition-colors
                          ${dragging?.col === c ? 'bg-[#0056a4]' : 'group-hover:bg-[#0056a4]/40'}`}
                        />
                      </div>
                    )}
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
